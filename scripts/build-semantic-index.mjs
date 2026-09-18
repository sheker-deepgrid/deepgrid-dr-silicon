// Builds the semantic index Ask DeepGrid uses to match a question by meaning, not by shared words.
//
//   node scripts/build-semantic-index.mjs
//
// Run it whenever app/data/graphrag-unified-index.json or the executive themes change. It writes:
//   public/models/<MODEL>/...          the embedding model, served by the site itself (no CDN)
//   public/graphrag/semantic.bin       int8 vectors: every graph node, then every chunk, then every theme
//   public/graphrag/semantic.json      model, dims, row counts, and the hash of the index it was built from
//
// The browser embeds each question with the same model files, from the same origin, so documents and
// questions share one vector space. If the unified index is regenerated without re-running this script,
// its hash no longer matches and the page falls back to TF-IDF rather than scoring misaligned rows.
//
// Why MiniLM: on an 8-question test of reworded questions over the 177 PDF chunks it put the right
// material first 6/7 times (TF-IDF: 0/7), at 23 MB and ~4 ms a question. BGE-small and Gemini's
// embedding models scored within noise of it and are either larger or need a server.
//
// esbuild is used only to read the themes out of TypeScript; it is present through vite and wrangler.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild';
import {pipeline, env} from '@huggingface/transformers';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DTYPE = 'q8';                                   // onnx/model_quantized.onnx
const MODEL_FILES = ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model_quantized.onnx'];
const SCALE = 127;                                    // unit vectors stored as round(v * 127) in int8
const INDEX = path.join(ROOT, 'app/data/graphrag-unified-index.json');
const MODELS_DIR = path.join(ROOT, 'public/models');
const OUT_DIR = path.join(ROOT, 'public/graphrag');

// 1. The model: fetch once into public/models, then load only from there.
if (!MODEL_FILES.every(f => fs.existsSync(path.join(MODELS_DIR, MODEL, f)))) {
  env.cacheDir = path.join(ROOT, 'node_modules/.cache/semantic-models');
  await pipeline('feature-extraction', MODEL, {dtype: DTYPE});
  for (const f of MODEL_FILES) {
    const from = path.join(env.cacheDir, MODEL, f), to = path.join(MODELS_DIR, MODEL, f);
    fs.mkdirSync(path.dirname(to), {recursive: true});
    fs.copyFileSync(from, to);
  }
}
env.allowRemoteModels = false;
env.localModelPath = MODELS_DIR + '/';
const extract = await pipeline('feature-extraction', MODEL, {dtype: DTYPE});

// 2. What to embed, in the order the engine indexes it.
const raw = fs.readFileSync(INDEX, 'utf8');
const index = JSON.parse(raw);
const bundled = path.join(ROOT, 'node_modules/.cache/semantic-engine.mjs');
await esbuild.build({entryPoints: [path.join(ROOT, 'app/data/graphrag-engine.ts')], bundle: true, platform: 'node',
  format: 'esm', outfile: bundled, logLevel: 'warning'});
const {executiveThemes, semanticRowKey} = await import(bundled + '?t=' + Date.now());

const cap = (s, n) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
const texts = [
  ...index.nodes.map(n => cap(`${n.name}. ${n.description || ''}`, 1000)),
  ...index.chunks.map(c => cap(`${c.docTitle}. ${c.section || ''}. ${c.text}`, 2000)),
  ...executiveThemes.map(t => cap(`${t.title}. ${t.lead} ${t.keywords.join(', ')}`, 2000)),
];

// 3. Embed, normalise, quantise.
const t0 = Date.now(), vectors = [];
for (let i = 0; i < texts.length; i += 32) {
  const out = await extract(texts.slice(i, i + 32), {pooling: 'mean', normalize: true});
  vectors.push(...out.tolist());
}
const dims = vectors[0].length;
const bin = new Int8Array(vectors.length * dims);
vectors.forEach((v, r) => v.forEach((x, c) => { bin[r * dims + c] = Math.max(-127, Math.min(127, Math.round(x * SCALE))); }));

// 4. Check the int8 copy still ranks like the float vectors before trusting it.
let worst = 0;
for (let k = 0; k < 50; k++) {
  const a = Math.floor(Math.random() * vectors.length), b = Math.floor(Math.random() * vectors.length);
  let f = 0, q = 0;
  for (let c = 0; c < dims; c++) { f += vectors[a][c] * vectors[b][c]; q += bin[a * dims + c] * bin[b * dims + c]; }
  worst = Math.max(worst, Math.abs(f - q / (SCALE * SCALE)));
}
if (worst > 0.02) throw new Error(`int8 quantisation error ${worst.toFixed(4)} exceeds 0.02`);

fs.mkdirSync(OUT_DIR, {recursive: true});
fs.writeFileSync(path.join(OUT_DIR, 'semantic.bin'), Buffer.from(bin.buffer));
const meta = {
  model: MODEL, dtype: DTYPE, dims, scale: SCALE,
  counts: {nodes: index.nodes.length, chunks: index.chunks.length, themes: executiveThemes.length},
  themeTitles: executiveThemes.map(t => t.title),
  indexSha256: crypto.createHash('sha256').update(raw).digest('hex'),
  // what the browser checks: the same string, built by the engine, hashed with SHA-256
  rowKeySha256: crypto.createHash('sha256').update(semanticRowKey()).digest('hex'),
  modelSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(MODELS_DIR, MODEL, 'onnx/model_quantized.onnx'))).digest('hex'),
};
fs.writeFileSync(path.join(OUT_DIR, 'semantic.json'), JSON.stringify(meta, null, 1) + '\n');
console.log(`semantic index: ${vectors.length} rows x ${dims} dims (${meta.counts.nodes} nodes, ${meta.counts.chunks} chunks, ` +
  `${meta.counts.themes} themes), ${(bin.length / 1024).toFixed(0)} KB, int8 error <= ${worst.toFixed(4)}, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
