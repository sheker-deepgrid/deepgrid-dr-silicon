'use client';
import {useRef} from 'react';
import {ArrowUpRight,Layers,ShieldCheck,Cpu,Gauge,Activity,Cable} from 'lucide-react';
import Silicon from './silicon';
import {blocks} from './content';
import {Eyebrow,Sec,ExplainedGrid,Steps,Flows,DataTable,Callout,Stats,Diagram} from './detail';
import {litePremises,liteDecisions,groupMembers,liteFlows,faultPath,isolationInvariant,domPremises,enginePipeline,engineParts,engineCost,engineLimits,domFlows,domTiming,domDecisions,tapeinStats,tapeinSections,padPlan,signoffGates,whyConnectivityGate} from './detail-content';

type Update=(changes:Record<string,string|undefined>)=>void;
type Props={chip:string;block:number;reduced:boolean;setReduced:(v:boolean)=>void;exploded:boolean;setExploded:(v:boolean)=>void;update:Update;go:(hash:string)=>void};
const blockIcons=[ShieldCheck,Layers,Gauge,Activity,Cable,Cpu];
const chips=[['lite','DG32-LITE','Lockstep motor-control SoC · one 50 MHz domain'],['2dom','DG32-2DOM','Adds an INT8 attention engine · 50 + 114 MHz'],['tapein','As built for tape-in','The die recorded in its tape-in block diagram']] as const;

export default function Architecture(props:Props){
 const active=chips.some(c=>c[0]===props.chip)?props.chip:'lite';
 const mark=useRef<HTMLDivElement>(null);
 // The tabs stick under the navigation; switching from deep in a long tab starts the new one at its top.
 const choose=(id:string)=>{const m=mark.current;if(m){const navH=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||0;const top=m.getBoundingClientRect().top+scrollY-navH;if(scrollY>top)scrollTo({top,behavior:'instant' as ScrollBehavior});}props.update({chip:id==='lite'?undefined:id,block:undefined});};
 return <div className="dr-arch">
  <div ref={mark} className="dr-arch-mark" aria-hidden="true"/>
  <div className="dr-arch-tabs" role="tablist" aria-label="Architecture to show">{chips.map(([id,name,sub])=><button key={id} role="tab" aria-selected={active===id} className={active===id?'active':''} onClick={()=>choose(id)}><strong>{name}</strong><span>{sub}</span></button>)}</div>
  <div role="tabpanel" aria-label={chips.find(c=>c[0]===active)![1]}>
   {active==='lite'&&<Lite {...props}/>}
   {active==='2dom'&&<Dom go={props.go} update={props.update}/>}
   {active==='tapein'&&<TapeIn go={props.go} update={props.update}/>}
  </div>
 </div>;
}

function Intro({kicker,title,em,children}:{kicker:string;title:string;em:string;children:React.ReactNode}){
 return <div className="dr-arch-intro"><div><p className="dr-kicker">{kicker}</p><h2 className="dr-h2">{title}<br/><em>{em}</em></h2></div><div className="dr-sec-copy">{children}</div></div>;
}

function Lite({block,reduced,setReduced,exploded,setExploded,update,go}:Props){
 const g=blocks[block];
 return <>
  <Intro kicker="DG32-LITE / LOCKSTEP ARCHITECTURE" title="How does DG32-LITE integrate an MCU" em="with a cycle-accurate safety monitor?">
   <p>DG32-LITE combines a RISC-V microcontroller, the peripherals a brushless drive needs and a hardware safety monitor on one 130 nm die. The monitor is a second, identical core that runs two cycles behind the first. If the two ever disagree, the chip latches the first cause and drives a pin that can turn the power bridge off without waiting for firmware.</p>
   <p>Six block groups share one deterministic bus on a single 50 MHz clock. Below: the full diagram, every block and why it exists, the four constraints that shaped them, and how a control loop, a boot and a fault move through the chip.</p>
   <div className="dr-links"><button className="text-link" onClick={()=>go('library?pkg=lite')}>Architecture deck and film <ArrowUpRight size={16}/></button><button className="text-link" onClick={()=>go('control')}>Control-loop budget <ArrowUpRight size={16}/></button></div>
  </Intro>
  <Stats items={[['50 MHz','ONE CLOCK DOMAIN'],['2','BUS MASTERS'],['16','INTERRUPT SOURCES'],['64 KB','BOOT ROM'],['32 KB','DUAL-PORT SRAM'],['39 cycles','FAULT TO LATCH, SIMULATED']]}/>
  <Diagram src="./diagrams/dg32-lite-architecture.svg" title="DG32-LITE system architecture" width={1518} height={1045} drawio="./downloads/dg32-lite-architecture.drawio" guide="./downloads/dg32-lite-architecture-guide.md"
   alt="DG32-LITE system architecture diagram: safety core, memory and boot, supervision, on-chip bus, motor drive, sensing and math, connectivity and test, with the numbered current-control loop and the hardware fault path"
   caption={<>Numbered circles trace one current-control loop: ① the PWM fires the ADC sample, ② phase current goes to the CORDIC, ③ the transforms go to the CPU, ④ the PI output sets the PWM duty. The dashed red line is the hardware fault trip from the fault latch to the gate driver. Dashed boxes are off-chip.</>}/>

  <Sec kicker="THE BLOCK GROUPS & ROLES" title="What do the six hardware groups do," em="and why does each block exist?" copy="Select a group to highlight it on the illustrative die and read what every block inside it does, and why it was built that way.">
   <div className="architecture"><div className="architecture-stage"><div className="stage-top"><span className="mono">DG32-LITE / ILLUSTRATIVE MODEL</span><button aria-pressed={reduced} onClick={()=>setReduced(!reduced)} className="small-button">Motion {reduced?'off':'on'}</button></div><Silicon selected={block} exploded={exploded} reduced={reduced} label={'Interactive 3D model of DG32-LITE with the '+g.name+' group highlighted. Drag to rotate; use the block list for details.'}/><div className="stage-bottom"><span>DRAG TO ROTATE · NOT A MASK LAYOUT</span><button className="small-button" onClick={()=>setExploded(!exploded)} aria-expanded={exploded} aria-label={exploded?'Seat the die':'Lift the die'}><Layers size={14} aria-hidden="true"/>{exploded?'Seat the die':'Lift the die'}</button></div></div>
    <aside className="domain-panel"><Eyebrow>SIX BLOCK GROUPS</Eyebrow>{blocks.map((b,i)=>{const Icon=blockIcons[i];return <button className={block===i?'selected':''} key={b.code} onClick={()=>update({block:String(i)})} aria-pressed={block===i} aria-label={`Select ${b.name} block group`}><Icon size={18} aria-hidden="true"/><div><span>{b.code}<b>0{i+1}</b></span><strong>{b.name}</strong>{block===i&&<p>{b.short}</p>}</div><ArrowUpRight size={16} aria-hidden="true"/></button>})}</aside></div>
   <div className="dr-group" aria-live="polite"><div className="dr-group-head"><div><p className="dr-kicker">GROUP 0{block+1} / {g.code}</p><h3 className="dr-group-name">{g.name}</h3></div><p className="dr-group-why">{g.why}</p></div><ExplainedGrid items={groupMembers[block]}/></div>
   <p className="disclaimer">The 3D model is illustrative: region placement indicates grouping, not the fabricated floorplan.</p>
  </Sec>

  <Sec kicker="ARCHITECTURAL CONSTRAINTS" title="Which four silicon constraints" em="dictated every block design?" copy="Each is a finding from hardening the design, not a preference. Read across a row to see how a constraint became a block’s shape.">
   <DataTable caption="Design premises and what they set" head={['Constraint','What it means','What the design does']} rows={litePremises} wide/>
  </Sec>

  <Sec kicker="DETERMINISTIC DATA PATHS" title="How do control loops, boot sequences," em="and hardware faults traverse the die?" copy="Three sequences explain most of the chip: the current loop it exists to run, the boot it performs on its own, and what happens when the two cores disagree.">
   <Flows flows={[...liteFlows,{title:'A CPU fault',lead:'From a wrong value to a safe bridge, without firmware.',steps:faultPath}]}/>
   <Callout label="THE ISOLATION RULE">{isolationInvariant}</Callout>
  </Sec>

  <Sec kicker="LOCKED DESIGN DECISIONS" title="Which architectural trade-offs" em="are frozen until first-silicon test?" copy="These are settled. Each trades something away on purpose, and the reason is recorded with it.">
   <ExplainedGrid items={liteDecisions} cols={2}/>
  </Sec>

  <div className="dr-links dr-sec-gap">
    <button className="text-link" onClick={()=>go('control')}>100 kHz control-loop budget <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('pinout')}>QFN-64 package & pinout <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>update({chip:'2dom'})}>Compare with DG32-2DOM attention variant <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('library?pkg=lite')}>Download DG32-LITE specs & slides (PDF) <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('ask')}>Ask DeepGrid about 2-cycle lockstep delay <ArrowUpRight size={16}/></button>
  </div>
 </>;
}

function Dom({go,update}:{go:(hash:string)=>void;update:Update}){
 const total=engineCost.reduce((a,[, ,c])=>a+c,0);
 return <>
  <Intro kicker="DG32-2DOM / DUAL-DOMAIN ARCHITECTURE" title="How does DG32-2DOM add an attention engine" em="without compromising safety loop timing?">
   <p>DG32-2DOM is DG32-LITE with an INT8 attention engine added on a second, faster clock. The lockstep core, boot path, peripherals, control-loop budget and 64-pin pinout are identical: both chips come from one design source, and the variant is a build option plus a second clock rather than a fork.</p>
   <p>The engine exists so a motor drive can run condition monitoring, such as bearing-fault and anomaly detection, on the chip that already turns the motor, without a second processor and without disturbing the safety-critical control core. Status: design complete, in physical trials.</p>
   <div className="dr-links"><button className="text-link" onClick={()=>go('library?pkg=2dom')}>Architecture deck and film <ArrowUpRight size={16}/></button><button className="text-link" onClick={()=>go('library?pkg=2dom-datasheet')}>Datasheet deck and film <ArrowUpRight size={16}/></button></div>
  </Intro>
  <Stats items={[['114 MHz','COMPUTE CLOCK'],['50 MHz','CONTROL DOMAIN'],['Bit-exact','TO THE SOFTWARE MODEL'],['400','KEYS PER HEAD'],['~3,242','CYCLES PER ROW, ANALYTIC'],['0','PADS ADDED']]}/>
  <Diagram src="./diagrams/dg32-2dom-architecture.svg" title="DG32-2DOM system architecture" width={1453} height={895} drawio="./downloads/dg32-2dom-architecture.drawio" guide="./downloads/dg32-2dom-architecture-guide.md"
   alt="DG32-2DOM system architecture diagram: the 50 MHz control domain identical to DG32-LITE, three clock-domain bridges, and the 114 MHz compute domain with the six-stage INT8 attention engine and its key, value and weight-table buffers"
   caption={<>One attention kick: ① the CPU programs the shapes through the lite bridge, ② keys and values load once through the burst read bridge, ③ the INT8 output writes back through the burst write bridge, ④ a done interrupt reaches both cores. The engine reaches memory only through the bridges.</>}/>

  <Sec kicker="DUAL-DOMAIN CONSTRAINTS" title="Which physical findings" em="necessitated an isolated second clock domain?" copy="Each came from hardening the design, and each one set the variant’s shape.">
   <DataTable caption="What was found and what the design does about it" head={['Finding','What it means','What the design does']} rows={domPremises} wide/>
  </Sec>

  <Sec kicker="THE INT8 ATTENTION ENGINE" title="How does the pipeline compute query rows" em="with bit-exact mathematical fidelity?" copy="Firmware programs the job and starts it. Every stage below runs on the 114 MHz clock, and the output matches the golden software model bit for bit.">
   <div className="dr-two"><Steps steps={enginePipeline} label="Attention engine pipeline, per query row"/><ExplainedGrid items={engineParts.slice(0,2)} cols={2}/></div>
   <div className="dr-sec-gap"><ExplainedGrid items={engineParts.slice(2)} cols={2}/></div>
  </Sec>

  <Sec kicker="EXECUTION LATENCY & CYCLES" title="How do 3,242 compute cycles" em="break down across the attention pipeline?" copy="At 16 lanes, 400 keys, 32-byte keys and 64-byte values. Half of each row is the weighted sum over the values; the key pass is a quarter. The measured steady-state figure is a bring-up item.">
   <div className="dr-costbars" role="img" aria-label={`One query row costs about ${total.toLocaleString('en-US')} cycles: `+engineCost.map(([t, ,c])=>`${t} ${c}`).join(', ')}>{engineCost.map(([t,s,c])=><div className="dr-cost-row" key={t}><span>{t}<small>{s}</small></span><div className="dr-cost-track"><div className="dr-cost-fill" style={{width:(c/engineCost[0][2]*100)+'%'}}/></div><b>{c.toLocaleString('en-US')}</b></div>)}<div className="dr-cost-row dr-cost-total"><span>One query row</span><span/><b>~{total.toLocaleString('en-US')}</b></div></div>
   <DataTable caption="Engine limits, fixed in silicon" head={['Parameter','Range','Note']} rows={engineLimits}/>
  </Sec>

  <Sec kicker="CONCURRENT EXECUTION" title="How does the attention kick proceed" em="while the 100 kHz control loop keeps running?" copy="What firmware does to run the engine, and why the control loop cannot tell that it is running.">
   <Flows flows={domFlows}/>
  </Sec>

  <Sec kicker="POST-ROUTE CLOSURE & DIE" title="How do both clock domains close timing" em="across the 3.4 × 4.5 mm die?" copy="Post-route results on the 130 nm process; silicon measurements follow bring-up.">
   <DataTable caption="Timing, die and cost" head={['Item','Value','Status']} rows={domTiming}/>
  </Sec>

  <Sec kicker="FROZEN VARIANT DECISIONS" title="Why is DG32-2DOM strictly an additive build," em="preserving the proven control core?">
   <ExplainedGrid items={domDecisions} cols={2}/>
  </Sec>

  <div className="dr-links dr-sec-gap">
    <button className="text-link" onClick={()=>update({chip:'lite'})}>Return to DG32-LITE base architecture <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('control')}>Review 100 kHz control-loop budget <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('pinout')}>QFN-64 pinout & package <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('library?pkg=2dom')}>Download DG32-2DOM architecture whitepaper (PDF) <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('ask')}>Ask DeepGrid about CDC bridges & AVIP diagnostics <ArrowUpRight size={16}/></button>
  </div>
 </>;
}

function TapeIn({go,update}:{go:(hash:string)=>void;update:Update}){
 const colors=['dr-c0','dr-c1','dr-c2','dr-c3'];
 return <>
  <Intro kicker="DG32-LITE / TAPE-IN RECORD" title="What does the tape-in block diagram" em="record about the fabricated silicon?">
   <p>The tape-in block diagram is the most complete record of what goes to the foundry: one clock domain, a lockstep pair built to tolerate interrupts and peripheral reads, a bus where no access can hang, 44 allocated pads, production test and the gates the die must pass.</p>
   <p>It is a design record, not a measurement of silicon, and it lists the sign-off gates without claiming that they have passed.</p>
   <div className="dr-links"><button className="text-link" onClick={()=>go('library?pkg=lite-tapein')}>Tape-in deck and film <ArrowUpRight size={16}/></button></div>
  </Intro>
  <Stats items={tapeinStats}/>

  <Sec kicker="AS-BUILT SPECIFICATIONS" title="How is each die subsystem configured" em="for the SkyWater 130 nm shuttle?">
   <ExplainedGrid items={tapeinSections}/>
  </Sec>

  <Sec kicker="PAD RING ALLOCATION" title="How are the 44 active pads allocated" em="across power, motor control, and test?" copy="The wrapper’s pad plan, grouped by function and drawn to scale.">
   <div className="dr-padplan"><div className="dr-padbar" role="img" aria-label={'44 pads: '+padPlan.map(([p,n])=>`${p} ${n}`).join(', ')}>{padPlan.map(([p,n],i)=><span key={p} className={colors[i%4]} style={{flexGrow:n}} title={`${p}: ${n}`}/>)}</div>
    <ul className="dr-padlegend">{padPlan.map(([p,n],i)=><li key={p}><i className={colors[i%4]}/>{p}<b>{n}</b></li>)}</ul></div>
  </Sec>

  <Sec kicker="FOUNDRY SIGN-OFF GATES" title="Which four verification gates" em="must the physical design clear before fabrication?" copy="Every gate runs on the final hardened die; passing three is not enough.">
   <div className="dr-two"><Steps steps={signoffGates} label="Sign-off gates"/><div><Callout label="WHY A CONNECTIVITY GATE">{whyConnectivityGate}</Callout><p className="disclaimer">This page states the gates the die must pass, not their results.</p></div></div>
  </Sec>

  <div className="dr-links dr-sec-gap">
    <button className="text-link" onClick={()=>update({chip:'lite'})}>Interactive 3D architecture model <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('library?pkg=lite-tapein')}>Download Tape-In Block Diagram (PDF) <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('pinout')}>QFN-64 pinout & package limits <ArrowUpRight size={16}/></button>
    <button className="text-link" onClick={()=>go('ask')}>Ask DeepGrid about DRC/LVS & connectivity gates <ArrowUpRight size={16}/></button>
  </div>
 </>;
}
