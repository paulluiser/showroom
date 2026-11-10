import {useEffect,useRef} from 'react';
import {appendTrailPoint,visibleTrailPoints,TRAIL_LIFETIME} from './cursorTrailState';

export default function CursorTrail({paused}) {
 const host=useRef(null);
 useEffect(()=>{
  const canvas=host.current,ctx=canvas.getContext('2d');
  if(!ctx)return;
  const fine=matchMedia('(any-pointer: fine)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let points=[],frame=null;
  const clear=()=>{cancelAnimationFrame(frame);frame=null;points=[];ctx.clearRect(0,0,innerWidth,innerHeight);};
  const enabled=()=>!paused && fine.matches && !reduce.matches && !document.hidden;
  const resize=()=>{
   clear();const dpr=Math.min(devicePixelRatio,1.5);
   canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const draw=now=>{
   frame=null;
   ctx.clearRect(0,0,innerWidth,innerHeight);
   points=visibleTrailPoints(points,now);
   if(!enabled()){clear();return;}
   ctx.lineCap='round';ctx.lineJoin='round';
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];
    if(Math.hypot(a.x-b.x,a.y-b.y)>110)continue;
    const life=Math.max(0,1-(now-b.time)/TRAIL_LIFETIME);
    const colors=['#4befff','#518dff','#a18aff','#f16ec4'];
    const color=colors[Math.min(3,Math.floor(i/points.length*4))];
    ctx.strokeStyle=color;
    // Soft energy filament with a thin luminous center.
    ctx.globalAlpha=life*life*.10;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.globalAlpha=life*life*.62;ctx.lineWidth=.6+life*1.4;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   }
   ctx.globalAlpha=1;
   if(points.length)frame=requestAnimationFrame(draw);
  };
  const move=e=>{
   if(e.pointerType!=='mouse'||!enabled())return;
   // Preserve the pure-black, energy-only entrance composition.
   if(document.querySelector('.cinematic-hero:not(.intro-complete)'))return;
   points=appendTrailPoint(points,{x:e.clientX,y:e.clientY,time:performance.now()});
   if(frame===null)frame=requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('resize',resize);
  window.addEventListener('blur',clear);
  document.documentElement.addEventListener('pointerleave',clear);
  document.addEventListener('visibilitychange',clear);
  fine.addEventListener('change',clear);reduce.addEventListener('change',clear);
  return ()=>{
   clear();window.removeEventListener('pointermove',move);window.removeEventListener('resize',resize);
   window.removeEventListener('blur',clear);document.documentElement.removeEventListener('pointerleave',clear);
   document.removeEventListener('visibilitychange',clear);fine.removeEventListener('change',clear);reduce.removeEventListener('change',clear);
  };
 },[paused]);
 return <canvas className="cursor-trail" ref={host} aria-hidden="true"/>;
}
