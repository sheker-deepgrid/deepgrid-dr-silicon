'use client';
import {useEffect,useRef,useState} from 'react';
export type Route={view:string;params:URLSearchParams};
export const views=['overview','library','family','architecture','control','pinout','roadmap','ask'];
function parse(hash:string):Route{const [v,q='']=hash.replace(/^#/,'').split('?');return {view:views.includes(v)?v:'overview',params:new URLSearchParams(q)};}
export function useNavigation(){
 const [route,setRoute]=useState<Route>({view:'overview',params:new URLSearchParams()});
 const current=useRef('overview'),positions=useRef<Record<string,number>>({});
 const apply=(hash:string)=>{const r=parse(hash),target=hash.replace(/^#/,'');const y=positions.current[target]||0;current.current=target;setRoute(r);requestAnimationFrame(()=>requestAnimationFrame(()=>{scrollTo({top:y,behavior:'instant'});}));};
 useEffect(()=>{apply(location.hash||'#overview');const sync=()=>apply(location.hash||'#overview');const remember=()=>{positions.current[current.current]=scrollY;};addEventListener('popstate',sync);addEventListener('hashchange',sync);addEventListener('scroll',remember,{passive:true});return()=>{removeEventListener('popstate',sync);removeEventListener('hashchange',sync);removeEventListener('scroll',remember);};},[]);
 const go=(hash:string,replace=false)=>{const target=hash.replace(/^#/,'');positions.current[current.current]=scrollY;history[replace?'replaceState':'pushState']({deepgrid:true},'','#'+target);apply(target);};
 const navigate=(view:string)=>go(view);
 const update=(changes:Record<string,string|undefined>)=>{const params=new URLSearchParams(route.params);for(const [k,v] of Object.entries(changes)){if(v)params.set(k,v);else params.delete(k);}const hash=route.view+(params.size?'?'+params:'');history.replaceState(history.state,'','#'+hash);positions.current[hash]=scrollY;current.current=hash;setRoute({...route,params});};
 return {route,navigate,go,update};
}
