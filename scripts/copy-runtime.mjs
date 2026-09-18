// Copies the third-party runtime files the site serves itself, so no page depends on a CDN:
//   public/ort/     the ONNX runtime Ask DeepGrid's in-browser embedding model runs on (else jsDelivr)
//   public/vendor/  vis-network for the Architecture Map graph (else unpkg), see scripts/publish-graph.mjs
// Both come from node_modules (pinned by package-lock), so they are copied at build, not committed.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.join(ROOT, 'node_modules/onnxruntime-web/dist'), to = path.join(ROOT, 'public/ort');
fs.mkdirSync(to, {recursive: true});
for (const f of ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs']) {
  if (!fs.existsSync(path.join(from, f))) throw new Error(`missing ${f} in onnxruntime-web/dist`);
  fs.copyFileSync(path.join(from, f), path.join(to, f));
}
console.log(`runtime copied to public/ort (${(fs.statSync(path.join(to, 'ort-wasm-simd-threaded.wasm')).size / 1048576).toFixed(1)} MB wasm)`);
const vis = path.join(ROOT, 'node_modules/vis-network/standalone/umd/vis-network.min.js');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/vis-network/package.json'), 'utf8')).version;
fs.mkdirSync(path.join(ROOT, 'public/vendor'), {recursive: true});
fs.copyFileSync(vis, path.join(ROOT, `public/vendor/vis-network-${version}.min.js`));
console.log(`vis-network ${version} copied to public/vendor`);
