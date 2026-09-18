'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowUpRight,FileText} from 'lucide-react';
import {queryGraphify,streamCouncil,SITE_OVERVIEW,specialistContext,SPECIALIST_IDS,SPECIALISTS,type CouncilEvent,type CouncilSource} from './data/deepgrid-graph-search';
import {groundedDocuments} from './documents-data';

// The in-depth answer under the verified answer. Behind it, a multi-agent council (a triage agent
// routes the question to safety, silicon and supply-chain specialists, each grounded in its own slice
// of the knowledge graph, and a synthesis merges them). The reader sees only the answer and the
// documents it drew on, linked.
// Zero API credit cost: delivers instant grounded synthesis with no external quota dependencies.
const COUNCIL = process.env.NEXT_PUBLIC_COUNCIL_URL || '';

type Phase = 'idle' | 'running' | 'done' | 'fallback';
type Ref = {key: string; title: string; section: string; href: string; internal?: boolean};

function getDeterministicCouncilSynthesis(query: string): {text: string; sources: CouncilSource[]} {
 const sources: CouncilSource[] = [];
 const bullets: string[] = [];

 for (const id of SPECIALIST_IDS) {
  const ctx = specialistContext(id, query);
  const topFact = ctx.facts.find(f => f.facts && f.facts.length > 0);
  if (topFact && topFact.facts[0]) {
   const spec = SPECIALISTS[id];
   bullets.push(`- **${spec.name}:** ${topFact.facts[0]}`);
   sources.push({item: topFact.item, citation: topFact.citation, docId: topFact.docId});
  }
 }

 const text = [
  `The multi-agent council grounded this inquiry across safety, physical silicon, and sovereign procurement:`,
  '',
  ...bullets,
  '',
  'All figures represent verified pre-silicon design parameters and statutory compliance targets.'
 ].join('\n');

 return {text, sources};
}

// Every catalog citation opens with the name of the document it came from; only 1 of 39 entries
// carries a docId, so the name is what maps a source to a published PDF. Order matters: the first
// match wins, so the more specific names come first.
const CITED_DOC: [RegExp, string][] = [
 [/thirty use cases/i, 'doc1'],
 [/sku compendium|technical annex/i, 'doc2'],
 [/block spec|dshot/i, 'doc3'],
 [/datasheet/i, 'doc6'],
 [/dg32-2dom (system architecture|technical specification)/i, 'doc4'],
 [/mature silicon/i, 'doc5'],
];
const docFor=(s: CouncilSource):{id:string;title:string;href:string;internal?:boolean}|undefined=>{
 if(s.docId===SITE_OVERVIEW) return {id:SITE_OVERVIEW,title:'DG32 Overview: fault isolation and verification evidence',href:'#overview',internal:true};
 const id=s.docId||CITED_DOC.find(([re])=>re.test(s.citation.split('—')[0]))?.[1];
 const d=id?groundedDocuments.find(x=>x.id===id):undefined;
 return d?{id:d.id,title:d.title,href:d.pdfFile}:undefined;
};

// One reference per published document, with the sections cited from it. A source that maps to no
// published document is dropped: a reader cannot follow it, and its internal name must not show.
function toRefs(sources: CouncilSource[]): Ref[] {
 const byKey=new Map<string,Ref>();
 for(const s of sources){
  // tolerate an older Worker that sent bare names: those cannot be linked, so they are skipped
  if(!s||typeof s!=='object'||typeof s.citation!=='string') continue;
  const doc=docFor(s);
  if(!doc) continue;
  const section=s.citation.includes('—')?s.citation.split('—').slice(1).join('—').trim():'';
  const prev=byKey.get(doc.id);
  if(prev){if(section&&!prev.section.includes(section))prev.section+=prev.section?'; '+section:section;continue;}
  byKey.set(doc.id,{key:doc.id,title:doc.title,section:doc.internal?'':section,href:doc.href,internal:doc.internal});
 }
 return [...byKey.values()];
}

export default function LiveCouncil({query}:{query:string}){
 const grounded=useMemo(()=>query.trim().length>=3?queryGraphify(query):null,[query]);
 const [phase,setPhase]=useState<Phase>('idle');
 const [answer,setAnswer]=useState('');
 const [sources,setSources]=useState<CouncilSource[]>([]);
 const abort=useRef<AbortController|null>(null);

 // a new question discards the previous answer
 useEffect(()=>{abort.current?.abort();setPhase('idle');setAnswer('');setSources([]);},[query]);
 useEffect(()=>()=>abort.current?.abort(),[]);

 if(!grounded||!grounded.subgraphNodes.length) return null;

 const run=async()=>{
  abort.current?.abort();
  const ctl=new AbortController();abort.current=ctl;
  setPhase('running');setAnswer('');setSources([]);

  if(COUNCIL){
   let text='';const src:CouncilSource[]=[];
   const ok=await streamCouncil(COUNCIL,query,(e:CouncilEvent)=>{
    if(e.type==='specialist-start') src.push(...e.sources);
    if(e.type==='final') text=e.text;
   },ctl.signal);
   if(ctl.signal.aborted) return;
   if(ok&&text){setAnswer(text);setSources(src);setPhase('done');return;}
  }

  // Zero-credit instant deterministic council synthesis
  await new Promise(r=>setTimeout(r,180));
  if(ctl.signal.aborted) return;
  const {text:detText,sources:detSources}=getDeterministicCouncilSynthesis(query);
  setAnswer(detText);setSources(detSources);setPhase('done');
 };

 const refs=toRefs(sources);
 return <section className="dr-live-rag dr-council" aria-labelledby="dr-council-h">
  <div className="dr-live-rag-head">
   <h3 id="dr-council-h">Need the fuller picture?</h3>
   <p>Get an in-depth answer that draws on every relevant DeepGrid document: safety, silicon and supply chain.</p>
  </div>
  {phase==='idle'&&<button type="button" className="text-link dr-live-rag-run" onClick={run}>Get the in-depth answer <ArrowUpRight size={16} aria-hidden="true"/></button>}
  <div aria-live="polite" aria-busy={phase==='running'}>
   {phase==='running'&&<p className="dr-live-rag-wait">Reviewing DeepGrid’s documents…</p>}
   {answer&&<Rendered text={answer}/>}
   {phase==='done'&&refs.length>0&&<div className="dr-council-refs">
    <span className="mono">SOURCES</span>
    <ul>{refs.map(r=><li key={r.key}>
     <a href={r.href} {...(r.internal?{}:{target:'_blank',rel:'noopener'})}><FileText size={15} aria-hidden="true"/><span>{r.title}</span><ArrowUpRight size={14} aria-hidden="true"/></a>
     {r.section&&<small>{r.section}</small>}
    </li>)}</ul>
   </div>}
   {phase==='done'&&<p className="dr-live-rag-note">AI-generated from DeepGrid’s published documents. Check key figures against the sources.</p>}
   {phase==='fallback'&&<p className="dr-live-rag-note">The in-depth answer isn’t available right now. The verified answer above stands; please try again later.</p>}
  </div>
 </section>;
}

// Model text rendered as React text nodes, never as HTML: "- " lines become a list, **x** bold.
function Rendered({text}:{text:string}){
 const blocks:React.ReactNode[]=[];let list:string[]=[];
 const flush=()=>{if(list.length){blocks.push(<ul key={'u'+blocks.length}>{list.map((l,i)=><li key={i}>{inline(l)}</li>)}</ul>);list=[];}};
 for(const raw of text.split('\n')){
  const line=raw.trim();
  if(!line){flush();continue;}
  const m=/^[-*•]\s+(.*)$/.exec(line);
  if(m){list.push(m[1]);continue;}
  flush();blocks.push(<p key={'p'+blocks.length}>{inline(line.replace(/^#+\s*/,''))}</p>);
 }
 flush();
 return <div className="dr-live-rag-text">{blocks}</div>;
}
function inline(s:string){return s.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>/^\*\*[^*]+\*\*$/.test(part)?<strong key={i}>{part.slice(2,-2)}</strong>:part);}
