// Copies the ONNX runtime Ask DeepGrid's in-browser embedding model runs on into public/ort/, so the
// site serves it itself. transformers.js would otherwise fetch it from the jsDelivr CDN. The file comes
// from node_modules (pinned by package-lock), so it is copied at build time rather than committed.
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
