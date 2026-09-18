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
  counts: {nodes: number; chunks: number; themes: number}; rowKeySha256: string};
type Extractor = (texts: string[], opts: {pooling: 'mean'; normalize: boolean}) => Promise<{data: Float32Array}>;
export type Semantic = {scores: (question: string) => Promise<SemanticScores>};

let loading: Promise<Semantic | null> | null = null;

const siteUrl = (rel: string) => new URL(rel, document.baseURI).href;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

async function load(): Promise<Semantic | null> {
  try {
    if (typeof WebAssembly === 'undefined') return null;
    const [meta, bin] = await Promise.all([
      fetch(siteUrl('./graphrag/semantic.json')).then(r => r.ok ? r.json() as Promise<Meta> : Promise.reject(r.status)),
      fetch(siteUrl('./graphrag/semantic.bin')).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)),
    ]);
    // stale index: rows would line up with the wrong nodes, so stay on TF-IDF
    if (meta.rowKeySha256 !== await sha256(semanticRowKey())) return null;
    const rows = new Int8Array(bin);
    const {nodes, chunks, themes} = meta.counts, dims = meta.dims;
    if (rows.length !== (nodes + chunks + themes) * dims) return null;

    const {pipeline, env} = await import('@huggingface/transformers');
    env.allowRemoteModels = false;                    // the model comes from this site, never the HF hub
    env.allowLocalModels = true;
    env.localModelPath = siteUrl('./models/');
    const wasm = env.backends.onnx.wasm!;
    wasm.wasmPaths = siteUrl('./ort/');               // and the runtime, never jsDelivr
    wasm.numThreads = 1;                              // GitHub Pages is not cross-origin isolated
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
        const q = (await extract([question], {pooling: 'mean', normalize: true})).data;
        return {nodes: block(0, nodes, q), chunks: block(nodes, chunks, q), themes: block(nodes + chunks, themes, q)};
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
