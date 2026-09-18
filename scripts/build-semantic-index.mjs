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
// Why BGE-small (measured on this corpus, 18 Sep 2026; 8 reworded questions over the 177 PDF chunks and a
// 25-question theme calibration set): right material in the top 3 for 17/24 (MiniLM-L6: 15/24, TF-IDF:
// 5/24), right chunk first for 5/7 reworded questions (MiniLM: 6/7, TF-IDF: 0/7), and 11/15 reworded
// questions reach their curated theme with none wrong (MiniLM: 13/15). A modest trade for 34 MB against
// MiniLM's 23 MB. Mean pooling beat CLS on every measure here, and the query instruction below helped.
// Changing MODEL means re-measuring and recalibrating SEMANTIC_THEME_MIN / _GAP in graphrag-engine.ts.
//
// esbuild is used only to read the themes out of TypeScript; it is present through vite and wrangler.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild';
import {pipeline, env} from '@huggingface/transformers';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'Xenova/bge-small-en-v1.5';
// BGE v1.5's retrieval instruction, prepended to questions only (documents are embedded bare).
// It goes into semantic.json so the browser always pairs the right instruction with the right model.
const QUERY_PREFIX = 'Represent this sentence for searching relevant passages: ';
const DTYPE = 'q8';                                   // onnx/model_quantized.onnx
const MODEL_FILES = ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model_quantized.onnx'];
const SCALE = 127;
const SAFE_FLOOR = {min: 0.30, gap: 0.06};           // only reported when the eval finds no safe setting                                    // unit vectors stored as round(v * 127) in int8
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
await esbuild.build({
  stdin: {contents: `export * from './app/data/graphrag-engine.ts'; export {THEME_EXAMPLES} from './app/data/theme-examples.ts';`,
    resolveDir: ROOT, loader: 'ts'},
  bundle: true, platform: 'node', format: 'esm', outfile: bundled, logLevel: 'warning'});
const {executiveThemes, semanticRowKey, executeGraphRAG, THEME_EXAMPLES} = await import(bundled + '?t=' + Date.now());

// Every curated answer needs example questions, and every example must belong to a real answer: a
// renamed theme would otherwise silently lose its examples.
const titles = executiveThemes.map(t => t.title);
const orphans = Object.keys(THEME_EXAMPLES).filter(k => !titles.includes(k));
const thin = titles.filter(t => (THEME_EXAMPLES[t] || []).length < 3);
if (orphans.length || thin.length) throw new Error(`theme-examples.ts out of step with executiveThemes:` +
  (orphans.length ? `\n  no such theme: ${orphans.join(' | ')}` : '') + (thin.length ? `\n  fewer than 3 examples: ${thin.join(' | ')}` : ''));
const examples = titles.flatMap((t, i) => THEME_EXAMPLES[t].map(q => ({q, theme: i})));

const cap = (s, n) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
const texts = [
  ...index.nodes.map(n => cap(`${n.name}. ${n.description || ''}`, 1000)),
  ...index.chunks.map(c => cap(`${c.docTitle}. ${c.section || ''}. ${c.text}`, 2000)),
  ...executiveThemes.map(t => cap(`${t.title}. ${t.lead} ${t.keywords.join(', ')}`, 2000)),
  // example questions are questions, so they get the query instruction, like a visitor's question
  ...examples.map(e => QUERY_PREFIX + e.q),
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

// 5. Routing eval, through the real engine, scored from the int8 rows exactly as the browser does.
const N = index.nodes.length, C = index.chunks.length, T = executiveThemes.length, X = examples.length;
const evalSet = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/ask-routing-eval.json'), 'utf8'));
const unknown = evalSet.cases.filter(c => c.expect !== null && !titles.includes(c.expect)).map(c => c.expect);
if (unknown.length) throw new Error(`ask-routing-eval.json expects themes that do not exist: ${[...new Set(unknown)].join(' | ')}`);
const leaked = evalSet.cases.filter(c => examples.some(e => e.q.trim().toLowerCase() === c.q.trim().toLowerCase()));
if (leaked.length) throw new Error(`eval questions copied into theme-examples.ts: ${leaked.map(c => c.q).join(' | ')}`);
const scoresFor = qv => {
  const row = r => { let d = 0; for (let c = 0; c < dims; c++) d += qv[c] * bin[r * dims + c]; return d / SCALE; };
  const nodes = Float32Array.from({length: N}, (_, i) => row(i)), chunks = Float32Array.from({length: C}, (_, i) => row(N + i));
  const themes = Float32Array.from({length: T}, (_, i) => row(N + C + i));
  examples.forEach((e, k) => { themes[e.theme] = Math.max(themes[e.theme], row(N + C + T + k)); });
  return {nodes, chunks, themes};
};
const evalScores = [];
for (const c of evalSet.cases) evalScores.push(scoresFor((await extract([QUERY_PREFIX + c.q], {pooling: 'mean', normalize: true})).data));
const run = (themeMin, themeGap) => {
  const r = {right: 0, wrong: [], forced: [], missed: []};
  evalSet.cases.forEach((c, i) => {
    const got = executeGraphRAG(c.q, {...evalScores[i], themeMin, themeGap}).contextualTitle;
    const routed = titles.includes(got) ? got : null;
    if (c.expect === null) { if (routed) r.forced.push(`${c.q} -> ${routed}`); }
    else if (routed === c.expect) r.right++;
    else if (routed) r.wrong.push(`${c.q} -> ${routed}`);
    else r.missed.push(c.q);
  });
  return r;
};
let pick = null;
for (let m = 30; m <= 85; m += 5) for (let g = 0; g <= 15; g++) {
  const r = run(m / 100, g / 100);
  if (r.wrong.length || r.forced.length) continue;
  // most correct; ties go to the larger gap, then the higher floor (the more conservative setting)
  if (!pick || r.right > pick.r.right || (r.right === pick.r.right && (g > pick.g || (g === pick.g && m > pick.m)))) pick = {m, g, r};
}
const positives = evalSet.cases.filter(c => c.expect !== null).length, negatives = evalSet.cases.length - positives;
if (!pick) { const r = run(SAFE_FLOOR.min, SAFE_FLOOR.gap);
  throw new Error(`routing eval: no threshold gives zero wrong and zero forced answers. At ${SAFE_FLOOR.min}/${SAFE_FLOOR.gap}:\n  wrong: ${r.wrong.join('\n  ')}\n  forced: ${r.forced.join('\n  ')}`); }
if (pick.r.right / positives < evalSet.minRecall) throw new Error(`routing eval: only ${pick.r.right}/${positives} reach their curated answer ` +
  `(floor ${evalSet.minRecall}). Missed:\n  ${pick.r.missed.join('\n  ')}\nAdd example questions like these to app/data/theme-examples.ts.`);

fs.mkdirSync(OUT_DIR, {recursive: true});
fs.writeFileSync(path.join(OUT_DIR, 'semantic.bin'), Buffer.from(bin.buffer));
const meta = {
  model: MODEL, dtype: DTYPE, dims, scale: SCALE, queryPrefix: QUERY_PREFIX,
  counts: {nodes: N, chunks: C, themes: T, examples: X},
  exampleTheme: examples.map(e => e.theme),
  themeMin: pick.m / 100, themeGap: pick.g / 100,
  eval: {positives, negatives, right: pick.r.right, wrong: 0, forced: 0, missed: pick.r.missed},
  themeTitles: executiveThemes.map(t => t.title),
  indexSha256: crypto.createHash('sha256').update(raw).digest('hex'),
  // what the browser checks: the same string, built by the engine, hashed with SHA-256
  rowKeySha256: crypto.createHash('sha256').update(semanticRowKey()).digest('hex'),
  modelSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(MODELS_DIR, MODEL, 'onnx/model_quantized.onnx'))).digest('hex'),
};
fs.writeFileSync(path.join(OUT_DIR, 'semantic.json'), JSON.stringify(meta, null, 1) + '\n');
console.log(`semantic index: ${vectors.length} rows x ${dims} dims (${meta.counts.nodes} nodes, ${meta.counts.chunks} chunks, ` +
  `${meta.counts.themes} themes, ${X} example questions), ${(bin.length / 1024).toFixed(0)} KB, int8 error <= ${worst.toFixed(4)}, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(`routing eval: ${pick.r.right}/${positives} reach their curated answer, 0 wrong, 0/${negatives} forced, at min ${meta.themeMin} / gap ${meta.themeGap}` +
  (pick.r.missed.length ? `\n  missed: ${pick.r.missed.join('\n  missed: ')}` : ''));
