import test from 'node:test';
import assert from 'node:assert/strict';
import * as robotMotion from '../src/robotMotion.js';
const {orbPowerTransfer, aiOrbArrived} = robotMotion;
import {speechEnvelope} from '../src/speechMotion.js';
import {readFileSync} from 'node:fs';
test('orb transfer retains the same visible sphere at the AI stage',()=>{
 const f=orbPowerTransfer({x:700,y:300,radius:140}, {x:1100,y:550,size:120},1);
 assert.equal(f.x,1100);assert.equal(f.y,550);assert.equal(f.radius,120);
 assert.equal(f.flight,null);
});
test('the shared orb renderer uses automatic speech with no second AI sphere',()=>{
 const source=readFileSync(new URL('../src/Scene.jsx',import.meta.url),'utf8');
 assert.ok(source.includes('speechEnvelope(time)'));
 assert.ok(!source.includes('createSpeakingOrb'));
 const samples=Array.from({length:100},(_,i)=>speechEnvelope(i*.1));
 assert.ok(samples.every(n=>n>=0 && n<=1));assert.ok(Math.max(...samples)-Math.min(...samples)>.5);
});
test('the transfer stretches into liquid along an uneven arc over the AI panel',()=>{
 const from={x:720,y:300,radius:100},to={x:420,y:590,size:125};
 const viewport={width:1440,height:900,headerBottom:96};
 let previous=orbPowerTransfer(from,to,0,viewport);
 let crossesPanel=false;
 for(let i=1;i<=1000;i++){
  const current=orbPowerTransfer(from,to,i/1000,viewport);
  assert.ok(current.radius>=100 && current.radius<=125);
  assert.ok(Math.hypot(current.x-previous.x,current.y-previous.y)<4);
  assert.ok(Math.abs(current.radius-previous.radius)<1);
  if (current.x>700 && current.y>340 && current.y<600 && current.flight?.amount>.9) crossesPanel=true;
  previous=current;
 }
 assert.ok(crossesPanel);
 const start=orbPowerTransfer(from,to,0,viewport);
 const middle=orbPowerTransfer(from,to,.5,viewport);
 assert.deepEqual(start,{...from,flight:null});
 assert.equal(middle.flight.amount,1);
 assert.notEqual(middle.x,(from.x+to.x)/2);
 assert.equal(previous.flight,null);
});

test('AI playback needs a fully docked orb at the visible stage center',()=>{
 const target={x:170,y:390,visible:true};
 assert.equal(aiOrbArrived(.99,target,{x:170,y:390,chapter:0},80,700),false);
 assert.equal(aiOrbArrived(1,target,{x:175,y:390,chapter:0},80,700),false);
 assert.equal(aiOrbArrived(1,target,{x:170,y:390,chapter:.1},80,700),false);
 assert.equal(aiOrbArrived(1,target,{x:170,y:390,chapter:0},80,700),true);
});

test('the mobile flight bows toward the side of the frame and returns to center',()=>{
 const from={x:180,y:285,radius:70},to={x:180,y:422,size:73};
 const viewport={width:360,height:760,headerBottom:80};
 const middle=orbPowerTransfer(from,to,.5,viewport);
 assert.ok(middle.x>220 && middle.x<325);
 assert.ok(middle.flight.curve.every(point=>point.x>=0 && point.x<=360));
 assert.deepEqual(orbPowerTransfer(from,to,1,viewport),{x:180,y:422,radius:73,flight:null});
});

test('every remaining team orb merges completely before the possession can begin', async()=>{
 const {collectTeamOrb,COLLECTION_DURATION,POSSESSION_DURATION}=await import('../src/robotMotion.js');
 assert.ok(COLLECTION_DURATION + POSSESSION_DURATION < 2800);
 for(const tour of [0,8000,18000,28000]){
  for(let i=0;i<5;i++){
   const end=collectTeamOrb(i,COLLECTION_DURATION,tour);
   assert.equal(end.pull,1);assert.equal(end.visibility,0);
  }
 }
 const start=collectTeamOrb(4,0,0),middle=collectTeamOrb(4,COLLECTION_DURATION*.6,0);
 assert.equal(start.pull,0);assert.ok(middle.pull>0 && middle.pull<1);
});
