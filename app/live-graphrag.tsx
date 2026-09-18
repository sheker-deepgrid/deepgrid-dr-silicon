'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Sparkles} from 'lucide-react';
import {queryGraphify,streamGraphRAG} from './data/deepgrid-graph-search';

// Live GraphRAG under the verified answer. The verified answer stays the primary, deterministic,
// cited one; this is a model synthesis over the same knowledge graph, labelled as such, run only
// when the reader asks for it (the query updates on every keystroke, and a model call per keystroke
// would spend the key). The grounding trail is computed here with the same function the proxy runs,
// so what the reader sees is exactly what the model was given.
//
// The block exists only when the build is given NEXT_PUBLIC_GRAPHRAG_URL. That is a URL, not a
// secret: the key lives in the proxy.
const PROXY = process.env.NEXT_PUBLIC_GRAPHRAG_URL || '';

type State = 'idle' | 'streaming' | 'done' | 'fallback';

export default function LiveGraphRAG({query}:{query:string}){
 const graph=useMemo(()=>query.trim().length>=3?queryGraphify(query):null,[query]);
 const [state,setState]=useState<State>('idle');
 const [text,setText]=useState('');
 const abort=useRef<AbortController|null>(null);

 // a new question discards any answer (or stream) for the previous one
 useEffect(()=>{abort.current?.abort();setState('idle');setText('');},[query]);
 useEffect(()=>()=>abort.current?.abort(),[]);

 if(!PROXY||!graph||!graph.subgraphNodes.length) return null;

 const run=async()=>{
  abort.current?.abort();
  const ctl=new AbortController();abort.current=ctl;
  setState('streaming');setText('');
  const out=await streamGraphRAG(PROXY,query,t=>{if(!ctl.signal.aborted)setText(t);},ctl.signal);
  if(ctl.signal.aborted) return;
  if(out){setText(out);setState('done');}
  else{setText(graph.instantSynthesis);setState('fallback');}
 };

 const trail=graph.subgraphNodes.slice(0,10);
 return <section className="dr-live-rag" aria-labelledby="dr-live-rag-h">
  <div className="dr-live-rag-head">
   <span className="mono dr-live-rag-tag">LIVE GRAPHRAG · AI SYNTHESIS</span>
   <h3 id="dr-live-rag-h">Synthesize across the knowledge graph</h3>
   <p>A model answer drawn only from the {graph.subgraphNodes.length} graph entities below. Unlike the verified answer above, it is generated, so check it against the cited sources.</p>
  </div>
  <div className="dr-live-rag-trail">
   <span className="mono">GROUNDED IN</span>
   <ul>{trail.map(n=><li key={n.id}>{n.label}</li>)}{graph.subgraphNodes.length>trail.length&&<li className="dr-live-rag-more">+{graph.subgraphNodes.length-trail.length} more</li>}</ul>
  </div>
  {state==='idle'&&<button type="button" className="text-link dr-live-rag-run" onClick={run}><Sparkles size={16} aria-hidden="true"/>Synthesize with live GraphRAG</button>}
  <div className="dr-live-rag-out" aria-live="polite" aria-busy={state==='streaming'}>
   {state==='streaming'&&!text&&<p className="dr-live-rag-wait">Walking the graph and composing…</p>}
   {text&&<Rendered text={text}/>}
   {state==='fallback'&&<p className="dr-live-rag-note">Live synthesis is unavailable right now (quota or network), so this is the graph’s deterministic synthesis instead.</p>}
   {(state==='done'||state==='fallback')&&<button type="button" className="text-link dr-live-rag-run" onClick={run}>Run again</button>}
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
