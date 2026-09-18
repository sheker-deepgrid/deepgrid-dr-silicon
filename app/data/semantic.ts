'use client';
// In-browser semantic search for Ask DeepGrid. The question is embedded on the visitor's device with the
// same model that embedded the graph at build time (scripts/build-semantic-index.mjs), then compared with
// every node, chunk and theme. No key, no server, no quota: the model, its runtime and the vectors are
// all served by the site itself, and nothing loads until someone uses Ask.
//
// Every failure resolves to null rather than throwing (no WebAssembly, a stale index, a network error),
// and the engine then ranks by TF-IDF exactly as before, so Ask always answers.
import {semanticRowKey, type SemanticScores} from './graphrag-engine';

type Meta = {model: string; dtype: string; dims: number; scale: number;
  counts: {nodes: number; chunks: number; themes: number; examples?: number}; rowKeySha256: string; modelSha256: string;
  queryPrefix?: string; exampleTheme?: number[]; themeMin?: number; themeGap?: number};
type Extractor = (texts: string[], opts: {pooling: 'mean'; normalize: boolean}) => Promise<{data: Float32Array}>;
export type Semantic = {scores: (question: string) => Promise<SemanticScores>};

let loading: Promise<Semantic | null> | null = null;

const siteUrl = (rel: string) => new URL(rel, document.baseURI).href;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

// The model is cached by transformers.js; the vectors and the runtime would otherwise be fetched again
// on every visit (3.1 MB). Each is cached under a key that changes whenever its content can change, so
// a stale copy is never served; without the Cache API this is a plain fetch.
async function cachedBytes(url: string, version: string): Promise<ArrayBuffer> {
  // the version goes in the query, not a #fragment: Cache API matching ignores fragments, so a
  // fragment key would hand back an older version's bytes
  const key = `${url}?v=${encodeURIComponent(version)}`;
  try {
    const cache = await caches.open('deepgrid-semantic');
    const hit = await cache.match(key);
    if (hit) return hit.arrayBuffer();
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const buf = await res.arrayBuffer();
    // drop copies from older versions before storing this one
    for (const req of await cache.keys()) if (req.url.split('?')[0] === url && req.url !== new Request(key).url) await cache.delete(req);
    await cache.put(key, new Response(buf.slice(0)));
    return buf;
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    return res.arrayBuffer();
  }
}

async function load(): Promise<Semantic | null> {
  try {
    if (typeof WebAssembly === 'undefined') return null;
    const meta = await fetch(siteUrl('./graphrag/semantic.json'), {cache: 'no-cache'})
      .then(r => r.ok ? r.json() as Promise<Meta> : Promise.reject(r.status));
    const bin = await cachedBytes(siteUrl('./graphrag/semantic.bin'), `${meta.rowKeySha256}.${meta.modelSha256}`);
    // stale index: rows would line up with the wrong nodes, so stay on TF-IDF
    if (meta.rowKeySha256 !== await sha256(semanticRowKey())) return null;
    const rows = new Int8Array(bin);
    const {nodes, chunks, themes} = meta.counts, examples = meta.counts.examples || 0, dims = meta.dims;
    const exampleTheme = meta.exampleTheme || [];
    if (rows.length !== (nodes + chunks + themes + examples) * dims || exampleTheme.length !== examples) return null;

    const {pipeline, env} = await import('@huggingface/transformers');
    env.allowRemoteModels = false;                    // the model comes from this site, never the HF hub
    env.allowLocalModels = true;
    env.localModelPath = siteUrl('./models/');
    const wasm = env.backends.onnx.wasm!;
    wasm.wasmPaths = siteUrl('./ort/');               // and the runtime, never jsDelivr
    wasm.numThreads = 1;                              // GitHub Pages is not cross-origin isolated
    // hand the runtime its binary from our cache; keyed by the runtime's own version, so an upgrade
    // can never pair new JavaScript with an old binary. Unknown version: let it fetch as usual.
    const ortVersion = (env.backends.onnx as {versions?: {web?: string}}).versions?.web;
    if (ortVersion) {
      try { wasm.wasmBinary = await cachedBytes(siteUrl('./ort/ort-wasm-simd-threaded.wasm'), ortVersion); } catch { /* fetch as usual */ }
    }
    const extract = await pipeline('feature-extraction', meta.model, {dtype: meta.dtype as 'q8'}) as unknown as Extractor;

    const block = (start: number, count: number, q: Float32Array) => {
      const out = new Float32Array(count), scale = meta.scale;
      for (let r = 0; r < count; r++) {
        let d = 0; const o = (start + r) * dims;
        for (let c = 0; c < dims; c++) d += q[c] * rows[o + c];
        out[r] = d / scale;
      }
      return out;
    };
    return {
      scores: async (question: string) => {
        // the model's own retrieval instruction for questions, recorded with the index (BGE: see the build script)
        const q = (await extract([(meta.queryPrefix || '') + question], {pooling: 'mean', normalize: true})).data;
        // a curated answer scores its best match: its own text or any of its example questions,
        // exactly as the routing eval scored it when the index was built
        const themeScores = block(nodes + chunks, themes, q);
        const ex = block(nodes + chunks + themes, examples, q);
        ex.forEach((v, k) => { const t = exampleTheme[k]; if (v > themeScores[t]) themeScores[t] = v; });
        return {nodes: block(0, nodes, q), chunks: block(nodes, chunks, q), themes: themeScores,
          themeMin: meta.themeMin, themeGap: meta.themeGap};
      },
    };
  } catch {
    return null;
  }
}

/** Loads the model, runtime and vectors once; later calls share the same promise. */
export function getSemantic(): Promise<Semantic | null> {
  if (!loading) loading = load();
  return loading;
}
