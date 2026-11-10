import { useEffect, useRef } from 'react';
import { restingOrbFrame, routeOrbFrame, ROUTE_COVER } from './projectMagic';

export default function OrbRouteTransition({transaction,motion,onCover,onDone}) {
  const overlay=useRef(null),callbacks=useRef({onCover,onDone});callbacks.current={onCover,onDone};
  useEffect(()=>{
    if(!transaction)return;
    let frame,covered=false;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const draw=now=>{
      const age=Math.max(0,now-transaction.at);
      const rect=covered?document.getElementById('case-orb-stage')?.getBoundingClientRect():null;
      const destination=rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2,radius:rect.width*.34}:undefined;
      const f=routeOrbFrame(age,transaction.source,{width:innerWidth,height:innerHeight},destination);
      motion.current={...restingOrbFrame({...f,project:transaction.project}),transitioning:true,collisionGlow:Math.sin(Math.PI*Math.min(1,age/1100))*.7};
      overlay.current.style.setProperty('--bloom-radius',`${Math.hypot(innerWidth,innerHeight)*1.15*f.spread}px`);
      overlay.current.style.opacity=f.veil;
      if(age>=ROUTE_COVER&&!covered){covered=true;callbacks.current.onCover();}
      if(f.done){callbacks.current.onDone();return;}
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);document.body.style.overflow=overflow;};
  },[transaction,motion]);
  return <div ref={overlay} className="orb-route-veil" aria-hidden="true"><div/><div/><div/></div>;
}
