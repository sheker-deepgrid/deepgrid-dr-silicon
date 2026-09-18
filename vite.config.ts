import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import {defineConfig} from 'vite';
export default defineConfig({
  css:{postcss:{plugins:[tailwindcss()]}},
  plugins:[vinext()],
  // Ask DeepGrid embeds questions in the browser (app/data/semantic.ts). transformers.js imports the
  // default onnxruntime-web entry, which bundles WebGPU and fetches a 20.6 MB runtime; the site only
  // needs the plain wasm build, 10.6 MB. scripts/copy-runtime.mjs serves that file from the site.
  resolve:{alias:[{find:/^onnxruntime-web$/,replacement:'onnxruntime-web/wasm'}]},
});
