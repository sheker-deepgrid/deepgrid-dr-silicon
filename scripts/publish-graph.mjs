// Publishes graphify's interactive graph (graphify-out/graph.html) as the site's Architecture Map
// (public/downloads/graph.html). graphify writes a page that loads vis-network from unpkg.com and is
// titled with its own output path; this points the library at the copy the site serves itself
// (scripts/copy-runtime.mjs) and gives the page a reader-facing title. Run after every /graphify.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/vis-network/package.json'), 'utf8')).version;
let html = fs.readFileSync(path.join(ROOT, 'graphify-out/graph.html'), 'utf8');
const swap = (re, to, what) => {
  const n = (html.match(re) || []).length;
  // a pattern that no longer matches would silently publish the CDN version again
  if (n !== 1) throw new Error(`${what}: expected exactly 1 match, found ${n}`);
  html = html.replace(re, to);
};
swap(/https:\/\/unpkg\.com\/vis-network@[\d.]+\/standalone\/umd\/vis-network\.min\.js/g, `../vendor/vis-network-${version}.min.js`, 'vis-network script');
swap(/<title>[^<]*<\/title>/g, '<title>DeepGrid knowledge graph</title>', 'page title');
if (/unpkg\.com|jsdelivr\.net|cdnjs/.test(html)) throw new Error('graph.html still references a CDN');
fs.writeFileSync(path.join(ROOT, 'public/downloads/graph.html'), html);
console.log(`published graph.html with vis-network ${version} served from the site`);
