import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source=path.join(root,'dist/client'), output=path.join(root,'dist/pages');
// Served from the apex of a custom domain, so assets stay at /_next/.
const domain='dr.deepgridsemi.com', base='/';
fs.rmSync(output,{recursive:true,force:true});
fs.cpSync(source,output,{recursive:true});
fs.writeFileSync(path.join(output,'.nojekyll'),'');
fs.writeFileSync(path.join(output,'CNAME'),domain+'\n');
fs.writeFileSync(path.join(output,'build-info.json'),JSON.stringify({commit:process.env.GITHUB_SHA||'local',domain,builtAt:new Date().toISOString()}));
const html=fs.readFileSync(path.join(output,'index.html'),'utf8');
let checked=0;
for(const [,ref] of html.matchAll(/(?:src|href)="([^"?#]+)"/g)){
 if(/^(https?:|data:|mailto:|#)/.test(ref))continue;
 const relative=ref.startsWith(base)?ref.slice(base.length):ref.replace(/^\.\//,'');
 if(!fs.existsSync(path.join(output,relative)))throw Error('Missing asset: '+ref);
 checked++;
}
const source_=fs.readdirSync(path.join(root,'app')).filter(f=>/\.(tsx?|css)$/.test(f)).map(f=>fs.readFileSync(path.join(root,'app',f),'utf8')).join('\n');
const images=[...new Set([...source_.matchAll(/\.\/images\/([\w.-]+\.(?:webp|png|svg))/g)].map(m=>m[1]))];
for(const img of images)if(!fs.existsSync(path.join(output,'images',img)))throw Error('Missing image: '+img);
if(checked<3)throw Error(`Only ${checked} entry references found; the export looks empty`);
console.log(`Pages package ready for ${domain}: ${checked} entry references and ${images.length} images verified.`);
