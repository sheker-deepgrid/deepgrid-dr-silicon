// GraphRAG proxy for Ask DeepGrid. The site is static, so a model key in the page would be readable
// by every visitor. The key lives here as a Worker secret instead, and the page sends only a question.
//
// The Worker runs the same deterministic graph walk the page runs (queryGraphify) and builds the
// prompt itself (buildRagPrompt), so the key can only answer questions grounded in DeepGrid's graph:
// a caller cannot hand it an arbitrary prompt. Browsers are held to an origin allowlist and every
// caller to a per-IP rate limit; model output is capped.
import {queryGraphify, buildRagPrompt} from '../../../app/data/deepgrid-graph-search';

interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS: string;          // comma-separated
  MODELS?: string;                  // comma-separated, tried in order; defaults below
  LIMITER?: RateLimit;
}

// gemini-2.5-flash-lite is retired for new keys (404 as of 2026-09-18); Google names 3.5-flash-lite
const DEFAULT_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash-lite'];
const MAX_QUERY = 300;

// A thinking model spends hidden reasoning tokens out of maxOutputTokens: gemini-2.5-flash used 662
// of 700 thinking and returned MAX_TOKENS with no text at all. A synthesis over supplied context
// needs no reasoning, so 2.5 models run with thinking off; newer models, whose thinking is configured
// differently, get headroom instead of a parameter they might reject.
function genConfig(model: string) {
  return /gemini-2\.5/.test(model)
    ? {temperature: 0.2, maxOutputTokens: 700, thinkingConfig: {thinkingBudget: 0}}
    : {temperature: 0.2, maxOutputTokens: 2048};
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
    'Access-Control-Expose-Headers': 'X-GraphRAG-Model',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname !== '/synthesize') return new Response('not found', {status: 404});

    const cors = corsFor(req.headers.get('Origin'), env);
    if (!cors) return new Response('origin not allowed', {status: 403});
    if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});
    if (req.method !== 'POST') return json({error: 'method'}, 405, cors);

    if (env.LIMITER) {
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const {success} = await env.LIMITER.limit({key: ip});
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

    const graph = queryGraphify(query);
    if (!graph.subgraphNodes.length) return json({error: 'no-grounding'}, 422, cors);
    const prompt = buildRagPrompt(query, graph);

    const models = (env.MODELS || '').split(',').map(s => s.trim()).filter(Boolean);
    for (const model of models.length ? models : DEFAULT_MODELS) {
      // key in a header, never in the URL, so it cannot land in a log line
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY},
          body: JSON.stringify({
            contents: [{role: 'user', parts: [{text: prompt}]}],
            generationConfig: genConfig(model),
          }),
        },
      );
      if (upstream.ok && upstream.body) {
        return new Response(upstream.body, {
          headers: {...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-GraphRAG-Model': model},
        });
      }
      // 429 (quota), 404 (retired model) or 5xx: log why, never the key, and try the next model.
      // The page falls back to its own deterministic synthesis if all fail.
      const detail = (await upstream.text().catch(() => '')).slice(0, 300);
      console.warn(`graphrag upstream ${model} ${upstream.status}: ${detail}`);
    }
    return json({error: 'upstream-unavailable'}, 503, cors);
  },
} satisfies ExportedHandler<Env>;
