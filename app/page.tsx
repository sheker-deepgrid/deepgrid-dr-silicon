'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,ArrowRight,ArrowLeft,Menu,Layers,ShieldCheck,Cpu,Gauge,Activity,Cable,BrainCircuit,Check} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import Silicon from './silicon';
import {views,useNavigation} from './use-navigation';
import {headline,parts,blocks,loopStages,loopRates,CLOCK_HZ,HW_FIXED_CYCLES,CYCLES_PER_INSTRUCTION,fmax,pinGroups,comparison,leads,gaps,roadmap,applications,bootFlow} from './content';

const titles:Record<string,string>={overview:'Overview',family:'Product family',architecture:'Architecture',control:'Control loop',pinout:'Pinout',roadmap:'Position & roadmap'};
const blockIcons=[ShieldCheck,Layers,Gauge,Activity,Cable,Cpu];
const PRE_SILICON='Pre-silicon. Figures are design values verified in simulation and static timing, not measurements on fabricated parts, unless marked otherwise.';

function Brand(){return <><span className="brand-mark"><i/><i/><i/><i/></span><span className="wordmark">deepgrid<span>SEMI</span></span></>}
function Eyebrow({children}:{children:React.ReactNode}){return <p className="eyebrow"><span/> {children}</p>}
function SectionHead({tag,title,copy}:{tag:string;title:string;copy:string}){return <header className="section-head"><div><Eyebrow>{tag}</Eyebrow><h1>{title}</h1></div><p>{copy}</p></header>}
function ArrowDown(){return <span className="pipeline-arrow">↓</span>}

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

 return <div className={'site-shell view-'+view}>
 <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();document.getElementById('main')?.scrollIntoView()}}>Skip to content</a>
 <header className="topbar"><button className="brand" onClick={()=>navigate('overview')} aria-label="DeepGrid Semi home"><Brand/></button><div className="topline"><span>DG32 · LOCKSTEP RISC-V MOTOR-CONTROL SILICON</span><span className="status-dot">FIRST SILICON · SEP 2026</span></div><button className="contact-link" onClick={()=>navigate('architecture')}>Inside the chip <ArrowUpRight size={17}/></button><button className="mobile-menu" aria-label="Open navigation" onClick={()=>setMenu(true)}><span>{titles[view]}</span><Menu/></button></header>
 <nav className="main-nav" aria-label="Primary navigation">{navLinks}</nav>
 <main id="main" tabIndex={-1}>
 {view!=='overview'&&<nav className="breadcrumbs" aria-label="Breadcrumb"><a href="#overview" onClick={e=>{e.preventDefault();navigate('overview')}}>Home</a><span>/</span><span aria-current="page">{titles[view]}</span></nav>}

 {view==='overview'&&<>
 <section className="hero dr-hero"><div className="hero-canvas"><Silicon reduced={reduced} selected={0}/></div><div className="hero-shade"/>
  <div className="hero-copy"><Eyebrow>DG32 / MOTOR-CONTROL SILICON</Eyebrow><h1>Lockstep safety.<br/><em>Entry-level</em><br/>silicon.</h1><p>DG32-LITE puts a RISC-V MCU, the motor-control peripherals and a hardware lockstep safety monitor on one 130 nm chip.<br/>First silicon rides the September 2026 shuttle.</p><div className="hero-actions"><button className="primary" onClick={()=>navigate('architecture')}>Explore the architecture <ArrowUpRight size={19}/></button><button className="text-link" onClick={()=>navigate('control')}>See the control loop <ArrowRight size={18}/></button></div></div>
  <div className="hero-annotation"><span className="cross">+</span><div>DG32-LITE<small>QFN-64 · 9 × 9 MM · 130 NM CMOS</small></div></div><p className="image-disclaimer">ILLUSTRATIVE MODEL · NOT A MASK LAYOUT · DRAG TO ROTATE</p><div className="hero-bottom"><span>DEEPGRID SEMI PVT LTD / HYDERABAD, INDIA</span></div></section>
 <section className="metrics-strip">{headline.map(([v,l])=><div key={l}><strong>{v}</strong><span>{l}</span></div>)}<p>Pre-silicon figures.<br/>Design values, not measurements.</p></section>

 <section className="content-section"><div className="section-label"><Eyebrow>01 / THE PROBLEM</Eyebrow><span>WHY A SECOND CORE</span></div><div className="thesis-heading"><h2>A silent CPU fault<br/><em>can destroy a bridge.</em></h2><div><p>A motor drive switches power transistors thousands of times a second. On an entry-level motor-control MCU, faults are caught by watchdogs and software self-test. Hardware lockstep has lived in automotive MCUs such as Infineon AURIX, NXP S32K and TI Hercules.</p><p className="muted">DG32 brings a second, checking core to the entry-level tier and gives it one job: catch the first core when it is wrong.</p><button className="text-link" onClick={()=>navigate('roadmap')}>Compare with STM32G0 <ArrowUpRight size={18}/></button></div></div>
  <div className="dr-cards">
   <button className="dr-card" onClick={()=>openBlock(0)}><span className="mono">01 / SAFETY</span><ShieldCheck size={26}/><h3>Two cores<br/>must agree.</h3><p>CHECKER trails MAIN by two cycles and compares every committed store. Divergence latches the first cause and drives the FAULT pin.</p><span className="open-product">Safety core <ArrowRight size={16}/></span></button>
   <button className="dr-card" onClick={()=>navigate('control')}><span className="mono">02 / CONTROL</span><Gauge size={26}/><h3>The loop runs<br/>in hardware.</h3><p>Current sampling, Park transforms and PWM edges run in dedicated blocks. The CPU keeps only the two PI regulators.</p><span className="open-product">Loop budget <ArrowRight size={16}/></span></button>
   <button className="dr-card" onClick={()=>navigate('family')}><span className="mono">03 / COMPUTE</span><BrainCircuit size={26}/><h3>Monitoring on<br/>the drive chip.</h3><p>DG32-2DOM adds an INT8 attention engine on its own 114 MHz clock, with the same pinout and the same frozen control core.</p><span className="open-product">Product family <ArrowRight size={16}/></span></button>
  </div>
 </section>

 <section className="content-section dr-apps-section"><div className="section-label"><Eyebrow>02 / WHERE IT GOES</Eyebrow><span>SAFETY-RELEVANT BRUSHLESS DRIVES</span></div><div className="dr-apps">{applications.map(([t,d],i)=><div key={t}><span className="mono">0{i+1}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section>

 <section className="silicon-teaser"><div><Eyebrow>THE ARCHITECTURE / EXPLORABLE IN 3D</Eyebrow><h2>Six block groups.<br/><em>One 64-pin package.</em></h2><p>Safety core, memory and boot, motor drive, sensing, connectivity and the bus that ties them together. Select a group and see where it sits on the die.</p><button className="primary" onClick={()=>navigate('architecture')}>Inside the architecture <ArrowUpRight size={19}/></button></div><div className="teaser-canvas"><Silicon reduced={reduced} exploded selected={2}/><span className="canvas-caption">DRAG TO ROTATE · ILLUSTRATIVE</span></div></section>

 <section className="proof-section"><Eyebrow>FROM THE DG32 DESIGN DOCUMENTS</Eyebrow><h2>Every block, <em>on one page.</em></h2><div className="figure-scroll"><img src="./images/dg32-lite-architecture.webp" alt="DG32-LITE system architecture: dual-core lockstep, fetch decoder, boot ROM, SRAM, DMA, on-chip interconnect and eighteen peripheral blocks" loading="lazy" width={3125} height={1688}/></div><div className="proof-bottom"><p>DG32-LITE system architecture, as published in the Deepgrid Semi block diagram. {PRE_SILICON}</p><button className="text-link" onClick={()=>navigate('architecture')}>Explore block by block <ArrowUpRight size={18}/></button></div></section>
 </>}

 {view==='family'&&<section className="page-wrap"><SectionHead tag="02 / PRODUCT FAMILY" title="One footprint, two chips" copy="DG32-LITE is the motor-control SoC. DG32-2DOM keeps every pin and peripheral and adds an INT8 attention engine, so a board designed for one takes the other."/>
  <div className="dr-parts">{parts.map(p=><article className="dr-part" key={p.id}><div className="dr-part-head"><span className="mono">{p.id==='lite'?'PART 01':'PART 02'} / {p.tagline.toUpperCase()}</span><h2>{p.name}</h2><span className="dr-status"><i/>{p.status}</span><p>{p.summary}</p></div><dl className="dr-specs">{p.specs.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>{p.adds.length>0&&<div className="dr-adds"><span className="mono">WHAT THE ENGINE IS FOR</span><ul>{p.adds.map(a=><li key={a}><Check size={15}/>{a}</li>)}</ul></div>}</article>)}</div>
  <p className="disclaimer">{PRE_SILICON} The ~0.43 W power figure is a vectorless tool estimate at 25 °C and 1.8 V.</p>
 </section>}

 {view==='architecture'&&<section className="page-wrap"><SectionHead tag="03 / ARCHITECTURE" title="Faults are contained, never silent" copy="Every block on DG32-LITE is a 32-bit register slave on one deterministic bus. A bad access returns an error instead of hanging, and a CPU disagreement raises a pin."/>
  <div className="architecture"><div className="architecture-stage"><div className="stage-top"><span className="mono">DG32-LITE / ILLUSTRATIVE MODEL</span><button aria-pressed={reduced} onClick={()=>setReduced(!reduced)} className="small-button">Motion {reduced?'off':'on'}</button></div><Silicon selected={block} exploded={exploded} reduced={reduced} label={'Interactive 3D model of DG32-LITE with the '+blocks[block].name+' group highlighted. Drag to rotate; use the block list for details.'}/><div className="stage-bottom"><span>DRAG TO ROTATE · NOT A MASK LAYOUT</span><button className="small-button" onClick={()=>setExploded(!exploded)} aria-expanded={exploded}><Layers size={14}/>{exploded?'Seat the die':'Lift the die'}</button></div></div>
   <aside className="domain-panel"><Eyebrow>SIX BLOCK GROUPS</Eyebrow>{blocks.map((b,i)=>{const Icon=blockIcons[i];return <button className={block===i?'selected':''} key={b.code} onClick={()=>update({block:String(i)})} aria-pressed={block===i}><Icon size={18}/><div><span>{b.code}<b>0{i+1}</b></span><strong>{b.name}</strong>{block===i&&<p>{b.short}</p>}</div><ArrowUpRight size={16}/></button>})}</aside></div>
  <div className="dr-block" aria-live="polite"><div><Eyebrow>{blocks[block].code} / {blocks[block].name.toUpperCase()}</Eyebrow><ul>{blocks[block].what.map(w=><li key={w}>{w}</li>)}</ul></div><div className="dr-why"><span className="mono">WHY IT IS BUILT THIS WAY</span><p>{blocks[block].why}</p></div></div>
  <div className="spec-grid">{[['50 MHz','CLOCK DOMAIN'],['64 KB','BOOT ROM'],['32 KB','SRAM'],['16','INTERRUPT SOURCES'],['2','BUS MASTERS'],['8','CLOCK GATES']].map(([v,k])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
  <div className="split-section"><div><Eyebrow>THE BOOT PATH</Eyebrow><h2>No management core.<br/><em>No fallback needed.</em></h2><p>The mask ROM starts the chip on its own. It loads the application from external QSPI flash into SRAM and runs it there. If the flash is blank, it drops to a UART monitor, so a bare board can still be inspected.</p></div><div className="pipeline">{bootFlow.map(([n,t,d])=><div key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowDown/></div>)}</div></div>
  <div className="figure-scroll dr-figure"><img src="./images/dg32-lite-architecture.webp" alt="DG32-LITE system architecture block diagram" loading="lazy" width={3125} height={1688}/></div>
  <p className="disclaimer">The 3D model is illustrative: region placement indicates grouping, not the fabricated floorplan. {PRE_SILICON}</p>
 </section>}

 {view==='control'&&<ControlLoop/>}

 {view==='pinout'&&<section className="page-wrap"><SectionHead tag="05 / PINOUT & PACKAGE" title="44 signals in a 9 × 9 mm package" copy="The 64-pin QFN carries every signal a brushless drive needs; the remaining 20 pins are supplies and grounds. DG32-2DOM uses the identical pinout."/>
  <div className="dr-pinout"><figure className="dr-pin-figure"><img src="./images/dg32-qfn64-pinout.webp" alt="DG32-LITE QFN-64 pinout, top view, colour-coded by function: motor PWM, position sensing, analog ADC, QSPI flash, UART, SPI, I2C, GPIO, supervisor, JTAG, clock and reset, power and ground" loading="lazy" width={1373} height={1181}/><figcaption>Top view. Pin 1 at upper left, numbered counter-clockwise. Pin map awaiting the foundry's bond-diagram confirmation.</figcaption></figure>
   <div className="table-scroll"><table className="dr-table"><caption>Signal pins by function</caption><thead><tr><th scope="col">Function</th><th scope="col">Signals</th><th scope="col" className="num">Pins</th></tr></thead><tbody>{pinGroups.map(([f,s,n])=><tr key={f}><th scope="row">{f}</th><td>{s}</td><td className="num">{n}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>Signal pins</td><td className="num">{pinGroups.reduce((a,[, ,n])=>a+Number(n),0)}</td></tr></tfoot></table></div></div>
  <div className="spec-grid">{[['QFN-64','PACKAGE'],['9 × 9 mm','BODY'],['0.5 mm','PITCH'],['Ground','EXPOSED PADDLE'],['1.8 V','CORE SUPPLY'],['3.3 V','I/O SUPPLY']].map(([v,k])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
  <div className="investment-grid"><div><Eyebrow>DESIGNING IT IN</Eyebrow><h2>Three things<br/><em>a board must respect.</em></h2><p>DG32 is designed to sit between a gate driver, a position sensor and a boot flash. These are the constraints that shape the carrier board.</p></div><div className="risk-list">{[['01','Fault goes to hardware','FAULT_N is an active-low output from the lockstep and supervisor. Route it to the gate-driver enable so a CPU disagreement trips the bridge without firmware.'],['02','Analog inputs are 1.8 V','The two SAR ADC inputs are differential and accept 0 to 1.8 V. Scale the phase-current shunt amplifier into that window.'],['03','Flash is part of the boot path','The application lives in external QSPI NOR flash. Without it, the ROM stops at the UART monitor instead of running the drive.']].map(([n,t,c])=><div key={n}><span>{n}</span><div><h3>{t}</h3><p>{c}</p></div></div>)}</div></div>
  <p className="disclaimer">Preliminary pin map. Electrical limits are process nominals pending first-silicon characterisation.</p>
 </section>}

 {view==='roadmap'&&<section className="page-wrap"><SectionHead tag="06 / POSITION & ROADMAP" title="Where DG32 leads, and where it does not yet" copy="Measured against the STM32G0, the incumbent entry-level motor-control MCU. DG32 wins on safety hardware and control acceleration; the G0 wins on analog, memory and maturity."/>
  <div className="table-scroll"><table className="dr-table dr-compare"><caption>DG32-LITE compared with the STM32G0 series</caption><thead><tr><th scope="col">Dimension</th><th scope="col">DG32-LITE</th><th scope="col">STM32G0 series</th><th scope="col">What it means</th></tr></thead><tbody>{comparison.map(([d,a,b,m])=><tr key={d}><th scope="row">{d}</th><td>{a}</td><td>{b}</td><td>{m}</td></tr>)}</tbody></table></div>
  <p className="disclaimer">STM32G0 column: public datasheet values for the STM32G0x1 / G0B1 family (Arm Cortex-M0+). DG32-LITE column: first-silicon design as taped out, verified in simulation and static timing, not yet measured on silicon.</p>
  <div className="dr-leadgap"><div><Eyebrow>WHERE DG32 LEADS</Eyebrow><ul>{leads.map(l=><li key={l}><Check size={15}/>{l}</li>)}</ul></div><div><Eyebrow>WHERE THE G0 LEADS TODAY</Eyebrow><ul>{gaps.map(l=><li key={l}><span aria-hidden="true">—</span>{l}</li>)}</ul></div></div>
  <div className="section-label"><Eyebrow>THE ROADMAP</Eyebrow><span>CLOSING THE GAPS IN ORDER</span></div>
  <ol className="dr-roadmap">{roadmap.map(([when,t,d])=><li key={t}><span className="mono">{when}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
 </section>}

 <nav className="section-pagination" aria-label="Section navigation">{viewIndex>0?<a href={'#'+views[viewIndex-1]} onClick={e=>{e.preventDefault();navigate(views[viewIndex-1])}}><ArrowLeft size={19}/><span><small>Previous section</small>{titles[views[viewIndex-1]]}</span></a>:<span/>}{viewIndex<views.length-1&&<a href={'#'+views[viewIndex+1]} onClick={e=>{e.preventDefault();navigate(views[viewIndex+1])}}><span><small>Next section</small>{titles[views[viewIndex+1]]}</span><ArrowRight size={19}/></a>}</nav>
 </main>
 <footer className="footer"><div className="footer-top"><button className="brand" onClick={()=>navigate('overview')} aria-label="DeepGrid Semi home"><Brand/></button><h2>Safety in the core.<br/><em>Control in silicon.</em></h2><a className="text-link" href="https://deepgridsemi.com" target="_blank" rel="noreferrer">deepgridsemi.com <ArrowUpRight size={20}/></a></div><div className="footer-bottom"><span>© 2026 DEEPGRID SEMI PVT LTD</span><span>HYDERABAD · INDIA</span><span>PRE-SILICON · DESIGN VALUES, NOT MEASUREMENTS</span><span>DG32-LITE · DG32-2DOM</span></div></footer>
 <Sheet open={menu} onOpenChange={setMenu}><SheetContent className="navigation-sheet"><SheetTitle><span className="wordmark">deepgrid</span></SheetTitle><SheetDescription>Explore DG32 silicon</SheetDescription><nav>{navLinks}</nav></SheetContent></Sheet>
 </div>;
}

function ControlLoop(){
 const [rate,setRate]=useState(1);
 const r=loopRates[rate],period=CLOCK_HZ/(r.khz*1000),budget=period-HW_FIXED_CYCLES,hwPct=HW_FIXED_CYCLES/period*100;
 const maxF=180,target=50;
 return <section className="page-wrap"><SectionHead tag="04 / CONTROL LOOP" title="The CPU runs two regulators, not the loop" copy="Each field-oriented-control tick samples current, transforms it, regulates it and updates the bridge. DG32 moves every expensive step into hardware, so the loop cost is fixed and known."/>
  <ol className="dr-loop">{loopStages.map(([n,t,d,c])=><li key={n}><span className="dr-loop-n">{n}</span><div><h3>{t}</h3><p>{d}</p></div><strong>{c}</strong></li>)}</ol>
  <p className="disclaimer">Cycle costs measured in simulation at the 50 MHz clock, where one cycle is 20 ns.</p>

  <div className="dr-budget"><div className="dr-budget-copy"><Eyebrow>LOOP BUDGET</Eyebrow><h2>~300 cycles of hardware.<br/><em>The rest is firmware.</em></h2><p>One ADC sample, two CORDIC operations and a PWM write cost about 300 cycles at any loop rate. Pick a rate to see what is left for the regulators and observers.</p>
   <div className="dr-rates" role="group" aria-label="Loop rate">{loopRates.map((x,i)=><button key={x.khz} aria-pressed={rate===i} className={rate===i?'active':''} onClick={()=>setRate(i)}>{x.khz} kHz</button>)}</div></div>
   <div className="dr-budget-viz"><div className="dr-stats"><div><strong>{period.toLocaleString('en-US')}</strong><span>CYCLES PER PERIOD</span></div><div><strong>~{HW_FIXED_CYCLES}</strong><span>HARDWARE, FIXED</span></div><div><strong>~{budget.toLocaleString('en-US')}</strong><span>CPU BUDGET</span></div><div><strong>~{Math.floor(budget/CYCLES_PER_INSTRUCTION).toLocaleString('en-US')}</strong><span>CPU INSTRUCTIONS*</span></div></div>
    <div className="dr-stack" role="img" aria-label={`At ${r.khz} kHz, hardware uses ${HW_FIXED_CYCLES} of ${period} cycles (${hwPct.toFixed(0)}%), leaving ${budget} for firmware.`}><div className="dr-seg dr-seg-hw" style={{width:hwPct+'%'}} title={`Hardware: ~${HW_FIXED_CYCLES} cycles`}/><div className="dr-seg dr-seg-cpu" style={{width:(100-hwPct)+'%'}} title={`CPU budget: ~${budget} cycles`}/></div>
    <div className="dr-legend"><span><i className="dr-seg-hw"/>Hardware · {hwPct.toFixed(0)}%</span><span><i className="dr-seg-cpu"/>CPU budget · {(100-hwPct).toFixed(0)}%</span></div>
    <p className="dr-fits"><span className="mono">WHAT FITS AT {r.khz} KHZ</span>{r.fits}</p>
    <p className="disclaimer">*Derived: CPU budget ÷ ~8 cycles per instruction, the measured cost of this fetch-bound core.</p></div></div>

  <div className="dr-fmax"><div><Eyebrow>TIMING HEADROOM</Eyebrow><h2>Only the lockstep core<br/><em>sets the clock.</em></h2><p>Maximum frequency of each hardened block after place-and-route. Every peripheral clears 90 MHz; the lockstep core reaches ~55–62 MHz, which is why the die runs at 50 MHz.</p></div>
   <figure className="dr-chart"><figcaption className="sr-only">Post-route maximum frequency by block, in MHz</figcaption><div className="dr-chart-plot">{fmax.map(([n,v])=><div className="dr-bar-row" key={n}><span className="dr-bar-label">{n}</span><div className="dr-bar-track"><div className={'dr-bar'+(n==='Lockstep core'?' dr-bar-core':'')} style={{width:(v/maxF*100)+'%'}} tabIndex={0} aria-label={`${n}: ${n==='Lockstep core'?'55–62':v} MHz`}><span className="dr-tip" role="tooltip">{n} · {n==='Lockstep core'?'55–62':v} MHz</span></div></div><span className="dr-bar-value">{n==='Lockstep core'?'55–62':v}</span></div>)}<div className="dr-target" style={{left:`calc(var(--label-w) + (100% - var(--label-w) - var(--value-w)) * ${target/maxF})`}}><span>50 MHz target</span></div></div><div className="dr-axis"><span>0</span><span>{maxF} MHz</span></div></figure></div>
  <p className="disclaimer">Post-route figures on the 130 nm process. The lockstep-core bar is drawn at 55 MHz, the low end of its measured range.</p>
 </section>;
}
