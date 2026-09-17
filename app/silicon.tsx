'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';

// Illustrative DG32 model: a 64-lead QFN body, bond wires, and a 2.9 x 4.5 die whose regions
// follow the six block groups in content.ts. Proportions are indicative, not a mask layout.
type Region={group:number;w:number;d:number;x:number;z:number;tone:string};
const REGIONS:Region[]=[
 {group:0,w:.78,d:1.05,x:-.92,z:-1.55,tone:'#6d6656'},{group:0,w:.78,d:1.05,x:-.08,z:-1.55,tone:'#6d6656'},{group:0,w:1.62,d:.16,x:-.5,z:-.92,tone:'#7b5f45'},
 {group:1,w:.34,d:.5,x:.66,z:-1.83,tone:'#5d6468'},
 {group:2,w:1.2,d:.72,x:-.72,z:.18,tone:'#6a5e4e'},{group:2,w:.52,d:.72,x:.2,z:.18,tone:'#62594c'},
 {group:3,w:.8,d:.62,x:.86,z:1.72,tone:'#4f5e5b'},{group:3,w:.62,d:.58,x:-.1,z:1.0,tone:'#655a49'},{group:3,w:.62,d:.58,x:-.9,z:1.0,tone:'#655a49'},
 {group:4,w:.44,d:.52,x:-1.02,z:1.78,tone:'#5a5f58'},{group:4,w:.44,d:.52,x:-.5,z:1.78,tone:'#5a5f58'},{group:4,w:.44,d:.52,x:.02,z:1.78,tone:'#5a5f58'},
 {group:5,w:2.6,d:.22,x:0,z:-.52,tone:'#77623f'},{group:5,w:.5,d:.62,x:.96,z:.18,tone:'#5f5a50'},{group:5,w:.62,d:.58,x:.7,z:1.0,tone:'#5f5a50'},
];

export default function Silicon({selected=-1,exploded=false,reduced=false,label='Interactive 3D model of the DG32 package and die. Drag to rotate.'}:{selected?:number;exploded?:boolean;reduced?:boolean;label?:string}){
const host=useRef<HTMLDivElement>(null),state=useRef({selected,exploded,reduced});state.current={selected,exploded,reduced};
useEffect(()=>{const el=host.current!;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power',precision:'mediump',preserveDrawingBuffer:false});}catch{el.classList.add('silicon-fallback');return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#101212',0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;el.appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(7.5,9.5,10.5);camera.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight('#e2e9ec','#352714',2.3));const key=new THREE.DirectionalLight('#ffcf92',3.8);key.position.set(3,8,4);scene.add(key);const rim=new THREE.DirectionalLight('#afbdce',1.8);rim.position.set(-5,3,-4);scene.add(rim);
const group=new THREE.Group();scene.add(group);
const mat=(color:string,metalness=.6,roughness=.4)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=group)=>{const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);parent.add(a);return a;};
const copper=mat('#b99062',.8,.3);
const body=box(6.4,.34,6.4,0,-.2,0,mat('#1b1f1f',.2,.75));
// 16 leads per side = 64 pins, 0.5 mm pitch drawn at 0.36 units.
for(let i=0;i<16;i++){const v=(i-7.5)*.36;box(.16,.06,.34,v,-.34,3.3,copper,body);box(.16,.06,.34,v,-.34,-3.3,copper,body);box(.34,.06,.16,3.3,-.34,v,copper,body);box(.34,.06,.16,-3.3,-.34,v,copper,body);}
body.children.forEach(c=>c.position.y=-.14);
const die=new THREE.Group();group.add(die);box(2.9,.12,4.5,0,.03,0,mat('#8a9091',.75,.3),die);
const wires:number[]=[];for(let i=0;i<16;i++){const v=(i-7.5)*.36,dz=THREE.MathUtils.clamp(v*1.3,-2.1,2.1),dx=THREE.MathUtils.clamp(v*.8,-1.35,1.35);wires.push(1.45,.1,dz,3.0,-.02,v,-1.45,.1,dz,-3.0,-.02,v,dx,.1,2.25,v,-.02,3.0,dx,.1,-2.25,v,-.02,-3.0);}
const wireGeo=new THREE.BufferGeometry();wireGeo.setAttribute('position',new THREE.Float32BufferAttribute(wires,3));const wireLines=new THREE.LineSegments(wireGeo,new THREE.LineBasicMaterial({color:'#c9a06c',transparent:true,opacity:.45}));group.add(wireLines);
const regions=REGIONS.map(r=>{const m=new THREE.MeshStandardMaterial({color:r.tone,metalness:.55,roughness:.38,emissive:'#c07a36',emissiveIntensity:0});const mesh=box(r.w,.08,r.d,r.x,.13,r.z,m,die);if(r.group===0&&r.w<1)for(let row=0;row<5;row++)for(let col=0;col<4;col++)box(.13,.02,.13,(col-1.5)*.17,.05,(row-2)*.19,(row+col)%3?mat('#9aa0a0'):copper,mesh);return {mesh,m,r};});
// 16 dual-port SRAM macros.
for(let row=0;row<4;row++)for(let col=0;col<4;col++){const m=new THREE.MeshStandardMaterial({color:'#7c8488',metalness:.7,roughness:.3,emissive:'#c07a36',emissiveIntensity:0});regions.push({mesh:box(.2,.08,.24,.62+col*.22-.05,.13,-1.3-row*.28+.2,m,die),m,r:{group:1,w:.2,d:.24,x:0,z:0,tone:''}});}
let frame=0,last=0,angle=-.5,drag=false,px=0;const down=(e:PointerEvent)=>{drag=true;px=e.clientX;el.setPointerCapture(e.pointerId)};const move=(e:PointerEvent)=>{if(drag){angle+=(e.clientX-px)*.008;px=e.clientX}};const up=()=>{drag=false};
const onKeyDown=(e:KeyboardEvent)=>{
  if(e.key==='ArrowLeft'){angle-=0.1;e.preventDefault();}
  else if(e.key==='ArrowRight'){angle+=0.1;e.preventDefault();}
};
el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
el.addEventListener('keydown',onKeyDown);
let lw=0,lh=0;const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h||(w===lw&&h===lh))return;lw=w;lh=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};resize();const observer=new ResizeObserver(resize);observer.observe(el);
const active={value:true};const visibility=new IntersectionObserver(([e])=>{active.value=e.isIntersecting});visibility.observe(el);
const tick=(t:number)=>{frame=requestAnimationFrame(tick);if(!active.value||document.hidden||t-last<32)return;last=t;const s=state.current,k=s.reduced?1:.12;if(!s.reduced&&!drag)angle+=.0012;group.rotation.y=angle;
die.position.y=THREE.MathUtils.lerp(die.position.y,s.exploded?.9:0,k);wireLines.material.opacity=THREE.MathUtils.lerp(wireLines.material.opacity,s.exploded?.08:.45,k);
regions.forEach(({mesh,m,r})=>{const on=r.group===s.selected;mesh.position.y=THREE.MathUtils.lerp(mesh.position.y,s.exploded?.25+r.group*.09:.13,k);m.emissiveIntensity=THREE.MathUtils.lerp(m.emissiveIntensity,on?.6:0,k);});
renderer.render(scene,camera)};tick(0);
return()=>{cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('keydown',onKeyDown);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};},[]);
return <div className="silicon-canvas" ref={host} role="region" tabIndex={0} aria-label={`${label} Use Left and Right arrow keys to rotate the 3D model.`}/>;
}
