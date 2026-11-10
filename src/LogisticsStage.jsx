import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createLogisticsWorld } from './LogisticsWorld';
import { createOfficeWorld } from './OfficeWorld';
import { createTourWorld } from './TourWorld';
import { createBroadcastWorld } from './BroadcastWorld';

const projectScenes = {
  enterprise: {
    world: createLogisticsWorld, desktop: [22, -5, 3], portrait: [29, -3.7, -5.5],
    label: 'Illustrated logistics campus with warehouses, a freight yard, a rail spur, a moving gantry and delivery trucks.',
  },
  hris: {
    world: createOfficeWorld, desktop: [17.5, -3.9, 2.7], portrait: [21.5, -1.6, -4.8],
    label: 'Miniature office with staff working at computers, presenting in a meeting, and carrying documents.',
  },
  streaming: {
    world: createBroadcastWorld, desktop: [18.5, -4.1, 1.4], portrait: [20.5, -2.5, -5.8],
    label: 'Conceptual streaming control room with a wall of preview feeds, audio meters, and operators testing playback.',
  },
  operations: {
    world: createTourWorld, desktop: [20, -5.3, 1.7], portrait: [23, -4.6, -6.5],
    label: 'Four hikers follow a trail through a pine-covered mountain valley and cross timber bridges.',
  },
};

export default function LogisticsStage({kind, running, children}) {
  const host=useRef(null), runningRef=useRef(running);
  const config=projectScenes[kind];
  runningRef.current=running;
  useEffect(()=>{
    const el=host.current;let renderer;
    try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});} catch {el.dataset.fallback='true';return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    el.prepend(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-10,10,7,-7,.1,100);
    const world=config.world();scene.add(world.group);
    scene.add(new THREE.HemisphereLight(0xe6f6ff,0x354760,2));
    const sun=new THREE.DirectionalLight(0xffe8ce,3.2);sun.position.set(-8,15,10);sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-26,right:26,top:24,bottom:-24,far:65});sun.shadow.bias=-.001;
    scene.add(sun);
    const edge=new THREE.DirectionalLight(0x83b9ff,1.7);edge.position.set(8,5,-8);scene.add(edge);
    let frame,time=0,last=performance.now(),inView=false,dirty=true;
    const pointer={x:0,y:0},smoothPointer={x:0,y:0};
    const target=new THREE.Vector3();
    const resize=()=>{
      const width=Math.max(1,el.clientWidth),height=Math.max(1,el.clientHeight);renderer.setSize(width,height,false);
      const aspect=width/height;
      const portrait=1-THREE.MathUtils.smoothstep(aspect,.7,1.25);
      const [vertical, x, z]=config.desktop.map((value,index)=>THREE.MathUtils.lerp(value,config.portrait[index],portrait));
      target.set(x,0,z);
      camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();dirty=true;
    };
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const move=e=>{const r=el.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5;};
    const leave=()=>{pointer.x=0;pointer.y=0;};el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);
    const render=now=>{
      frame=null;if(document.hidden||!inView)return;
      const dt=Math.min(.05,(now-last)/1000);last=now;
      const animate=runningRef.current;
      if(animate)time+=dt;
      const light=document.documentElement.dataset.theme==='light';
      const progress=animate?THREE.MathUtils.clamp((innerHeight*.5-el.getBoundingClientRect().top)/innerHeight,-.6,.6):0;
      smoothPointer.x+=(animate?pointer.x-smoothPointer.x:-smoothPointer.x)*.06;
      smoothPointer.y+=(animate?pointer.y-smoothPointer.y:-smoothPointer.y)*.06;
      camera.position.set(target.x+14+smoothPointer.x*.9,22+smoothPointer.y*.5+progress*.6,target.z+19);
      camera.lookAt(target);camera.updateMatrixWorld();
      world.update(time,light);
      world.group.rotation.y=progress*.035;
      if(animate||dirty||el.dataset.light!==String(light)){
        renderer.render(scene,camera);el.dataset.light=String(light);el.dataset.ready='true';dirty=false;
      }
      frame=requestAnimationFrame(render);
    };
    const sync=()=>{cancelAnimationFrame(frame);last=performance.now();dirty=true;if(!document.hidden&&inView)frame=requestAnimationFrame(render);};
    const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();},{rootMargin:'80px'});intersection.observe(el);
    document.addEventListener('visibilitychange',sync);
    return ()=>{
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange',sync);
      el.removeEventListener('pointermove',move);
      el.removeEventListener('pointerleave',leave);
      world.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  },[config]);
  return <div ref={host} className="logistics-stage" role="img" aria-label={config.label}>
    {children}
  </div>;
}
