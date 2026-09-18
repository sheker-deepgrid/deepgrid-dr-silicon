// Guards Ask DeepGrid's semantic index before every site build (npm run build / build:pages, and CI).
// It needs no model: it checks hashes and the routing eval that `npm run build:semantic` recorded.
// It fails when:
//   - curated answers, their example questions, or the graph changed without rebuilding the index
//     (the page would otherwise fall back to TF-IDF, or worse, score against misaligned rows)
//   - the model files do not match the ones the index was built with
//   - the recorded routing eval shows a wrong or forced answer, or falls under its recall floor
// Each failure says what to run. This is what would have caught a model swap with stale thresholds.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const fail = msg => { console.error(`\nAsk DeepGrid semantic index check FAILED:\n  ${msg}\n`); process.exit(1); };

const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/graphrag/semantic.json'), 'utf8'));
const bin = fs.readFileSync(path.join(ROOT, 'public/graphrag/semantic.bin'));

const bundled = path.join(ROOT, 'node_modules/.cache/semantic-check.mjs');
await esbuild.build({stdin: {contents: `export {semanticRowKey} from './app/data/graphrag-engine.ts';`, resolveDir: ROOT, loader: 'ts'},
  bundle: true, platform: 'node', format: 'esm', outfile: bundled, logLevel: 'warning'});
const {semanticRowKey} = await import(bundled + '?t=' + Date.now());

if (sha(semanticRowKey()) !== meta.rowKeySha256)
  fail('the graph, curated answers or their example questions changed since the index was built.\n  Run: npm run build:semantic');
const rows = meta.counts.nodes + meta.counts.chunks + meta.counts.themes + (meta.counts.examples || 0);
if (bin.length !== rows * meta.dims) fail(`semantic.bin holds ${bin.length} bytes, expected ${rows * meta.dims}. Run: npm run build:semantic`);
const modelFile = path.join(ROOT, 'public/models', meta.model, 'onnx/model_quantized.onnx');
if (!fs.existsSync(modelFile)) fail(`model file missing: ${path.relative(ROOT, modelFile)}. Run: npm run build:semantic`);
if (sha(fs.readFileSync(modelFile)) !== meta.modelSha256) fail(`${meta.model} differs from the model the index was built with. Run: npm run build:semantic`);

const ev = meta.eval;
if (!ev) fail('the index carries no routing eval. Run: npm run build:semantic');
const floor = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/ask-routing-eval.json'), 'utf8')).minRecall;
if (ev.wrong || ev.forced) fail(`the routing eval recorded ${ev.wrong} wrong and ${ev.forced} forced curated answers.`);
if (ev.right / ev.positives < floor) fail(`the routing eval recorded ${ev.right}/${ev.positives} curated answers, under the ${floor} floor.`);

console.log(`semantic index ok: ${meta.model}, routing eval ${ev.right}/${ev.positives} curated, 0 wrong, 0/${ev.negatives} forced` +
  ` (min ${meta.themeMin} / gap ${meta.themeGap})`);
