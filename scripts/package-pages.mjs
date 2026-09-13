import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source=path.join(root,'dist/client'), output=path.join(root,'dist/pages');
// PAGES_BASE is the URL path the site is served under; PAGES_DOMAIN writes a CNAME when set.
// github.io project site: PAGES_BASE=/deepgrid-dr-silicon/ PAGES_DOMAIN=
// custom domain:          PAGES_BASE=/                     PAGES_DOMAIN=dr.deepgridsemi.com
const base=(process.env.PAGES_BASE||'/deepgrid-dr-silicon/').replace(/\/?$/,'/').replace(/^\/?/,'/');
const domain=(process.env.PAGES_DOMAIN||'').trim();
fs.rmSync(output,{recursive:true,force:true});
fs.cpSync(source,output,{recursive:true});
if(base!=='/'){
 // The export emits scripts and styles under an absolute /_next/ prefix, which a project site cannot serve.
 // Vite's preload map lists deps as "_next/static/..." and its URL builder prepends "/", so those
 // need the base without its leading slash or every preload 404s beside the working import.
 const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(html|js|rsc|json|css)$/.test(file)){let text=fs.readFileSync(file,'utf8').replaceAll('/_next/',base+'_next/');if(file.endsWith('.js'))text=text.replaceAll('"_next/static/','"'+base.slice(1)+'_next/static/');fs.writeFileSync(file,text);}}};
 walk(output);
 const chunks=path.join(output,'_next/static/chunks');
 for(const f of fs.readdirSync(chunks).filter(f=>f.endsWith('.js')))if(fs.readFileSync(path.join(chunks,f),'utf8').includes('"_next/static/'))throw Error('Unprefixed preload dependency in '+f);
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
if(domain)fs.writeFileSync(path.join(output,'CNAME'),domain+'\n');
fs.writeFileSync(path.join(output,'build-info.json'),JSON.stringify({commit:process.env.GITHUB_SHA||'local',base,domain:domain||null,builtAt:new Date().toISOString()}));
const html=fs.readFileSync(path.join(output,'index.html'),'utf8');
let checked=0;
for(const [,ref] of html.matchAll(/(?:src|href)="([^"?#]+)"/g)){
 if(/^(https?:|data:|mailto:|#)/.test(ref))continue;
 if(ref.startsWith('/')&&!ref.startsWith(base))throw Error('Unprefixed asset: '+ref);
 const relative=ref.startsWith(base)?ref.slice(base.length):ref.replace(/^\.\//,'');
 if(!fs.existsSync(path.join(output,relative)))throw Error('Missing asset: '+ref);
 checked++;
}
const appSource=fs.readdirSync(path.join(root,'app')).filter(f=>/\.(tsx?|css)$/.test(f)).map(f=>fs.readFileSync(path.join(root,'app',f),'utf8')).join('\n');
// Every literal ./images|decks|media|downloads|diagrams path in the app must exist in the artifact,
// plus one slide image per film segment, since slide paths are built at runtime.
const images=[...new Set([...appSource.matchAll(/\.\/((?:images|decks|media|downloads|diagrams)\/[\w./-]+\.(?:webp|png|svg|jpg|mp4|vtt|pptx|drawio|md))/g)].map(m=>m[1]))];
for(const rel of images)if(!fs.existsSync(path.join(output,rel)))throw Error('Missing asset: '+rel);
for(const [film,dir] of [['dg32-lite-film.json','dg32-lite'],['dg32-2dom-film.json','dg32-2dom']]){
 const data=JSON.parse(fs.readFileSync(path.join(root,'app/data',film),'utf8'));
 for(const seg of data.segments){const f=path.join(output,'decks',dir,`slide-${String(seg.slide).padStart(2,'0')}.webp`);if(!fs.existsSync(f))throw Error('Missing slide image: '+f);}
}
if(checked<3)throw Error(`Only ${checked} entry references found; the export looks empty`);
console.log(`Pages package ready at base ${base}${domain?' for '+domain:''}: ${checked} entry references and ${images.length} asset paths verified.`);
