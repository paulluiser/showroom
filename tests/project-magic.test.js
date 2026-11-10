import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import {readFileSync} from 'node:fs';
import {routeOrbFrame,ROUTE_COVER,ROUTE_DURATION,INVENTORY_PATH} from '../src/projectMagic.js';
import {createLogisticsWorld} from '../src/LogisticsWorld.js';

test('route transition gathers the same orb, changes screens under full cover, and reaches the case target',()=>{
  for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
    const source={x:viewport.width*.7,y:400,radius:24,orbReveal:0},target={x:viewport.width*.8,y:240,radius:70};
    const start=routeOrbFrame(0,source,viewport,target);assert.equal(start.x,source.x);assert.equal(start.radius,24);assert.equal(start.spread,0);assert.equal(start.orbReveal,0);
    const center=routeOrbFrame(640,source,viewport,target);assert.equal(center.x,viewport.width/2);assert.equal(center.y,viewport.height/2);assert.equal(center.orbReveal,1);
    const cover=routeOrbFrame(ROUTE_COVER,source,viewport,target);assert.equal(cover.spread,1);assert.equal(cover.veil,1);assert.equal(cover.cover,true);
    const end=routeOrbFrame(ROUTE_DURATION,source,viewport,target);assert.equal(end.x,target.x);assert.equal(end.y,target.y);assert.equal(end.radius,target.radius);assert.equal(end.veil,0);assert.equal(end.done,true);
    let previous=start;
    for(let t=0;t<=ROUTE_DURATION;t+=4){const f=routeOrbFrame(t,source,viewport,t>ROUTE_COVER?target:undefined);assert.ok(Math.hypot(f.x-previous.x,f.y-previous.y)<12);assert.ok(f.radius>0);previous=f;}
  }
});
test('logistics world has bounded finite architecture and separated moving trucks',()=>{
  const w=createLogisticsWorld();
  const lead=w.group.getObjectByName('delivery-truck-0');const truck=lead.position.clone();let meshes=0;const geometries=[];
  w.group.traverse(o=>{if(o.isMesh){meshes++;geometries.push(o.geometry);for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));}});
  assert.ok(meshes<100);w.update(12,false);assert.ok(lead.position.distanceTo(truck)>1);
  w.update(12,true);const after=[];w.group.traverse(o=>{if(o.isMesh)after.push(o.geometry);});assert.deepEqual(after,geometries);
  const trucks=[0,1,2].map(i=>w.group.getObjectByName(`delivery-truck-${i}`));
  for(let t=0;t<600;t+=2){w.update(t,false);for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(trucks[i].position.distanceTo(trucks[j].position)>2);}
  w.dispose();
});
test('the logistics campus extends past its camera crop and the gantry moves independently', () => {
  const world = createLogisticsWorld();
  try {
    const size = new Box3().setFromObject(world.group).getSize(new Vector3());
    assert.ok(size.x >= 65 && size.z >= 50);
    const trolley = world.group.getObjectByName('gantry-trolley');
    world.update(0, false);
    const start = trolley.position.clone();
    world.update(4, false);
    assert.ok(trolley.position.distanceTo(start) > .5);
  } finally {
    world.dispose();
  }
});
test('dedicated project URL has a production fallback',()=>{
  assert.equal(INVENTORY_PATH,'/projects/inventory-accounting');
  const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  assert.ok(config.rewrites.some(r=>r.source==='/projects/:path*'&&r.destination==='/index.html'));
});
