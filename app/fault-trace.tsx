'use client';
import {useEffect,useRef,useState} from 'react';
import type {Step} from './detail-content';

// The site's signature move. On a desktop viewport the "how a fault is stopped" stage pins, and
// scrolling walks one wrong value through the chip: CHECKER disagrees, the comparator flags the
// store, the latch holds the first cause, FAULT_N turns the bridge off. The step rail jumps to any
// step. Phones, short viewports and reduced motion get the same content unpinned, in its final
// state, so nothing depends on scrolling to be read. The trace is decorative (aria-hidden): the
// step list beside it carries every word of it as text.

const PIN = '(min-width: 1100px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)';

export default function FaultTrace({steps,intro}:{steps:Step[];intro:React.ReactNode}){
 const wrap=useRef<HTMLDivElement>(null);
 const last=steps.length-1;
 const [pinned,setPinned]=useState(false);
 const [step,setStep]=useState(last);
 const geometry=()=>{const el=wrap.current!;const navH=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||59;const r=el.getBoundingClientRect();return {navH,top:r.top+scrollY,travel:Math.max(1,r.height-(innerHeight-navH)),r};};
 useEffect(()=>{
  const mq=matchMedia(PIN);let raf=0;
  const tick=()=>{raf=0;if(!wrap.current)return;const {navH,travel,r}=geometry();const p=Math.min(1,Math.max(0,(navH-r.top)/travel));setStep(Math.min(last,Math.floor(p*steps.length*0.999)));};
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(tick);};
  const apply=()=>{removeEventListener('scroll',onScroll);setPinned(mq.matches);if(mq.matches){addEventListener('scroll',onScroll,{passive:true});requestAnimationFrame(tick);}else setStep(last);};
  apply();mq.addEventListener('change',apply);
  return ()=>{mq.removeEventListener('change',apply);removeEventListener('scroll',onScroll);cancelAnimationFrame(raf);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[last]);
 const jump=(i:number)=>{
  setStep(i);
  if(pinned){
    const {navH,top,travel}=geometry();
    scrollTo({top:top-navH+travel*(i+0.5)/steps.length,behavior:'smooth'});
  }
 };
 return <div ref={wrap} className={'dr-fault'+(pinned?' is-pinned':'')} data-step={step} data-rv-skip="">
  <div className="dr-fault-stage">
   <div className="dr-fault-copy">{intro}</div>
   <div className="dr-fault-side">
    <Trace step={step} onJump={jump} steps={steps} interactive={pinned}/>
    <ol className="dr-fault-steps" aria-label="How a CPU fault is stopped">{steps.map(([t,d],i)=><li key={t} className={i===step?'is-now':i<step?'is-done':'is-next'} aria-current={pinned&&i===step?'step':undefined}>
     {/* a jump control only while pinned: unpinned there is nothing to jump, and one button spanning the
         number and title lands in the 2.8rem number column and squeezes the title to a word per line */}
     {pinned?<button type="button" className="dr-fault-jump" onClick={()=>jump(i)}><span className="dr-step-n">{String(i+1).padStart(2,'0')}</span><h4>{t}</h4></button>
      :<><span className="dr-step-n">{String(i+1).padStart(2,'0')}</span><h4>{t}</h4></>}
     <p>{d}</p></li>)}</ol>
   </div>
  </div>
 </div>;
}

// A trace block is a real <button> only while the trace is pinned, because only then does jumping to
// a step mean anything. Unpinned it is a plain block showing its final state.
function Node({i,cls,label,interactive,onJump,children}:{i:number;cls:string;label:string;interactive:boolean;onJump:(i:number)=>void;children:React.ReactNode}){
 return interactive
  ?<button type="button" className={cls+' tr-interactive'} onClick={()=>onJump(i)} aria-label={label} title={label}>{children}</button>
  :<div className={cls}>{children}</div>;
}

function Trace({step,onJump,steps,interactive}:{step:number;onJump:(i:number)=>void;steps:[string,string][];interactive:boolean}){
 const on=(n:number)=>step>=n?' on':'';
 const active=(n:number)=>step===n?' is-active-node':'';
 const rectRef = useRef<DOMRect | null>(null);
 const onEnter = (e: React.PointerEvent<HTMLDivElement>) => {
   rectRef.current = e.currentTarget.getBoundingClientRect();
 };
 const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
   if (!rectRef.current) rectRef.current = e.currentTarget.getBoundingClientRect();
   const r = rectRef.current;
   e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
   e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
 };
 const onLeave = () => {
   rectRef.current = null;
 };
 return <div className="dr-trace" aria-label="Cycle-accurate hardware fault trace schematic" onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave}>
  <div className="sr-only" aria-live="polite" aria-atomic="true">
   {`Active hardware fault stage: Step ${step + 1} of 5. ${steps[step]?.[0]}: ${steps[step]?.[1]}`}
  </div>
  <div className="dr-trace-meta">
   <span className="mono dr-trace-badge">CYCLE-ACCURATE LOGIC MAP</span>
   {interactive&&<span className="mono dr-trace-hint">CLICK ANY BLOCK TO JUMP CYCLE</span>}
  </div>
  <div className="tr-cores">
   <Node i={0} cls={'tr-node'+on(0)+active(0)} label="Step 01: MAIN core commits fault" interactive={interactive} onJump={onJump}><span className="mono">MAIN CORE</span><strong>Runs the application</strong><em className="tr-val tr-bad">wrong value</em></Node>
   <Node i={1} cls={'tr-node'+on(1)+active(1)} label="Step 02: CHECKER core commits correct value" interactive={interactive} onJump={onJump}><span className="mono">CHECKER · 2 CYCLES LATER</span><strong>Same inputs, mirrored</strong><em className="tr-val tr-good">correct value</em></Node>
  </div>
  <Node i={2} cls={'tr-node tr-cmp'+on(2)+active(2)} label="Step 03: Hardware Comparator detects mismatch" interactive={interactive} onJump={onJump}><span className="mono">COMPARATOR</span><strong>{step>=2?'Mismatch on this store':'Checks every committed store'}</strong><b className="tr-ne">≠</b></Node>
  <Node i={3} cls={'tr-node tr-latch'+on(3)+active(3)} label="Step 04: Sticky Fault Latch locks cause" interactive={interactive} onJump={onJump}><span className="mono">FAULT LATCH</span><strong>{step>=3?'First cause held':'Clear'}</strong></Node>
  <Node i={4} cls={'tr-node tr-bridge'+on(4)+active(4)} label="Step 05: Gate driver bridge forced flat in hardware" interactive={interactive} onJump={onJump}><span className="mono">FAULT_N · GATE DRIVER</span><strong>{step>=4?'Bridge off, in hardware':'Bridge switching'}</strong><span className="tr-gates" aria-hidden="true">{[0,1,2,3,4,5].map(i=><i key={i}/>)}</span><small>{step>=4?'Within 39 cycles of an injected fault, simulated':'Six gate outputs active'}</small></Node>
 </div>;
}
