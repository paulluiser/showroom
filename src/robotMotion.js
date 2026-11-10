import {ease,teamOrbState} from './heroMotion.js';
export const COLLECTION_DURATION=900;
export const POSSESSION_DURATION=1700;
export function robotWakeFrame(elapsed) {
 return {energy:ease(elapsed/1400),unfold:ease((elapsed-500)/1900),eyes:ease((elapsed-1400)/650),live:ease((elapsed-2100)/1000)};
}
export function collectTeamOrb(index,elapsed,tourElapsed) {
 const initial=teamOrbState(index,tourElapsed);
 const mergeTime=elapsed*1800/COLLECTION_DURATION;
 const pull=initial.pull+(1-initial.pull)*ease((mergeTime-index*120)/1100);
 return {...initial,phase:'collision',pull,spawn:1,visibility:initial.visibility*(1-ease((pull-.88)/.12))};
}
export function orbPowerTransfer(from,target,progress,viewport) {
 const t=ease(progress);
 const width=viewport?.width ?? Math.max(from.x,target.x)*1.5;
 const height=viewport?.height ?? Math.max(from.y,target.y)*1.5;
 const reach=Math.min(width*.42,515);
 const curve=[
  {x:from.x,y:from.y},
  {x:Math.min(width*.94,from.x+reach),y:Math.max((viewport?.headerBottom ?? 0)+32,from.y-Math.min(height*.18,164))},
  {x:Math.min(width*.90,target.x+reach*.84),y:target.y+Math.min(height*.09,74)},
  {x:target.x,y:target.y},
 ];
 const s=1-t;
 const weights=[s*s*s,3*s*s*t,3*s*t*t,t*t*t];
 const amount=ease((progress-.02)/.26)*(1-ease((progress-.72)/.28));
 const tangent=axis=>s*s*(curve[1][axis]-curve[0][axis])
  +2*s*t*(curve[2][axis]-curve[1][axis])+t*t*(curve[3][axis]-curve[2][axis]);
 return {
  x:curve.reduce((x,point,i)=>x+point.x*weights[i],0),
  y:curve.reduce((y,point,i)=>y+point.y*weights[i],0),
  radius:from.radius+((target.size ?? from.radius)-from.radius)*t,
  flight:amount>.0001 ? {curve,progress:t,amount,angle:Math.atan2(tangent('y'),tangent('x'))} : null,
 };
}

export function aiOrbArrived(dock,target,frame,headerBottom,height) {
 return dock===1 && !!target?.visible && (frame.chapter ?? 0)===0
  && target.y>headerBottom && target.y<height
  && Math.hypot(frame.x-target.x,frame.y-target.y)<1;
}
