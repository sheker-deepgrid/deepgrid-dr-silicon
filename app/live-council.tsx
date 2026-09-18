'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Users} from 'lucide-react';
import {queryGraphify,streamCouncil,SPECIALISTS,type CouncilEvent,type CouncilUsage,type SpecialistId} from './data/deepgrid-graph-search';

// The live multi-agent council under the verified answer (the ADK triage pattern): a root agent routes
// the question to domain specialists, each answers from its own grounding, and the council merges
// them. The trajectory is the point: the reader sees the routing and why, what each specialist was
// grounded in, and the model, time and tokens every call cost. The verified answer above stays the
// primary, deterministic one; this is generated and says so. It runs on a click, because the query
// updates on every keystroke and a council is five model calls.
//
// The block exists only when the build is given NEXT_PUBLIC_COUNCIL_URL. That is a URL, not a
// secret: the model key lives in the Worker.
const COUNCIL = process.env.NEXT_PUBLIC_COUNCIL_URL || '';

type Phase = 'idle' | 'running' | 'done' | 'fallback';

export default function LiveCouncil({query}:{query:string}){
 const grounded=useMemo(()=>query.trim().length>=3?queryGraphify(query):null,[query]);
 const [phase,setPhase]=useState<Phase>('idle');
 const [events,setEvents]=useState<CouncilEvent[]>([]);
 const abort=useRef<AbortController|null>(null);

 // a new question discards the previous council
 useEffect(()=>{abort.current?.abort();setPhase('idle');setEvents([]);},[query]);
 useEffect(()=>()=>abort.current?.abort(),[]);

 if(!COUNCIL||!grounded||!grounded.subgraphNodes.length) return null;

 const run=async()=>{
  abort.current?.abort();
  const ctl=new AbortController();abort.current=ctl;
  setPhase('running');setEvents([]);
  let finished=false;
  const ok=await streamCouncil(COUNCIL,query,e=>{if(ctl.signal.aborted)return;if(e.type==='final')finished=true;setEvents(prev=>[...prev,e]);},ctl.signal);
  if(ctl.signal.aborted) return;
  setPhase(ok&&finished?'done':'fallback');
 };

 const triage=events.find((e):e is Extract<CouncilEvent,{type:'triage'}>=>e.type==='triage');
 const final=events.find((e):e is Extract<CouncilEvent,{type:'final'}>=>e.type==='final');
 const done=events.find((e):e is Extract<CouncilEvent,{type:'done'}>=>e.type==='done');
 const spec=(id:SpecialistId)=>({
  start:events.find((e):e is Extract<CouncilEvent,{type:'specialist-start'}>=>e.type==='specialist-start'&&e.id===id),
  answer:events.find((e):e is Extract<CouncilEvent,{type:'specialist'}>=>e.type==='specialist'&&e.id===id),
  failed:events.some(e=>e.type==='specialist-error'&&e.id===id),
 });
 const usages=[triage?.usage,...events.map(e=>e.type==='specialist'?e.usage:undefined),final?.usage].filter((u):u is CouncilUsage=>!!u);
 const tokens=usages.reduce((n,u)=>n+u.tokensIn+u.tokensOut,0);
 const models=[...new Set(usages.map(u=>u.model))];

 return <section className="dr-live-rag dr-council" aria-labelledby="dr-council-h">
  <div className="dr-live-rag-head">
   <span className="mono dr-live-rag-tag">MULTI-AGENT COUNCIL · LIVE</span>
   <h3 id="dr-council-h">Put the question to the specialist council</h3>
   <p>A root agent routes the question to the specialists it needs. Each answers only from its own slice of the knowledge graph and the verified catalog, and the council merges them. Unlike the verified answer above, this is generated, so check it against the cited sources.</p>
  </div>
  {phase==='idle'&&<button type="button" className="text-link dr-live-rag-run" onClick={run}><Users size={16} aria-hidden="true"/>Convene the council</button>}

  {phase!=='idle'&&<ol className="dr-council-trail" aria-busy={phase==='running'}>
   <li className={'dr-council-step'+(triage?' is-done':' is-now')}>
    <div className="dr-council-step-head"><span className="mono">ROOT TRIAGE</span>{triage?.usage?<Usage u={triage.usage}/>:triage?.fallback?<span className="dr-council-usage">keyword routing</span>:null}</div>
    {triage?<p>Routed to {triage.routes.map(r=>SPECIALISTS[r.id].name).join(' and ')}. {triage.reason}</p>:<p className="dr-live-rag-wait">Reading the question and choosing specialists…</p>}
   </li>
   {triage?.routes.map(r=>{const s=spec(r.id);return <li key={r.id} className={'dr-council-step'+(s.answer||s.failed?' is-done':' is-now')}>
    <div className="dr-council-step-head"><span className="mono">{SPECIALISTS[r.id].name.toUpperCase()}</span>{s.answer&&<Usage u={s.answer.usage}/>}</div>
    {r.subQuestion&&<p className="dr-council-sub">{r.subQuestion}</p>}
    {s.start&&<div className="dr-live-rag-trail"><span className="mono">GROUNDED IN</span><ul>{s.start.sources.map(x=><li key={'s'+x} className="dr-council-src">{x}</li>)}{s.start.grounding.map(x=><li key={'g'+x}>{x}</li>)}</ul></div>}
    {s.answer?<Rendered text={s.answer.text}/>:s.failed?<p className="dr-live-rag-note">This specialist could not answer (model unavailable).</p>:<p className="dr-live-rag-wait">Working from its grounding…</p>}
   </li>;})}
   {triage&&<li className={'dr-council-step dr-council-final'+(final?' is-done':' is-now')}>
    <div className="dr-council-step-head"><span className="mono">COUNCIL SYNTHESIS</span>{final&&<Usage u={final.usage}/>}</div>
    <div aria-live="polite">{final?<Rendered text={final.text}/>:phase==='running'?<p className="dr-live-rag-wait">Waiting for the specialists…</p>:null}</div>
   </li>}
  </ol>}

  {phase==='fallback'&&<div aria-live="polite"><Rendered text={grounded.instantSynthesis}/><p className="dr-live-rag-note">The council is unavailable right now (quota or network), so this is the graph’s deterministic synthesis instead.</p></div>}
  {(phase==='done'||phase==='fallback')&&<div className="dr-council-foot">
   {done&&<span className="mono">{usages.length} MODEL CALLS · {(done.ms/1000).toFixed(1)} S · {tokens.toLocaleString('en-US')} TOKENS · {models.join(', ')}</span>}
   <button type="button" className="text-link dr-live-rag-run" onClick={run}>Convene again</button>
  </div>}
 </section>;
}

function Usage({u}:{u:CouncilUsage}){return <span className="dr-council-usage">{u.model} · {(u.ms/1000).toFixed(1)}&nbsp;s · {(u.tokensIn+u.tokensOut).toLocaleString('en-US')}&nbsp;tokens</span>;}

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
