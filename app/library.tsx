'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Download,Play} from 'lucide-react';
import {packages,fmtTime} from './library-data';

type Update=(changes:Record<string,string|undefined>)=>void;

export default function Library({pkgId,slide,onChange}:{pkgId:string;slide:number;onChange:Update}){
 const pkg=packages.find(p=>p.id===pkgId)||packages[0];
 const count=pkg.slides.length, n=Math.max(1,Math.min(count,slide||1));
 const video=useRef<HTMLVideoElement>(null), strip=useRef<HTMLDivElement>(null);
 const [playingSlide,setPlayingSlide]=useState(0);
 const src=(i:number)=>`${pkg.slideDir}/slide-${String(i).padStart(2,'0')}.webp`;
 const setSlide=(i:number)=>onChange({pkg:pkg.id,slide:String(Math.max(1,Math.min(count,i)))});
 // the film and the deck share slide numbers: follow the film while it plays
 useEffect(()=>{const v=video.current;if(!v)return;const tick=()=>{const t=v.currentTime;let cur=0;for(const s of pkg.segments)if(t>=s.start)cur=s.slide;setPlayingSlide(v.paused?0:cur);};v.addEventListener('timeupdate',tick);v.addEventListener('pause',tick);return()=>{v.removeEventListener('timeupdate',tick);v.removeEventListener('pause',tick);};},[pkg]);
 useEffect(()=>{setPlayingSlide(0);},[pkg.id]);
 useEffect(()=>{strip.current?.querySelector<HTMLElement>(`[data-slide="${n}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});},[n,pkg.id]);
 const seek=(t:number)=>{const v=video.current;if(!v)return;v.currentTime=t+0.01;v.play().catch(()=>{});v.scrollIntoView({block:'nearest'});};
 const playSlide=(i:number)=>{const s=pkg.segments.find(x=>x.slide===i);if(s)seek(s.start);};
 const activeChapter=pkg.chapters.findIndex(c=>{const cur=playingSlide||n;return cur>=c.slides[0]&&cur<=c.slides[1];});
 return <div className="dr-library">
  <div className="dr-lib-tabs" role="tablist" aria-label="Architecture package">{packages.map(p=><button key={p.id} role="tab" aria-selected={p.id===pkg.id} className={p.id===pkg.id?'active':''} onClick={()=>onChange({pkg:p.id,slide:undefined})}><span className="mono">{p.slides.length} SLIDES · {fmtTime(p.duration)} FILM</span><strong>{p.name}</strong><span>{p.summary}</span></button>)}</div>

  <section className="dr-lib-film" aria-label={`${pkg.name} architecture film`}>
   <div className="dr-film-frame"><video ref={video} key={pkg.film} controls preload="metadata" poster={pkg.poster} playsInline><source src={pkg.film} type="video/mp4"/><track kind="captions" src={pkg.captions} srcLang="en" label="English" default/></video></div>
   <aside className="dr-chapters"><p className="dr-lib-kicker">CHAPTERS</p><ol>{pkg.chapters.map((c,i)=><li key={c.title}><button className={i===activeChapter?'active':''} onClick={()=>{seek(c.start);setSlide(c.slides[0]);}}><span className="mono">{fmtTime(c.start)}</span><strong>{c.title}</strong><small>Slides {c.slides[0]}–{c.slides[1]}</small></button></li>)}</ol>
    <p className="dr-lib-note">Narrated walkthrough of the {pkg.name} architecture deck, slide for slide. Captions on by default.</p></aside>
  </section>

  <section className="dr-lib-deck" aria-label={`${pkg.name} architecture deck`}>
   <header><div><p className="dr-lib-kicker">CLIENT-READY DECK · EDITABLE POWERPOINT</p><h2>{pkg.headline}</h2></div><a className="primary" href={pkg.deck} download><Download size={17}/>Download the deck (.pptx)</a></header>
   <figure className="dr-deck-stage"><img key={src(n)} src={src(n)} alt={`${pkg.name} deck, slide ${n}: ${pkg.slides[n-1]}`} width={1600} height={900}/>
    <figcaption><span className="mono">SLIDE {String(n).padStart(2,'0')} / {count}</span><strong>{pkg.slides[n-1]}</strong></figcaption></figure>
   <div className="dr-deck-controls"><button aria-label="Previous slide" disabled={n===1} onClick={()=>setSlide(n-1)}><ArrowLeft size={18}/></button><button className="text-link" onClick={()=>playSlide(n)}><Play size={15}/>Play this slide in the film</button><button aria-label="Next slide" disabled={n===count} onClick={()=>setSlide(n+1)}><ArrowRight size={18}/></button></div>
   <div className="dr-thumbs" ref={strip} role="list" aria-label="All slides">{pkg.slides.map((t,i)=><button role="listitem" key={t} data-slide={i+1} className={(i+1===n?'active ':'')+(i+1===playingSlide?'playing':'')} onClick={()=>setSlide(i+1)} aria-label={`Slide ${i+1}: ${t}`} aria-current={i+1===n?'true':undefined}><img src={src(i+1)} alt="" loading="lazy" width={320} height={180}/><span>{String(i+1).padStart(2,'0')}</span></button>)}</div>
  </section>

  <section className="dr-lib-diagram" aria-label={`${pkg.name} architecture diagram`}>
   <div><p className="dr-lib-kicker">ARCHITECTURE DIAGRAM · DRAW.IO</p><h2>The whole {pkg.name} system on one page</h2><p>Component-flow diagram behind the deck, with the numbered data path. Open the source in draw.io to edit it.</p>
    <div className="dr-lib-links"><a className="text-link" href={pkg.diagram} target="_blank" rel="noreferrer">Open full size <ArrowUpRight size={16}/></a><a className="text-link" href={pkg.drawio} download>Diagram source (.drawio) <Download size={15}/></a><a className="text-link" href={pkg.guide} download>Architecture guide (.md) <Download size={15}/></a></div></div>
   <div className="figure-scroll"><img src={pkg.diagram} alt={`${pkg.name} system architecture diagram`} loading="lazy"/></div>
  </section>

  <section className="dr-lib-sources"><p className="dr-lib-kicker">BUILT FROM</p><ul>{pkg.sources.map(s=><li key={s}>{s}</li>)}</ul><p className="disclaimer">Investor-level content from Deepgrid Semi’s September 2026 design documents. Pre-silicon: figures are design values from simulation, static timing or analysis, labelled on each slide.</p></section>
 </div>;
}
