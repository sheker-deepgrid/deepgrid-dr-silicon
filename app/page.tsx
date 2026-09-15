'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,ArrowRight,ArrowLeft,Menu,ShieldCheck,Gauge,BrainCircuit,Check,Play,Download} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import Silicon from './silicon';
import Library from './library';
import Architecture from './architecture';
import FaultTrace from './fault-trace';
import AskDeepGrid from './ask';
import {useReveal,useScrollVars} from './motion';
import {packages,fmtTime} from './library-data';
import {views,useNavigation} from './use-navigation';
import {headline,parts,blocks,loopStages,loopRates,CLOCK_HZ,HW_FIXED_CYCLES,CYCLES_PER_INSTRUCTION,fmax,pinGroups,comparison,leads,gaps,applications} from './content';
import {Eyebrow,SectionHead,Sec,ExplainedGrid,DataTable,Callout,Stats} from './detail';
import {faultPath,evidenceLadder,notClaimed,familyCompare,operating,absoluteMax,fetchBound,controlNotes,peripheralLimits,packageSides,powerNotes,fixedVsPreliminary,positionNotes,roadmapDetail} from './detail-content';

const titles:Record<string,string>={overview:'Overview',family:'Product family',architecture:'Architecture',control:'Control loop',pinout:'Pinout & package',roadmap:'Position & roadmap',library:'Documents & media',ask:'Ask DeepGrid'};
const PRE_SILICON='Pre-silicon. Figures are design values verified in simulation and static timing, not measurements on fabricated parts, unless marked otherwise.';

function Brand(){return <><span className="brand-mark"><i/><i/><i/><i/></span><span className="wordmark">deepgrid<span>SEMI</span></span></>}

export default function Home(){
 const {route,navigate:go,update}=useNavigation();
 const view=route.view;
 const [menu,setMenu]=useState(false),[reduced,setReduced]=useState(false),[exploded,setExploded]=useState(false);
 const block=Math.max(0,Math.min(blocks.length-1,Number(route.params.get('block'))||0));
 const navigate=(v:string)=>{setMenu(false);go(v);};
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');setReduced(q.matches);const motion=()=>setReduced(q.matches);q.addEventListener('change',motion);return()=>q.removeEventListener('change',motion);},[]);
 const viewIndex=views.indexOf(view);
 const navLinks=<>{views.map(id=><a href={'#'+id} key={id} className={view===id?'active':''} onClick={e=>{e.preventDefault();navigate(id)}} aria-current={view===id?'page':undefined}>{titles[id]}</a>)}</>;
 const openBlock=(i:number)=>{if(view==='architecture')update({block:String(i)});else{go('architecture?block='+i);}};
 useScrollVars();
 useReveal(view+'?'+route.params.toString());

 return <div className={'site-shell view-'+view}>
 <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();document.getElementById('main')?.scrollIntoView()}}>Skip to content</a>
 <header className="topbar"><button className="brand" onClick={()=>navigate('overview')} aria-label="DeepGrid Semi home"><Brand/></button><div className="topline"><span>DG32 · LOCKSTEP RISC-V MOTOR-CONTROL SILICON</span><span className="status-dot">FIRST SILICON · SEP 2026</span></div><button className="contact-link" onClick={()=>navigate('architecture')}>Inside the chip <ArrowUpRight size={17}/></button><button className="mobile-menu" aria-label="Open navigation" onClick={()=>setMenu(true)}><span>{titles[view]}</span><Menu/></button></header>
 <nav className="main-nav" aria-label="Primary navigation">{navLinks}</nav>
 <main id="main" tabIndex={-1}>
 {view!=='overview'&&<nav className="breadcrumbs" aria-label="Breadcrumb"><a href="#overview" onClick={e=>{e.preventDefault();navigate('overview')}}>Home</a><span>/</span><span aria-current="page">{titles[view]}</span></nav>}

 {view==='overview'&&<>
 <section className="hero dr-hero"><div className="hero-canvas"><Silicon reduced={reduced} selected={0}/></div><div className="hero-shade"/>
  <div className="hero-copy"><Eyebrow>DG32 / MOTOR-CONTROL SILICON</Eyebrow><h1>Lockstep safety.<br/><em>Entry-level</em><br/>silicon.</h1><p>DG32-LITE puts a RISC-V MCU, the motor-control peripherals and a hardware lockstep safety monitor on one 130 nm chip.<br/>First silicon rides the September 2026 shuttle.</p><div className="hero-actions"><button className="primary" onClick={()=>navigate('architecture')}>Explore the architecture <ArrowUpRight size={19}/></button><button className="text-link" onClick={()=>go('library?pkg=lite')}>Watch the architecture film <ArrowRight size={18}/></button></div></div>
  <div className="hero-annotation"><span className="cross">+</span><div>DG32-LITE<small>QFN-64 · 9 × 9 MM · 130 NM CMOS</small></div></div><p className="image-disclaimer">ILLUSTRATIVE MODEL · NOT A MASK LAYOUT · DRAG TO ROTATE</p><div className="hero-bottom"><span>DEEPGRID SEMI PVT LTD / HYDERABAD, INDIA</span></div></section>
 <section className="metrics-strip">{headline.map(([v,l])=><div key={l}><strong>{v}</strong><span>{l}</span></div>)}<p>Pre-silicon figures.<br/>Design values, not measurements.</p></section>

 <section className="content-section"><div className="section-label"><Eyebrow>THE SAFETY IMPERATIVE</Eyebrow><span>WHY DOES ENTRY-LEVEL SILICON NEED A SECOND CORE?</span></div><div className="thesis-heading"><h2>A silent CPU fault<br/><em>can destroy a bridge.</em></h2><div><p>A motor drive switches power transistors thousands of times a second. If the CPU silently computes a wrong value, it writes a wrong PWM edge, and a wrong edge can short a leg of the power bridge: the power stage fails, not only the code.</p><p>On an entry-level motor-control MCU, faults are caught by watchdogs, brown-out reset and periodic software self-test. Those checks run between faults, not during them. Hardware lockstep, which checks every value as it is committed, has lived in automotive MCUs such as Infineon AURIX, NXP S32K and TI Hercules.</p><p className="muted">DG32 brings a second, checking core to the entry-level tier and gives it one job: catch the first core when it is wrong.</p><button className="text-link" onClick={()=>navigate('roadmap')}>Compare with STM32G0 <ArrowUpRight size={18}/></button></div></div>
  <div className="dr-cards">
   <button className="dr-card" onClick={()=>openBlock(0)}><span className="mono">SAFETY</span><ShieldCheck size={26}/><h3>Two cores<br/>must agree.</h3><p>CHECKER trails MAIN by two cycles on mirrored inputs and compares every committed store. Divergence latches the first cause and drives the FAULT pin.</p><span className="open-product">Safety core <ArrowRight size={16}/></span></button>
   <button className="dr-card" onClick={()=>navigate('control')}><span className="mono">CONTROL</span><Gauge size={26}/><h3>The loop runs<br/>in hardware.</h3><p>Current sampling, Park transforms and PWM edges run in dedicated blocks, so one loop costs about 300 hardware cycles at any rate. The CPU keeps only the two PI regulators.</p><span className="open-product">Loop budget <ArrowRight size={16}/></span></button>
   <button className="dr-card" onClick={()=>go('architecture?chip=2dom')}><span className="mono">COMPUTE</span><BrainCircuit size={26}/><h3>Monitoring on<br/>the drive chip.</h3><p>DG32-2DOM adds an INT8 attention engine on its own 114 MHz clock, behind bridges, with the same pinout and the same frozen control core.</p><span className="open-product">Inside DG32-2DOM <ArrowRight size={16}/></span></button>
  </div>
 </section>

 <section className="content-section dr-apps-section"><div className="section-label"><Eyebrow>TARGET APPLICATIONS</Eyebrow><span>WHERE DOES DG32 SILICON DEPLOY?</span></div><div className="dr-apps">{applications.map(([t,d],i)=><div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div></section>

 <section className="content-section"><div className="section-label"><Eyebrow>SILICON INTELLIGENCE</Eyebrow><span>HOW ARE DEEPGRID SPECS & DEFENSE MOATS AUDITED?</span></div><div className="thesis-heading"><h2>Ask DeepGrid.<br/><em>Every spec, cited.</em></h2><div><p>Query the entire 10-chip SKU compendium, mature-node physics (130nm/180nm BCD, SiGe 77GHz), the 198-day silicon shuttle loop, and sovereign defense moats (DAP-2020 Make-II, SCL Mohali). Zero hallucination, strictly vector-grounded in the master whitepaper and technical annex.</p><button className="primary" onClick={()=>navigate('ask')}>Launch Ask DeepGrid Console <ArrowUpRight size={18}/></button></div></div></section>

 <section className="content-section"><div className="section-label"><Eyebrow>FAULT ISOLATION</Eyebrow><span>HOW DOES HARDWARE TRIP THE BRIDGE IN 39 CYCLES WITHOUT FIRMWARE?</span></div>
  <FaultTrace steps={faultPath} intro={<><h2 className="dr-h2">From a wrong value<br/><em>to a safe bridge.</em></h2><p className="dr-lead">Software self-test runs periodically and cannot see a fault between runs. DG32-LITE compares every value the CPU commits, as it commits it, and the path from mismatch to a bridge that is switched off never passes through firmware.</p><p className="dr-lead">Firmware can still prove the path works: a locked injection register fires it on purpose, which is the only way to test it on real silicon.</p><button className="text-link" onClick={()=>openBlock(0)}>Inside the safety core <ArrowUpRight size={18}/></button></>}/>
 </section>

 <section className="content-section"><div className="section-label"><Eyebrow>VERIFICATION LADDER</Eyebrow><span>WHAT EVIDENCE BACKS EVERY PRE-SILICON SPECIFICATION?</span></div>
  <div className="dr-two"><div><h2 className="dr-h2">Every figure says<br/><em>how it was obtained.</em></h2><p className="dr-lead">DG32 is pre-silicon. Each number on this site comes from one of five kinds of evidence, and first-silicon bring-up turns these design values into measurements.</p></div><div className="dr-ladder">{evidenceLadder.map(e=><div key={e.kind}><span className="mono">{e.kind.toUpperCase()}</span><p>{e.means}</p><small>{e.examples}</small></div>)}</div></div>
  <div className="dr-notclaimed"><p className="dr-kicker">WHAT THIS SITE DOES NOT CLAIM</p><ul>{notClaimed.map(n=><li key={n}>{n}</li>)}</ul></div>
 </section>

 <section className="silicon-teaser"><div><Eyebrow>3D DIE EXPLORER</Eyebrow><h2>How is the 64-pin die structured<br/><em>across six functional block groups?</em></h2><p>Safety core, memory and boot, motor drive, sensing, connectivity and the bus that ties them together. Select a group and see where it sits on the die, what each block does and why.</p><button className="primary" onClick={()=>navigate('architecture')}>Inside the architecture <ArrowUpRight size={19}/></button></div><div className="teaser-canvas"><Silicon reduced={reduced} exploded selected={2}/><span className="canvas-caption">DRAG TO ROTATE · ILLUSTRATIVE</span></div></section>

 <section className="proof-section"><Eyebrow>AUTHORITATIVE MEDIA PACKAGES</Eyebrow><h2>Two chips. <em>Where are the narrated films and client-ready decks?</em></h2><div className="dr-pkg-cards">{packages.filter(p=>p.kind==='architecture').map(p=><article className="dr-pkg-card" key={p.id}><button className="dr-pkg-poster" onClick={()=>go('library?pkg='+p.id)} aria-label={'Watch the '+p.name+' architecture film'}><img src={p.poster} alt="" loading="lazy" width={1280} height={720}/><span className="dr-play"><Play size={20} fill="currentColor"/></span></button><div className="dr-pkg-body"><span className="mono">{p.name} · {p.slides.length} SLIDES · {fmtTime(p.duration)} FILM</span><h3>{p.headline}</h3><p>{p.summary}</p><div className="dr-pkg-actions"><button className="primary" onClick={()=>go('library?pkg='+p.id)}>Watch and browse <ArrowUpRight size={17}/></button><a className="text-link" href={p.deck} download>Download .pptx <Download size={16}/></a></div></div></article>)}</div><div className="dr-pkg-mini">{packages.filter(p=>p.kind==='datasheet').map(p=><button key={p.id} className="dr-pkg-mini-card" onClick={()=>go('library?pkg='+p.id)}><img src={p.poster} alt="" loading="lazy" width={1280} height={720}/><span className="mono">{p.name} {p.doc.toUpperCase()} · {fmtTime(p.duration)}</span><strong>{p.headline}</strong><span className="open-product">Deck and film <ArrowRight size={15}/></span></button>)}</div><div className="proof-bottom"><p>Client-ready PowerPoint decks and narrated films for every source document (the two architecture documents, both datasheets and the tape-in block diagram), plus draw.io diagrams. {PRE_SILICON}</p><button className="text-link" onClick={()=>navigate('library')}>All decks and films <ArrowUpRight size={18}/></button></div></section>
 </>}

 {view==='library'&&<section className="page-wrap"><SectionHead tag="07 / DESIGN DOCUMENTS & MEDIA" title="Authoritative Documents, Decks & Films" copy="Complete publication PDFs, engineering specifications, client-ready PowerPoint decks, and narrated walkthrough films across the DG32 platform."/><Library pkgId={route.params.get('pkg')||'lite'} slide={Number(route.params.get('slide'))||1} onChange={update} go={go}/></section>}

 {view==='family'&&<section className="page-wrap"><SectionHead tag="02 / PRODUCT FAMILY" title="One footprint, two chips" copy="DG32-LITE is the motor-control SoC. DG32-2DOM keeps every pin and peripheral and adds an INT8 attention engine, so a board designed for one takes the other."/>
  <div className="dr-parts">{parts.map(p=><article className="dr-part" key={p.id}><div className="dr-part-head"><span className="mono">{p.id==='lite'?'PART 01':'PART 02'} / {p.tagline.toUpperCase()}</span><h2>{p.name}</h2><span className="dr-status"><i/>{p.status}</span><p>{p.summary}</p></div><dl className="dr-specs">{p.specs.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>{p.adds.length>0&&<div className="dr-adds"><span className="mono">WHAT THE ENGINE IS FOR</span><ul>{p.adds.map(a=><li key={a}><Check size={15}/>{a}</li>)}</ul></div>}<div className="dr-part-links"><button className="primary" onClick={()=>go('architecture'+(p.id==='lite'?'':'?chip=2dom'))}>Inside the architecture <ArrowUpRight size={17}/></button><button className="text-link" onClick={()=>go('library?pkg='+p.id)}>Architecture deck and film <ArrowRight size={16}/></button><button className="text-link" onClick={()=>go('library?pkg='+p.id+'-datasheet')}>Datasheet deck and film <ArrowRight size={16}/></button></div></article>)}</div>
  <p className="disclaimer">{PRE_SILICON} The ~0.43 W power figure is a vectorless tool estimate at 25 °C and 1.8 V.</p>
  <Sec kicker="CHIP COMPARISON" title="What stays identical," em="and what does DG32-2DOM add?" copy="Everything outside the engine is the same design from the same source, which is why a DG32-LITE board takes DG32-2DOM unchanged and the control-loop budget carries over exactly.">
   <DataTable caption="DG32-LITE and DG32-2DOM compared" head={['Area','DG32-LITE','DG32-2DOM']} rows={familyCompare} wide/>
  </Sec>
  <Sec kicker="WHICH CHIP FOR YOUR DRIVE?" title="Same board, same firmware base," em="one added capability.">
   <ExplainedGrid cols={2} items={[
    {name:'Choose DG32-LITE',what:'For a drive that needs hardware lockstep safety, hardware FOC acceleration and native DShot in a 64-pin part.',why:'It is the first-silicon part: on the September 2026 shuttle, with bring-up measuring the loop costs, fault latency and timing it was designed to.'},
    {name:'Choose DG32-2DOM',what:'For a drive that should also watch its own motor: bearing-fault or anomaly detection on phase-current data, without a second processor.',why:'The engine runs on its own clock behind bridges, so condition monitoring cannot extend the control core’s worst-case execution time. Design complete, in physical trials.'},
   ]}/>
   <div className="dr-links dr-sec-gap">
     <button className="text-link" onClick={()=>navigate('architecture')}>Explore the architecture <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>navigate('control')}>100 kHz control-loop budget <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>navigate('pinout')}>QFN-64 package & electrical limits <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>go('library')}>Official datasheets & publication PDFs <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>go('ask')}>Query DG32-2DOM in Ask DeepGrid <ArrowUpRight size={16}/></button>
   </div>
  </Sec>
 </section>}

 {view==='architecture'&&<section className="page-wrap"><SectionHead tag="03 / ARCHITECTURE" title="Two chips, one frozen safety core" copy="DG32-LITE is the lockstep motor-control SoC; DG32-2DOM adds an INT8 attention engine on its own clock. Choose one for its diagram, every block and why it exists, the constraints that shaped it and how data moves through it, or see the die as recorded for tape-in."/>
  <Architecture chip={route.params.get('chip')||'lite'} block={block} reduced={reduced} setReduced={setReduced} exploded={exploded} setExploded={setExploded} update={update} go={go}/>
  <p className="disclaimer">{PRE_SILICON}</p>
 </section>}

 {view==='control'&&<ControlLoop go={go}/>}

 {view==='pinout'&&<section className="page-wrap"><SectionHead tag="05 / PINOUT & PACKAGE" title="44 signals in a 9 × 9 mm package" copy="The 64-pin QFN carries every signal a brushless drive needs; the remaining 20 pins are supplies and grounds. DG32-2DOM uses the identical pinout, supplies and limits."/>
  <div className="dr-pinout"><PackageDiagram/>
   <div className="table-scroll"><table className="dr-table"><caption>Signal pins by function</caption><thead><tr><th scope="col">Function</th><th scope="col">Signals</th><th scope="col" className="num">Pins</th></tr></thead><tbody>{pinGroups.map(([f,s,n])=><tr key={f}><th scope="row">{f}</th><td>{s}</td><td className="num">{n}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>Signal pins</td><td className="num">{pinGroups.reduce((a,[, ,n])=>a+Number(n),0)}</td></tr></tfoot></table></div></div>
  <Stats items={[['QFN-64','PACKAGE'],['9 × 9 mm','BODY'],['0.5 mm','PITCH'],['Ground','EXPOSED PADDLE'],['1.8 V','CORE SUPPLY'],['3.3 V','I/O SUPPLY']]}/>
  <Sec kicker="POWER, CLOCK AND RESET" title="One rail powers" em="all of the logic." copy="The parts of the datasheet a design commits to first: which supplies exist, the order they come up, and the single clock the whole die runs from.">
   <ExplainedGrid items={powerNotes}/>
  </Sec>
  <Sec kicker="ELECTRICAL LIMITS" title="Every electrical limit" em="is a nominal until silicon." copy="130 nm process nominals for each supply domain, the same on DG32-LITE and DG32-2DOM. First-silicon characterisation replaces this section.">
   <div className="dr-two-tables"><DataTable caption="Recommended operating conditions" head={['Parameter','Min','Typ','Max','Note']} rows={operating}/><DataTable caption="Absolute maximum ratings" head={['Parameter','Min','Max']} rows={absoluteMax}/></div>
   <p className="disclaimer">Power: ~0.43 W at 50 MHz, a vectorless tool estimate at 25 °C and 1.8 V, not a measurement.</p>
  </Sec>
  <Sec kicker="DESIGN LOCK STATUS" title="What a design can lock now," em="and what waits for silicon.">
   <div className="dr-fixed">{fixedVsPreliminary.map(f=><div key={f.state}><p className="dr-kicker">{f.state.toUpperCase()}</p><ul>{f.items.map(i=><li key={i}>{i}</li>)}</ul></div>)}</div>
   <div className="dr-links dr-sec-gap">
     <button className="text-link" onClick={()=>go('library')}>Download official QFN-64 datasheets (PDF) <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>navigate('control')}>100 kHz hardware control loop <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>navigate('architecture')}>Inside the safety core & power sequencing <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>go('ask')}>Ask DeepGrid about 1.8V/3.3V sequencing <ArrowUpRight size={16}/></button>
   </div>
  </Sec>
  <p className="disclaimer">Preliminary pin map. Register maps, the memory map and board-level design rules are in the engineering datasheet, not on this site.</p>
 </section>}

 {view==='roadmap'&&<section className="page-wrap"><SectionHead tag="06 / POSITION & ROADMAP" title="Where DG32 leads, and where it does not yet" copy="Measured against the STM32G0, the incumbent entry-level motor-control MCU. DG32 wins on safety hardware and control acceleration; the G0 wins on analog, memory and maturity."/>
  <div className="table-scroll"><table className="dr-table dr-compare"><caption>DG32-LITE compared with the STM32G0 series</caption><thead><tr><th scope="col">Dimension</th><th scope="col">DG32-LITE</th><th scope="col">STM32G0 series</th><th scope="col">What it means</th></tr></thead><tbody>{comparison.map(([d,a,b,m])=><tr key={d}><th scope="row">{d}</th><td>{a}</td><td>{b}</td><td>{m}</td></tr>)}</tbody></table></div>
  <p className="disclaimer">STM32G0 column: public datasheet values for the STM32G0x1 / G0B1 family (Arm Cortex-M0+). DG32-LITE column: first-silicon design values, verified in simulation and static timing, not yet measured on silicon.</p>
  <div className="dr-leadgap"><div><Eyebrow>WHERE DG32 LEADS</Eyebrow><ul>{leads.map(l=><li key={l}><Check size={15}/>{l}</li>)}</ul></div><div><Eyebrow>WHERE THE G0 LEADS TODAY</Eyebrow><ul>{gaps.map(l=><li key={l}><span className="dr-dash" aria-hidden="true"/>{l}</li>)}</ul></div></div>
  <Sec kicker="WHY THE DIFFERENCE?" title="Why does each gap exist," em="and why does it close in this order?">
   <ExplainedGrid items={positionNotes} cols={2}/>
  </Sec>
  <Sec kicker="THE MULTI-SPIN ROADMAP" title="Closing the gaps" em="in deliberate order." copy="Each step has a job: first silicon proves the architecture, the second spin closes the largest gaps, and connectivity follows.">
   <ol className="dr-roadmap">{roadmapDetail.map(([when,t,what,proves])=><li key={t}><span className="mono">{when}</span><h3>{t}</h3><p>{what}</p><p className="dr-proves"><span className="mono">WHAT IT DELIVERS</span>{proves}</p></li>)}</ol>
  </Sec>
  <div className="dr-notclaimed"><p className="dr-kicker">WHAT THIS SITE DOES NOT CLAIM</p><ul>{notClaimed.map(n=><li key={n}>{n}</li>)}</ul></div>
  <div className="dr-links dr-sec-gap">
    <button className="text-link" onClick={()=>go('library')}>Download Master Whitepaper (71-Page PDF) <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>navigate('pinout')}>Review QFN-64 pinout & package <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>navigate('control')}>Inspect 100 kHz control loop budget <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('ask')}>Audit 10-SKU roadmap in Ask DeepGrid <ArrowUpRight size={16}/></button>
  </div>
 </section>}

 {view==='ask'&&<AskDeepGrid go={go}/>}

 <nav className="section-pagination" aria-label="Section navigation">{viewIndex>0?<a href={'#'+views[viewIndex-1]} onClick={e=>{e.preventDefault();navigate(views[viewIndex-1])}}><ArrowLeft size={19}/><span><small>Previous section</small>{titles[views[viewIndex-1]]}</span></a>:<span/>}{viewIndex<views.length-1&&<a href={'#'+views[viewIndex+1]} onClick={e=>{e.preventDefault();navigate(views[viewIndex+1])}}><span><small>Next section</small>{titles[views[viewIndex+1]]}</span><ArrowRight size={19}/></a>}</nav>
 </main>
 <footer className="footer"><div className="footer-top"><button className="brand" onClick={()=>navigate('overview')} aria-label="DeepGrid Semi home"><Brand/></button><h2>Safety in the core.<br/><em>Control in silicon.</em></h2><a className="text-link" href="https://deepgridsemi.com" target="_blank" rel="noreferrer">deepgridsemi.com <ArrowUpRight size={20}/></a></div><div className="footer-bottom"><span>© 2026 DEEPGRID SEMI PVT LTD</span><span>HYDERABAD · INDIA</span><span>PRE-SILICON · DESIGN VALUES, NOT MEASUREMENTS</span><a href="#library" onClick={e=>{e.preventDefault();navigate('library')}}>Documents & media ↗</a></div></footer>
 <Sheet open={menu} onOpenChange={setMenu}><SheetContent className="navigation-sheet"><SheetTitle><span className="wordmark">deepgrid</span></SheetTitle><SheetDescription>Explore DG32 silicon</SheetDescription><nav>{navLinks}</nav></SheetContent></Sheet>
 </div>;
}

function PackageDiagram(){
 const side=(k:string)=>{const x=packageSides.find(s=>s.side===k)!;return <div className={'dr-qfn-side dr-qfn-'+k}><span className="mono">{k.toUpperCase()} · PINS {x.pins}</span><strong>{x.groups}</strong><p>{x.signals}</p></div>;};
 return <figure className="dr-package" aria-label="DG32-LITE QFN-64 top view, with the signal groups on each side of the package">
  {side('top')}{side('left')}<div className="dr-qfn-body" aria-hidden="true"><i className="dr-pin1"/><strong>DG32-LITE</strong><span>QFN-64 · 9 × 9 MM</span><span>TOP VIEW</span></div>{side('right')}{side('bottom')}
  <figcaption>Supplies and grounds sit between the groups on every side. Pin 1 (dot) is upper left, numbered counter-clockwise. Pin map awaiting the foundry’s bond-diagram confirmation.</figcaption>
 </figure>;
}

function ControlLoop({go}:{go:(hash:string)=>void}){
 const [rate,setRate]=useState(1);
 const r=loopRates[rate],period=CLOCK_HZ/(r.khz*1000),budget=period-HW_FIXED_CYCLES,hwPct=HW_FIXED_CYCLES/period*100;
 const maxF=180,target=50;
 return <section className="page-wrap"><SectionHead tag="04 / CONTROL LOOP" title="The CPU runs two regulators, not the loop" copy="Each field-oriented-control tick samples current, transforms it, regulates it and updates the bridge. DG32 moves every expensive step into hardware, so the loop cost is fixed and known."/>
  <ol className="dr-loop">{loopStages.map(([n,t,d,c])=><li key={n}><span className="dr-loop-n">{n}</span><div><h3>{t}</h3><p>{d}</p></div><strong>{c}</strong></li>)}</ol>
  <p className="disclaimer">Cycle costs measured in simulation at the 50 MHz clock, where one cycle is 20 ns.</p>

  <Sec kicker="WHY THE LOOP RUNS IN HARDWARE" title="Why is the CPU fetch-bound," em="and why do peripherals execute the transforms?" copy="The core fetches every instruction over the bus. That one measured constant is what the whole peripheral set is designed around.">
   <div className="dr-factcards">{fetchBound.map(([v,l,d])=><div key={l}><strong>{v}</strong><span className="mono">{l}</span><p>{d}</p></div>)}</div>
   <ExplainedGrid items={controlNotes} cols={2}/>
  </Sec>

  <div className="dr-budget"><div className="dr-budget-copy"><Eyebrow>LOOP TIMING & BUDGET</Eyebrow><h2>How does ~300 cycles of hardware<br/><em>free up CPU execution headroom?</em></h2><p>One ADC sample, two CORDIC operations and a PWM write cost about 300 cycles at any loop rate. Pick a rate to see what is left for the regulators and observers.</p>
   <div className="dr-rates" role="group" aria-label="Loop rate">{loopRates.map((x,i)=><button key={x.khz} aria-pressed={rate===i} className={rate===i?'active':''} onClick={()=>setRate(i)}>{x.khz} kHz</button>)}</div></div>
   <div className="dr-budget-viz"><div className="dr-stats"><div><strong>{period.toLocaleString('en-US')}</strong><span>CYCLES PER PERIOD</span></div><div><strong>~{HW_FIXED_CYCLES}</strong><span>HARDWARE, FIXED</span></div><div><strong>~{budget.toLocaleString('en-US')}</strong><span>CPU BUDGET</span></div><div><strong>~{Math.floor(budget/CYCLES_PER_INSTRUCTION).toLocaleString('en-US')}</strong><span>CPU INSTRUCTIONS*</span></div></div>
    <div className="dr-stack" role="img" aria-label={`At ${r.khz} kHz, hardware uses ${HW_FIXED_CYCLES} of ${period} cycles (${hwPct.toFixed(0)}%), leaving ${budget} for firmware.`}><div className="dr-seg dr-seg-hw" style={{width:hwPct+'%'}} title={`Hardware: ~${HW_FIXED_CYCLES} cycles`}/><div className="dr-seg dr-seg-cpu" style={{width:(100-hwPct)+'%'}} title={`CPU budget: ~${budget} cycles`}/></div>
    <div className="dr-legend"><span><i className="dr-seg-hw"/>Hardware · {hwPct.toFixed(0)}%</span><span><i className="dr-seg-cpu"/>CPU budget · {(100-hwPct).toFixed(0)}%</span></div>
    <p className="dr-fits"><span className="mono">WHAT FITS AT {r.khz} KHZ</span>{r.fits}</p>
    <p className="disclaimer">*Derived: CPU budget ÷ ~8 cycles per instruction, the measured cost of this fetch-bound core.</p></div></div>

  <div className="dr-fmax"><div><Eyebrow>TIMING HEADROOM & FMAX</Eyebrow><h2>Why does the lockstep core<br/><em>set the 50 MHz clock limit?</em></h2><p>Maximum frequency of each hardened block after place-and-route. Every peripheral clears 90 MHz; the lockstep core reaches ~55–62 MHz, which is why the die runs at 50 MHz. The same limit is why DG32-2DOM puts its engine on a second clock instead of raising this one.</p></div>
   <figure className="dr-chart"><figcaption className="sr-only">Post-route maximum frequency by block, in MHz</figcaption><div className="dr-chart-plot">{fmax.map(([n,v])=><div className="dr-bar-row" key={n}><span className="dr-bar-label">{n}</span><div className="dr-bar-track"><div className={'dr-bar'+(n==='Lockstep core'?' dr-bar-core':'')} style={{width:(v/maxF*100)+'%'}} tabIndex={0} aria-label={`${n}: ${n==='Lockstep core'?'55–62':v} MHz`}><span className="dr-tip" role="tooltip">{n} · {n==='Lockstep core'?'55–62':v} MHz</span></div></div><span className="dr-bar-value">{n==='Lockstep core'?'55–62':v}</span></div>)}<div className="dr-target" style={{left:`calc(var(--label-w) + (100% - var(--label-w) - var(--value-w)) * ${target/maxF})`}}><span>50 MHz target</span></div></div><div className="dr-axis"><span>0</span><span>{maxF} MHz</span></div></figure></div>
  <p className="disclaimer">Post-route figures on the 130 nm process. The lockstep-core bar is drawn at 55 MHz, the low end of its measured range.</p>

  <Sec kicker="PERIPHERAL LIMITS & CAPABILITIES" title="What deterministic timing limits" em="can firmware count on?" copy="Capability and timing per block, from the datasheet’s block notes. Design and simulated values, pending silicon.">
   <DataTable caption="Peripheral limits" head={['Block','Limit','Note']} rows={peripheralLimits}/>
   <Callout label="WITH DG32-2DOM" action={<button className="text-link" onClick={()=>go('architecture?chip=2dom')}>How the engine is isolated <ArrowUpRight size={15}/></button>}>The attention engine runs on its own 114 MHz clock and reaches memory only through clock-domain bridges, so none of these loop numbers change while it runs.</Callout>
  </Sec>

  <div className="dr-links dr-sec-gap">
    <button className="text-link" onClick={()=>go('architecture')}>Explore block architecture <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('pinout')}>QFN-64 pinout & package <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('library')}>Official DG32-LITE datasheet (PDF) <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('ask')}>Ask DeepGrid about loop latency & CORDIC <ArrowUpRight size={16}/></button>
  </div>
 </section>;
}
