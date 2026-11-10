import { teams } from "./teams.js";
export const clamp = (n) => Math.max(0, Math.min(1, n));
export const ease = (n) => { const t=clamp(n); return t*t*(3-2*t); };
const mix=(a,b,t)=>a+(b-a)*t;
export function heroFrame({width:w,height:h,intro,center,dock,horizonReveal,landing,headerBottom=headerZone(w)}) {
  const mobile=w<=700;
  const landingX=mobile?w*.5:w*.74;
  const landingY=mobile?(landing?.y ?? h*.59):h*.48;
  const radius=mobile && landing ? landing.radius : Math.min(w*(mobile?.27:.155),h*(mobile?.18:.24));
  const dockY=h-(mobile?112:54);
 const limits=teamStage(w,h,headerBottom);
 const centeredRadius=Math.min(radius*(mobile?.70:.78),Math.max(12,(limits.ry-limits.edge-12)/1.1));
  return {
    x:mix(mix(w*.5,landingX,intro),w*.5,center)*(1-dock)+(w-54)*dock,
    y:mix(mix(h*.5,landingY,intro),limits.centerY,center)*(1-dock)+dockY*dock-Math.sin(dock*Math.PI)*h*.12,
    radius:mix(mix(radius,centeredRadius,center)*(.025+.975*intro),27,dock),
    horizon: clamp(horizonReveal ?? (intro===1?1:0))*(1-dock),
    build: intro,
    teamVisibility: intro === 1 ? center*(1-dock) : 0,
    qualityVisibility: (1-ease((intro-.68)/.32))*(1-dock),
  };
}
export const TEAM_DURATION=5500;
export const CENTER_DURATION=900;
export const REGENERATE_DURATION=1700;
export const TEAM_CYCLE_DURATION=TEAM_DURATION*teams.length+REGENERATE_DURATION;
export function tourStep(elapsed) {
 const time=Math.max(0,elapsed)%TEAM_CYCLE_DURATION;
 return {index:time>=TEAM_DURATION*teams.length?0:Math.floor(time/TEAM_DURATION),phase:time>=TEAM_DURATION*teams.length?'birth':'spotlight'};
}
export function teamOrbState(index,elapsed) {
 const time=Math.max(0,elapsed)%TEAM_CYCLE_DURATION;
 const birthAt=TEAM_DURATION*teams.length;
 if(time>=birthAt){
  const spawn=ease((time-birthAt-index*100)/1000);
  return {phase:'birth',spawn,pull:0,visibility:spawn,focus:0};
 }
 const active=Math.floor(time/TEAM_DURATION),age=time%TEAM_DURATION;
 if(index<active)return {phase:'consumed',spawn:1,pull:1,visibility:0,focus:0};
 const pull=index===active?ease((age-4300)/1200):0;
 return {phase:pull>0?'collision':'spotlight',spawn:1,pull,visibility:1-ease((pull-.85)/.15),focus:index===active?1:0};
}
// Inclined, eccentric paths with distinct speeds; z controls real occlusion.
export function orbitPoint(index,time,radius,build) {
  const angle=time*(.34+index*.047)+index*2.39996;
  const tilt=.28+(index%4)*.35;
  const spread=build === undefined ? 1 : (1-ease(build))*4;
  const r=radius*(1.55+(index%3)*.18)*spread;
  return {x:Math.cos(angle)*r,y:Math.sin(angle)*r*Math.sin(tilt)*.65,z:Math.sin(angle)*r*Math.cos(tilt)};
}

const QUALITY_STARTS=[0,180,395,550,745,915,1140,1310,1490];
const origins=[[-.15,.2],[1.15,.68],[.12,-.15],[.88,1.15],[-.15,.82],[.75,-.15],[1.15,.12],[.23,1.15],[-.15,.45]];
const sizes=[12,21,16,25,14,20,11,23,17];
export const INTRO_SETTLE_DURATION=2400;
export const FUSION_START=1750;
export const FUSION_DURATION=1050;
export const INTRO_DURATION=FUSION_START+FUSION_DURATION+INTRO_SETTLE_DURATION;
export function qualityBeat(index,elapsed) {
  const start=QUALITY_STARTS[index];
  const local=elapsed-start;
  const arrival=130+(index%3)*15;
  const impact=FUSION_START+FUSION_DURATION;
  const active=local>=0 && elapsed<impact+360;
  return {
    start,
    entry:ease(local/arrival),
    visibility:active ? 1-ease((elapsed-impact)/360) : 0,
    labelOpacity:active ? ease((local-arrival)/60)*(1-ease((local-350)/180)) : 0,
    pull:Math.pow(clamp((elapsed-FUSION_START)/FUSION_DURATION),2.4),
    pulse:active ? Math.exp(-Math.pow((elapsed-impact)/300,2)) : 0,
  };
}
export function qualityArrival(index,elapsed,{width,height,coreX,coreY,radius}) {
  const beat=qualityBeat(index,elapsed);
  const origin=origins[index];
  const drift=elapsed*.0018;
  const angle=index*Math.PI*2/9-Math.PI/2+drift*(.7+(index%3)*.14)+Math.sin(drift+index)*.12;
  const flow=1+Math.sin(drift*1.4+index)*.07;
  const targetX=Math.cos(angle)*Math.min(width*.34,radius*1.9)*flow;
  const targetY=Math.sin(angle)*Math.min(height*.29,radius*1.9)*flow;
  const sx=origin[0]*width-coreX,sy=origin[1]*height-coreY;
  // A cubic path meets the moving gathering orbit with a soft tangent.
  const u=beat.entry,v=1-u;
  const bend=radius*(index%2===0?-.65:.7);
  const c1x=sx*.55+bend,c1y=sy*.72;
  const c2x=targetX+Math.sin(angle)*radius*.35,c2y=targetY-Math.cos(angle)*radius*.35;
  const x=v*v*v*sx+3*v*v*u*c1x+3*v*u*u*c2x+u*u*u*targetX;
  const y=v*v*v*sy+3*v*v*u*c1y+3*v*u*u*c2y+u*u*u*targetY;
  const pull=beat.pull,arc=Math.sin(pull*Math.PI)*(1-pull);
  return {
    x:x*(1-pull)+arc*radius*Math.cos(index*1.7),
    y:y*(1-pull)+arc*radius*Math.sin(index*1.7)*1.3,
    z:radius*(.25+Math.sin(drift+index)*.15)*Math.sin(beat.entry*Math.PI/2)*(1-pull),
    size:sizes[index]*(width<=700?.8:1),
    visibility:beat.visibility,
    labelOpacity:beat.labelOpacity,
    pulse:beat.pulse,pull,
  };
}

export function collisionFrame(elapsed) {
  const after=elapsed-FUSION_START-FUSION_DURATION;
  return {
    orbReveal:ease((after-150)/650),
    formation:ease((after-150)/1050),
    settle:ease((after-500)/(INTRO_SETTLE_DURATION-500)),
    copyReveal:ease((after-1450)/750),
    landscapeReveal:ease(after/INTRO_SETTLE_DURATION),
    orbScale:after>150 ? .68+.32*ease((after-150)/1050) : 0,
    compression:after<0 ? ease((after+450)/450) : 0,
  };
}

export function advanceHeroCenter(current,scroll,dt,paused,introComplete) {
  if(!introComplete) return 0;
  const target=scroll>12?CENTER_DURATION:0;
  if(paused) return target;
  return target>current ? Math.min(target,current+dt) : Math.max(target,current-dt);
}

export function advanceDock(current,target,dt,paused) {
 if(paused)return target;
 const step=dt/800;
 return target>current?Math.min(target,current+step):Math.max(target,current-step);
}
export function headerZone(width) {return width<=700?80:96;}
export function teamLabelPositions(width,height) {
 const mobile=width<=700,gap=mobile?4:12;
 const size=Math.min(mobile?90:100,(width-24-gap*4)/teams.length);
 const total=size*teams.length+gap*4,start=(width-total)/2;
 return teams.map((_,i)=>({x:start+i*(size+gap)+size/2,y:height*(mobile?.62:.60),width:size}));
}
// The full projected silhouette, including breathing and active emphasis, stays in this stage.
function teamStage(width,height,headerBottom) {
 const bound=width<=700?24:43;
 const projection=1/(1-2*Math.tan(Math.PI/9)*.045);
 const edge=bound*projection;
 const bottom=height*(width<=700?.56:.53);
 const centerY=(headerBottom+bottom)/2;
 return {bound,edge,centerY,rx:width/2-edge-16,ry:(bottom-headerBottom)/2-edge-12};
}
export function teamOrbitPositions(time,{width,height,centerX,centerY,mainRadius,headerBottom=headerZone(width)}) {
 const stage=teamStage(width,height,headerBottom);
 const rx=Math.max(0,Math.min(stage.rx,centerX-stage.edge-16,width-centerX-stage.edge-16));
 const ry=Math.max(0,Math.min(stage.ry,centerY-headerBottom-stage.edge-12,height*(width<=700?.56:.53)-centerY-stage.edge-12));
 // Equal arc-length slots preserve spacing; individual phase drift can briefly reverse.
 const samples=[];let length=0,previous;
 for(let i=0;i<=128;i++){
  const angle=i/128*Math.PI*2;
  const point={x:Math.cos(angle)*rx,y:Math.sin(angle)*ry};
  if(previous)length+=Math.hypot(point.x-previous.x,point.y-previous.y);
  samples.push({...point,length});previous=point;
 }
 return teams.map((_,index)=>{
  const direction=index%2===0?1:-1;
  const drift=Math.sin(time*(.7+index*.11)+index*1.3)*.022*direction;
  const progress=((time*.008+index/teams.length+drift)%1+1)%1;
  const distance=progress*length;
  let segment=1;while(segment<samples.length-1 && samples[segment].length<distance)segment++;
  const from=samples[segment-1],to=samples[segment];
  const blend=(distance-from.length)/Math.max(.001,to.length-from.length);
  const z=Math.sin(time*(.31+index*.067)*direction+index*1.7)*height*.045;
  const projection=8/(8-z*(2*Math.tan(Math.PI/9)*8/height));
  return {x:mix(from.x,to.x,blend)/projection,y:mix(from.y,to.y,blend)/projection,z,bound:stage.bound};
 });
}
export function teamOrbitPosition(index,time,stage) {return teamOrbitPositions(time,stage)[index];}

export function teamCollisionGlow(elapsed) {
 const time=Math.max(0,elapsed)%TEAM_CYCLE_DURATION;
 const previousImpact=Math.floor(time/TEAM_DURATION)*TEAM_DURATION;
 if(previousImpact<TEAM_DURATION)return 0;
 const age=time-previousImpact;
 if(age>=1000)return 0;
 return ease(age/120)*(1-ease((age-120)/880));
}

export const IMPACT_RADIATION_DURATION = 1100;

export function impactRadiation(age) {
 const spread=1-Math.pow(1-clamp(age/IMPACT_RADIATION_DURATION),3);
 const opacity=ease(age/90)*(1-ease((age-90)/(IMPACT_RADIATION_DURATION-90)));
 return {spread,opacity};
}

export function collisionRadiation(elapsed) {
 const time=Math.max(0,elapsed)%TEAM_CYCLE_DURATION;
 const impact=Math.floor(time/TEAM_DURATION)*TEAM_DURATION;
 if(impact<TEAM_DURATION)return {spread:0,opacity:0};
 return impactRadiation(time-impact);
}

export function entranceBlast(elapsed) {
 const age=elapsed-FUSION_START-FUSION_DURATION;
 if(age<=0 || age>=INTRO_SETTLE_DURATION)return {opacity:0,spread:age>0?1:0,shakeX:0,shakeY:0,age:0};
 return {opacity:ease(age/120)*(1-ease((age-250)/(INTRO_SETTLE_DURATION-250))),spread:1-Math.pow(1-age/INTRO_SETTLE_DURATION,2),shakeX:0,shakeY:0,age:age/1000};
}

export function impactBreath(age) {
 if(age<0 || age>=700)return 0;
 return age<80?ease(age/80):1-ease((age-80)/620);
}
export function teamCollisionBreath(elapsed) {
 const time=Math.max(0,elapsed)%TEAM_CYCLE_DURATION;
 return time<TEAM_DURATION?0:impactBreath(time%TEAM_DURATION);
}
