// Multi-agent GraphRAG council for Ask DeepGrid. The site is static, so a model key in the page is
// readable by every visitor; the key lives here as a Worker secret and the page sends only a question.
//
// The flow follows the ADK triage pattern: a root agent routes the question to domain specialists,
// each answers from its own grounding (a graph walk plus verified catalog facts, built here from the
// shared module), and a council synthesis merges them. Every step streams to the page as it happens,
// so the reader sees the trajectory: the routing and its reason, what each specialist was grounded in,
// and the model, time and tokens for every call. Prompts are built only here: a caller cannot hand
// the key an arbitrary prompt. Browsers are held to an origin allowlist, every caller to a per-IP
// rate limit, and a question that reaches nothing in the graph is refused before any model call.
import {
  queryGraphify, SPECIALISTS, SPECIALIST_IDS, specialistContext,
  buildTriagePrompt, buildSpecialistPrompt, buildSynthesisPrompt,
  type SpecialistId, type CouncilEvent, type CouncilUsage,
} from '../../../app/data/deepgrid-graph-search';

interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS: string;          // comma-separated
  MODELS?: string;                  // comma-separated, tried in order
  LIMITER?: RateLimit;
}

// gemini-3.8-flash first; it answers 503 "high demand" at times, so the chain stays current-generation.
// Thinking is off on every call: the hidden reasoning spends maxOutputTokens (2.5-flash used 662 of
// 700 and returned no text), and answering from supplied context needs none. thinkingBudget:0 is the
// control that behaved the same on 3.8 and 2.5; thinkingLevel:"low" still spent 401 tokens on 3.7.
const DEFAULT_MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
const MAX_QUERY = 300;
const CALL_TIMEOUT_MS = 12000;

const TRIAGE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    routes: {type: 'ARRAY', items: {type: 'OBJECT', properties: {
      id: {type: 'STRING', enum: SPECIALIST_IDS},
      subQuestion: {type: 'STRING'},
    }, required: ['id', 'subQuestion']}},
    reason: {type: 'STRING'},
  },
  required: ['routes', 'reason'],
};

async function generate(env: Env, prompt: string, maxOut: number, schema?: object): Promise<{text: string; usage: CouncilUsage} | null> {
  const models = (env.MODELS || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const model of models.length ? models : DEFAULT_MODELS) {
    const t0 = Date.now();
    // A busy model can take 20 s+ to succeed (3.8-flash took 22.3 s on one synthesis); a reader is
    // better served by the next model than by waiting, so every call gets a deadline.
    let res: Response;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
      method: 'POST',
      // key in a header, never in the URL, so it cannot land in a log line
      headers: {'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY},
      body: JSON.stringify({
        contents: [{role: 'user', parts: [{text: prompt}]}],
        generationConfig: {
          temperature: 0.2, maxOutputTokens: maxOut, thinkingConfig: {thinkingBudget: 0},
          ...(schema ? {responseMimeType: 'application/json', responseSchema: schema} : {}),
        },
      }),
    });
    } catch {
      console.warn(`council upstream ${model} timed out or failed after ${Date.now() - t0} ms`);
      continue;
    }
    if (!res.ok) {
      console.warn(`council upstream ${model} ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
      continue;
    }
    const d = await res.json() as {
      candidates?: {finishReason?: string; content?: {parts?: {text?: string}[]}}[];
      usageMetadata?: {promptTokenCount?: number; candidatesTokenCount?: number};
    };
    const c = d.candidates?.[0];
    const text = (c?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!text) { console.warn(`council upstream ${model} empty, finish=${c?.finishReason}`); continue; }
    return {text, usage: {model, ms: Date.now() - t0, tokensIn: d.usageMetadata?.promptTokenCount || 0, tokensOut: d.usageMetadata?.candidatesTokenCount || 0}};
  }
  return null;
}

// When triage fails, consult every specialist. Guessing scope from keywords is what failed: "safe"
// matched no safety term, only the defence specialist ran, and the answer called DG32 "safe" with no
// safety grounding at all. Three calls cost more than one; an unsupported claim costs more than that.
function allRoutes(q: string): {id: SpecialistId; subQuestion: string}[] {
  return SPECIALIST_IDS.map(id => ({id, subQuestion: q}));
}

function parseRoutes(text: string): {routes: {id: SpecialistId; subQuestion: string}[]; reason: string} | null {
  try {
    const d = JSON.parse(text) as {routes?: {id?: string; subQuestion?: string}[]; reason?: string};
    const seen = new Set<string>();
    const routes = (d.routes || []).filter(r => r.id && (SPECIALIST_IDS as string[]).includes(r.id) && !seen.has(r.id) && seen.add(r.id))
      .slice(0, 3).map(r => ({id: r.id as SpecialistId, subQuestion: String(r.subQuestion || '').slice(0, 240)}));
    return routes.length ? {routes, reason: String(d.reason || '').slice(0, 300)} : null;
  } catch {
    return null;
  }
}

async function council(env: Env, query: string, send: (e: CouncilEvent) => Promise<void>) {
  const t0 = Date.now();
  const triage = await generate(env, buildTriagePrompt(query), 400, TRIAGE_SCHEMA);
  const parsed = triage && parseRoutes(triage.text);
  const routes = parsed ? parsed.routes : allRoutes(query);
  await send(parsed
    ? {type: 'triage', routes, reason: parsed.reason, usage: triage!.usage}
    : {type: 'triage', routes, reason: 'All specialists consulted: the triage agent was unavailable.', fallback: true});

  const answers = (await Promise.all(routes.map(async ({id, subQuestion}) => {
    const ctx = specialistContext(id, subQuestion || query);
    await send({type: 'specialist-start', id, grounding: ctx.graph.subgraphNodes.slice(0, 8).map(n => n.label), sources: ctx.facts.map(f => ({item: f.item, citation: f.citation, docId: f.docId}))});
    const r = await generate(env, buildSpecialistPrompt(id, query, subQuestion || query, ctx), 500);
    if (!r) { await send({type: 'specialist-error', id}); return null; }
    await send({type: 'specialist', id, text: r.text, usage: r.usage});
    return {name: SPECIALISTS[id].name, text: r.text};
  }))).filter((a): a is {name: string; text: string} => !!a);

  if (!answers.length) { await send({type: 'error', stage: 'specialists'}); return; }
  const final = await generate(env, buildSynthesisPrompt(query, answers), 700);
  if (!final) { await send({type: 'error', stage: 'synthesis'}); return; }
  await send({type: 'final', text: final.text, usage: final.usage});
  await send({type: 'done', ms: Date.now() - t0});
}

const json = (body: unknown, status: number, cors: HeadersInit) =>
  new Response(JSON.stringify(body), {status, headers: {...cors, 'Content-Type': 'application/json'}});

function corsFor(origin: string | null, env: Env): HeadersInit | null {
  const allowed = env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname !== '/council') return new Response('not found', {status: 404});

    const cors = corsFor(req.headers.get('Origin'), env);
    if (!cors) return new Response('origin not allowed', {status: 403});
    if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});
    if (req.method !== 'POST') return json({error: 'method'}, 405, cors);

    if (env.LIMITER) {
      const {success} = await env.LIMITER.limit({key: req.headers.get('CF-Connecting-IP') || 'unknown'});
      if (!success) return json({error: 'rate-limited'}, 429, cors);
    }

    let query = '';
    try {
      const body = await req.json() as {query?: unknown};
      query = typeof body.query === 'string' ? body.query.trim() : '';
    } catch {
      return json({error: 'bad-json'}, 400, cors);
    }
    if (query.length < 3 || query.length > MAX_QUERY) return json({error: 'bad-query'}, 400, cors);
    if (!queryGraphify(query).subgraphNodes.length) return json({error: 'no-grounding'}, 422, cors);

    const {readable, writable} = new TransformStream<Uint8Array>();
    const writer = writable.getWriter(), enc = new TextEncoder();
    const send = (e: CouncilEvent) => writer.write(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
    ctx.waitUntil((async () => {
      try { await council(env, query, send); }
      catch (err) { console.warn(`council failed: ${String(err).slice(0, 200)}`); await send({type: 'error', stage: 'council'}).catch(() => {}); }
      finally { await writer.close().catch(() => {}); }
    })());
    return new Response(readable, {headers: {...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store'}});
  },
} satisfies ExportedHandler<Env>;
