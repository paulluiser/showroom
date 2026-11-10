import test from 'node:test';
import assert from 'node:assert/strict';
import { heroFrame, tourStep } from '../src/heroMotion.js';
test('orb builds from a seed into the right-hand landing composition during the staged assembly', () => {
  const start=heroFrame({width:1440,height:900,intro:0,center:0,dock:0});
  const end=heroFrame({width:1440,height:900,intro:1,center:0,dock:0});
  assert.ok(start.radius < end.radius * .1);
  assert.equal(start.x,720);
  assert.equal(end.x,1440*.74);
});
test('centering and docking preserve the same orb and keep its assistant target within mobile bounds', () => {
  const centered=heroFrame({width:390,height:844,intro:1,center:1,dock:0});
  const docked=heroFrame({width:390,height:844,intro:1,center:1,dock:1});
  assert.equal(centered.x,195);
  assert.equal(docked.radius,27);
  assert.ok(docked.x+docked.radius<390);
  assert.ok(docked.y+docked.radius<844-60);
});
test('tour loops seamlessly through all five teams', () => {
  assert.deepEqual([0,5500,11000,16500,22000].map(t=>tourStep(t).index),[0,1,2,3,4]);
  assert.equal(tourStep(27500).index,0);
  assert.equal(tourStep(34700).index,1);
  assert.ok(tourStep(999999).index>=0 && tourStep(999999).index<5);
});

test('inclined orbits cross both depth planes and have different paths', async () => {
 const {orbitPoint}=await import('../src/heroMotion.js');
 const points=Array.from({length:100},(_,i)=>orbitPoint(0,i*.2,100));
 assert.ok(points.some(p=>p.z>0)&&points.some(p=>p.z<0));
 assert.notDeepEqual(orbitPoint(0,2,100),orbitPoint(1,2,100));
 assert.ok(Math.abs(orbitPoint(0,0,100,0).x)>Math.abs(orbitPoint(0,0,100,1).x));
});

test('quality orbs disappear after formation and stay gone through centering and docking', () => {
  const frame=(intro,center=0,dock=0)=>heroFrame({width:1440,height:900,intro,center,dock});
  assert.ok(frame(.5).qualityVisibility>0);
  assert.equal(frame(1).qualityVisibility,0);
  assert.equal(frame(1,1).qualityVisibility,0);
  assert.equal(frame(1,1,1).qualityVisibility,0);
});

test('team orbs appear on centering independently of the completed quality assembly', () => {
 const frame=(intro,center,dock=0)=>heroFrame({width:1440,height:900,intro,center,dock});
 assert.equal(frame(.5,0).teamVisibility,0);
 assert.equal(frame(1,0).teamVisibility,0);
 assert.equal(frame(1,1).teamVisibility,1);
 assert.equal(frame(1,1).qualityVisibility,0);
 assert.equal(frame(1,1,1).teamVisibility,0);
});

test('quality orbs arrive individually, accumulate, and share one fusion event', async () => {
 const {qualityBeat,FUSION_START,FUSION_DURATION,INTRO_DURATION}=await import('../src/heroMotion.js');
 const starts=Array.from({length:9},(_,i)=>qualityBeat(i,0).start);
 assert.equal(new Set(starts).size,9);
 for(let t=0;t<FUSION_START;t+=50) {
  const beats=Array.from({length:9},(_,i)=>qualityBeat(i,t));
  assert.ok(beats.filter(b=>b.entry>0&&b.entry<1).length<=1);
  assert.ok(beats.every(b=>b.pull===0));
 }
 assert.ok(Array.from({length:9},(_,i)=>qualityBeat(i,FUSION_START).visibility).every(v=>v===1));
 const pulls=Array.from({length:9},(_,i)=>qualityBeat(i,FUSION_START+FUSION_DURATION/2).pull);
 assert.ok(pulls[0]>0 && pulls[0]<1);
 assert.equal(new Set(pulls).size,1);
 assert.ok(Array.from({length:9},(_,i)=>qualityBeat(i,INTRO_DURATION).visibility).every(v=>v===0));
});

test('quality arrivals start outside each viewport with varied sizes and origins', async () => {
 const {qualityArrival,qualityBeat}=await import('../src/heroMotion.js');
 for(const [width,height] of [[1440,900],[390,844]]) {
  const viewport={width,height,coreX:width/2,coreY:height/2,radius:width*.15};
  const arrivals=Array.from({length:9},(_,i)=>qualityArrival(i,qualityBeat(i,0).start,viewport));
  arrivals.forEach(p=>{
   const x=p.x+viewport.coreX,y=p.y+viewport.coreY;
   assert.ok(x<0||x>width||y<0||y>height);
  });
  assert.ok(new Set(arrivals.map(p=>p.size)).size>4);
  assert.ok(new Set(arrivals.map(p=>`${p.x},${p.y}`)).size===9);
 }

});

test('entrance finishes with slower cinematic pacing and gathered orbs keep moving before the single fusion', async () => {
 const {INTRO_DURATION,FUSION_START,qualityArrival}=await import('../src/heroMotion.js');
 assert.equal(INTRO_DURATION,5200);
 const viewport={width:1440,height:900,coreX:720,coreY:450,radius:200};
 const a=qualityArrival(0,FUSION_START-400,viewport);
 const b=qualityArrival(0,FUSION_START-150,viewport);
 assert.ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)>10);
});

test('horizon remains hidden during assembly and fades in only after the shared fusion', () => {
 const frame=(intro,horizonReveal,dock=0)=>heroFrame({width:1440,height:900,intro,center:0,dock,horizonReveal});
 [0,.2,.6,.99].forEach(intro=>assert.equal(frame(intro).horizon,0));
 assert.equal(frame(1,0).horizon,0);
 assert.equal(frame(1,.5).horizon,.5);
 assert.equal(frame(1,1).horizon,1);
 assert.equal(frame(1,1,1).horizon,0);
});

test('main orb is absent until collision and emerges gradually', async () => {
 const {collisionFrame,FUSION_START,FUSION_DURATION,INTRO_DURATION}=await import('../src/heroMotion.js');
 const impact=FUSION_START+FUSION_DURATION;
 [0,FUSION_START,impact-1,impact].forEach(t=>assert.equal(collisionFrame(t).orbReveal,0));
 assert.equal(collisionFrame(impact+100).orbReveal,0);
 assert.ok(collisionFrame(impact+250).orbReveal>0);
 assert.equal(collisionFrame(INTRO_DURATION).orbReveal,1);
 assert.ok(collisionFrame(impact+100).orbReveal<.2);
 assert.ok(collisionFrame(impact+300).orbScale>collisionFrame(impact+100).orbScale);
});

test('landscape reveal radiates outward after impact and completes at the end of the cutscene', async () => {
 const {collisionFrame,FUSION_START,FUSION_DURATION,INTRO_DURATION}=await import('../src/heroMotion.js');
 const impact=FUSION_START+FUSION_DURATION;
 assert.equal(collisionFrame(impact-1).landscapeReveal,0);
 assert.equal(collisionFrame(impact).landscapeReveal,0);
 assert.ok(collisionFrame(impact+250).landscapeReveal>0);
 assert.ok(collisionFrame(impact+800).landscapeReveal>collisionFrame(impact+250).landscapeReveal);
 assert.equal(collisionFrame(INTRO_DURATION).landscapeReveal,1);
});

test('hero centering reverses at the top and can be entered again without replaying the cutscene', async () => {
 const {advanceHeroCenter}=await import('../src/heroMotion.js');
 let center=0;
 for(let i=0;i<22;i++) center=advanceHeroCenter(center,100,50,false,true);
 assert.equal(center,900);
 for(let i=0;i<22;i++) center=advanceHeroCenter(center,0,50,false,true);
 assert.equal(center,0);
 assert.equal(advanceHeroCenter(center,100,50,false,true),50);
 assert.equal(advanceHeroCenter(1100,0,50,true,true),0);
 assert.equal(advanceHeroCenter(0,100,50,false,false),0);
});

test('collision and landscape have a longer soft transition without a circular shockwave', async () => {
 const {FUSION_DURATION,FUSION_START,INTRO_SETTLE_DURATION,collisionFrame}=await import('../src/heroMotion.js');
 assert.equal(FUSION_DURATION,1050);
 assert.equal(INTRO_SETTLE_DURATION,2400);
 const after=collisionFrame(FUSION_START+FUSION_DURATION+250);
 assert.ok(after.landscapeReveal>0 && after.landscapeReveal<.1);
 assert.equal(after.shockRadius,undefined);
 assert.equal(after.shockOpacity,undefined);
});

test('mobile landing orb respects measured content clearance instead of a fixed viewport position', () => {
 for(const height of [568,844]) {
  const copyBottom=380, radius=95;
  const f=heroFrame({width:390,height,intro:1,center:0,dock:0,landing:{y:copyBottom+32+radius,radius}});
  assert.ok(f.y-f.radius>=copyBottom+32);
  assert.equal(f.radius,radius);
  const docked=heroFrame({width:390,height,intro:1,center:1,dock:1,landing:{y:600,radius}});
  assert.equal(docked.radius,27);
 }
});

test('team labels stay outside the reading area while orbit paths remain independent', async () => {
 const {teamLabelPositions}=await import('../src/heroMotion.js');
 for(const [w,h] of [[1440,900],[390,844],[320,568]]) {
  const positions=teamLabelPositions(w,h);
  assert.equal(positions.length,5);
  positions.forEach(p=>{assert.ok(p.x>=40&&p.x<=w-40);assert.ok(p.y<h*.65);});
 }
});
test('description reading time and assistant travel are deliberate and reversible', async () => {
 const {TEAM_DURATION,advanceDock}=await import('../src/heroMotion.js');
 assert.equal(TEAM_DURATION,5500);
 let p=0;for(let i=0;i<16;i++)p=advanceDock(p,1,50,false);
 assert.equal(p,1);
 for(let i=0;i<16;i++)p=advanceDock(p,0,50,false);
 assert.equal(p,0);
});

test('centered orb leaves reading space and assistant travels on a curve', () => {
 const frame=dock=>heroFrame({width:1440,height:900,intro:1,center:1,dock});
 const landing=heroFrame({width:1440,height:900,intro:1,center:0,dock:0});
 assert.ok(frame(0).radius<landing.radius);
 assert.ok(frame(.5).y<(frame(0).y+frame(1).y)/2);
});

test('team spotlights consume each orb and regenerate the group only after all collisions', async () => {
 const {teamOrbState,TEAM_DURATION,TEAM_CYCLE_DURATION,REGENERATE_DURATION}=await import('../src/heroMotion.js');
 assert.equal(teamOrbState(0,1000).visibility,1);
 assert.ok(teamOrbState(0,TEAM_DURATION-300).pull>0);
 assert.equal(teamOrbState(0,TEAM_DURATION+100).visibility,0);
 assert.equal(teamOrbState(1,TEAM_DURATION+100).visibility,1);
 const birth=TEAM_CYCLE_DURATION-REGENERATE_DURATION+800;
 assert.ok(teamOrbState(0,birth).spawn>0);
 assert.equal(teamOrbState(0,TEAM_CYCLE_DURATION).visibility,1);
});
test('projected orb bounds stay below the header and inside the widened stage', async () => {
 const {teamOrbitPosition,headerZone}=await import('../src/heroMotion.js');
 for(const [width,height] of [[1440,900],[390,844],[320,568]]) {
  const zone=headerZone(width);
  const centerX=width*.5,centerY=Math.max(height*.36,zone+100);
  for(let i=0;i<5;i++)for(let t=0;t<60;t+=.4){
   const p=teamOrbitPosition(i,t,{width,height,centerX,centerY,mainRadius:90,headerBottom:zone});
   const projection=8/(8-p.z*(2*Math.tan(Math.PI/9)*8/height));
   assert.ok(centerY+p.y*projection-p.bound*projection>=zone-1);
   assert.ok(centerX+p.x*projection+p.bound*projection<=width-15);
  }
 }
});

test('centered composition keeps team badges below the orbit field', async () => {
 const {teamLabelPositions,headerZone}=await import('../src/heroMotion.js');
 for(const [width,height] of [[1440,900],[390,844],[320,568]]) {
  const labels=teamLabelPositions(width,height);
  assert.ok(labels.every(p=>p.y>=height*.51));
  const f=heroFrame({width,height,intro:1,center:1,dock:0});
  assert.equal(f.x,width/2);
  assert.ok(f.y-f.radius>=headerZone(width));
 }
});

test('each team collision produces a bounded one-second glow, including the last collision', async () => {
 const {teamCollisionGlow,TEAM_DURATION}=await import('../src/heroMotion.js');
 for(let i=1;i<=5;i++){
  const impact=i*TEAM_DURATION;
  assert.equal(teamCollisionGlow(impact),0);
  assert.ok(teamCollisionGlow(impact+180)>.8);
  assert.equal(teamCollisionGlow(impact+1000),0);
 }
 assert.equal(teamCollisionGlow(1000),0);
});

test('compact team badges stay on one line and clear the orbital field at mobile widths', async () => {
 const {teamLabelPositions}=await import('../src/heroMotion.js');
 for(const [width,height] of [[320,568],[390,844],[1440,900]]) {
  const badges=teamLabelPositions(width,height);
  assert.equal(new Set(badges.map(p=>p.y)).size,1);
  assert.ok(badges[0].x-badges[0].width/2>=12);
  assert.ok(badges[4].x+badges[4].width/2<=width-12);
  badges.forEach(p=>assert.ok(p.y-17>height*(width<=700?.47:.53)));
  for(let i=1;i<badges.length;i++)assert.ok(badges[i].x-badges[i].width/2>badges[i-1].x+badges[i-1].width/2);
 }
});

test('team badges have equal widths and fit one row on desktop and mobile', async () => {
 const {teamLabelPositions}=await import('../src/heroMotion.js');
 for(const width of [320,390,701,1440]){
  const badges=teamLabelPositions(width,844);
  assert.equal(new Set(badges.map(p=>p.width)).size,1);
  assert.equal(new Set(badges.map(p=>p.y)).size,1);
  assert.ok(badges[0].x-badges[0].width/2>=12);
  assert.ok(badges[4].x+badges[4].width/2<=width-12);
 }
});

test('mini-orb paths maintain staggered projected spacing without overtaking', async () => {
 const {teamOrbitPositions,headerZone}=await import('../src/heroMotion.js');
 for(const [width,height] of [[320,568],[390,844],[1440,900]]) {
  const stage={width,height,centerX:width/2,centerY:Math.max(height*.36,headerZone(width)+100),mainRadius:90,headerBottom:headerZone(width)};
  for(let time=0;time<45;time+=.25){
   const points=teamOrbitPositions(time,stage).map(p=>{const projection=8/(8-p.z*(2*Math.tan(Math.PI/9)*8/height));return {x:p.x*projection,y:p.y*projection};});
   for(let a=0;a<5;a++)for(let b=a+1;b<5;b++)assert.ok(Math.hypot(points[a].x-points[b].x,points[a].y-points[b].y)>60);
  }
 }
});

test('projected sub-orb silhouettes clear the breathing main orb throughout a full orbit', async () => {
 const {teamOrbitPositions,headerZone}=await import('../src/heroMotion.js');
 for(const [width,height] of [[320,568],[390,844],[1440,900]]) {
  const f=heroFrame({width,height,intro:1,center:1,dock:0});
  for(let time=0;time<45;time+=.1){
   for(const p of teamOrbitPositions(time,{width,height,centerX:f.x,centerY:f.y,mainRadius:f.radius,headerBottom:headerZone(width)})){
    const projection=8/(8-p.z*2*Math.tan(Math.PI/9)*8/height);
    assert.ok(Math.hypot(p.x,p.y)*projection-p.bound*projection>=f.radius*1.10+10);
   }
  }
 }
});

test('mini-orbs have independent phase and depth directions rather than mirrored motion', async () => {
 const {teamOrbitPositions,headerZone}=await import('../src/heroMotion.js');
 const stage={width:1440,height:900,centerX:720,centerY:300,mainRadius:120,headerBottom:headerZone(1440)};
 let oppositeDepth=false,reversal=false;
 for(let time=0;time<60;time+=.2){
  const a=teamOrbitPositions(time,stage),b=teamOrbitPositions(time+.02,stage);
  if((b[0].z-a[0].z)*(b[1].z-a[1].z)<0)oppositeDepth=true;
  const sign=a.map((p,i)=>p.x*b[i].y-p.y*b[i].x);
  if(sign.some(n=>n>0)&&sign.some(n=>n<0))reversal=true;
 }
 assert.ok(oppositeDepth);
 assert.ok(reversal);
});

test('collision radiation expands from the core, fades fully and restarts at every impact', async () => {
 const {collisionRadiation,TEAM_DURATION}=await import('../src/heroMotion.js');
 assert.equal(collisionRadiation(1000).opacity,0);
 for(let i=1;i<=5;i++){
  const impact=i*TEAM_DURATION;
  assert.equal(collisionRadiation(impact).spread,0);
  assert.ok(collisionRadiation(impact+140).opacity>.5);
  assert.ok(collisionRadiation(impact+650).spread>collisionRadiation(impact+140).spread);
  assert.equal(collisionRadiation(impact+1100).opacity,0);
 }
});

test('entrance impact light is temporary with no screen shake', async () => {
 const {entranceBlast,FUSION_START,FUSION_DURATION,INTRO_DURATION}=await import('../src/heroMotion.js');
 const impact=FUSION_START+FUSION_DURATION;
 assert.equal(entranceBlast(impact-1).opacity,0);
 assert.ok(entranceBlast(impact+100).opacity>.5);
 assert.equal(entranceBlast(impact+100).shakeX,0);
 assert.equal(entranceBlast(impact+100).shakeY,0);
 assert.ok(entranceBlast(impact+900).spread>entranceBlast(impact+100).spread);
 assert.equal(entranceBlast(INTRO_DURATION).opacity,0);
 assert.equal(entranceBlast(INTRO_DURATION).shakeX,0);
});


test('entrance holds the collision core, unfolds the surface and overlaps copy with the final settle', async () => {
 const {collisionFrame,FUSION_START,FUSION_DURATION,INTRO_DURATION,qualityBeat}=await import('../src/heroMotion.js');
 const impact=FUSION_START+FUSION_DURATION;
 assert.equal(collisionFrame(impact+149).formation,0);
 assert.ok(collisionFrame(impact+600).formation>0);
 assert.equal(collisionFrame(impact+1200).formation,1);
 assert.equal(collisionFrame(impact+1200).copyReveal,0);
 assert.ok(collisionFrame(impact+1800).copyReveal>0);
 assert.ok(collisionFrame(impact+1800).settle<1);
 assert.equal(collisionFrame(INTRO_DURATION).copyReveal,1);
 const starts=Array.from({length:9},(_,i)=>qualityBeat(i,0).start);
 assert.ok(new Set(starts.slice(1).map((t,i)=>t-starts[i])).size>3);
});


test('each merge gives the main orb a fast expansion and a bounded smooth recovery',async()=>{
 const {impactBreath,teamCollisionBreath,TEAM_DURATION,TEAM_CYCLE_DURATION}=await import('../src/heroMotion.js');
 assert.equal(impactBreath(-1),0);assert.equal(impactBreath(0),0);
 assert.equal(impactBreath(80),1);assert.ok(impactBreath(350)<1);
 assert.equal(impactBreath(700),0);
 for(let i=1;i<=5;i++)assert.equal(teamCollisionBreath(i*TEAM_DURATION+80),1);
 assert.equal(teamCollisionBreath(TEAM_CYCLE_DURATION+80),0);
});
