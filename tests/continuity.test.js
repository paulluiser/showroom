import test from 'node:test';
import assert from 'node:assert/strict';
import {continuityFrame,advanceChapterTransfer} from '../src/continuityMotion.js';

const source={x:200,y:300,radius:130};
const stop={top:0,x:400,y:350,radius:100,lens:1,loop:0,chapter:1};
test('the same surface reaches each chapter with exact position and form',()=>{
  const work=continuityFrame(source,[stop],900,96);
  assert.equal(work.x,400);assert.equal(work.radius,100);assert.equal(work.lens,1);
  const experience=continuityFrame(source,[stop,{...stop,chapter:2,lens:0,loop:1}],900,96);
  assert.equal(experience.loop,1);assert.equal(experience.lens,0);
  const contact=continuityFrame(source,[stop,{...stop,chapter:3,lens:0,loop:0}],900,96);
  assert.equal(contact.loop,0);assert.equal(contact.lens,0);assert.equal(contact.chapter,3);
});
test('scroll transfer stays continuous, bounded and reversible on desktop and mobile',()=>{
  for(const height of [568,844,1000]){
    let previous=continuityFrame(source,[{...stop,top:height}],height,80);
    const frames=[];
    for(let top=height;top>=0;top--){
      const current=continuityFrame(source,[{...stop,top}],height,80);
      assert.ok(Math.hypot(current.x-previous.x,current.y-previous.y)<2);
      assert.ok(current.radius>=100&&current.radius<=130);
      assert.ok(current.lens>=0&&current.lens<=1);
      frames.push(current);previous=current;
    }
    for(let top=0;top<=height;top++)assert.deepEqual(continuityFrame(source,[{...stop,top}],height,80),frames[height-top]);
  }
});
test('offscreen chapters cannot steal the orb; reduced motion switches without travel',()=>{
  const off=continuityFrame(source,[{...stop,top:1000}],900,96);
  assert.equal(off.x,source.x);assert.equal(off.chapter,0);
  for(let top=900;top>=0;top-=10){
    const f=continuityFrame(source,[{...stop,top}],900,96,true);
    assert.ok(f.x===source.x||f.x===stop.x);assert.ok(f.lens===0||f.lens===1);
  }
});
test('fast navigation blends later chapters into the ongoing AI handoff without a cut',()=>{
  let last=continuityFrame(source,[stop],900,96,false,0);
  assert.equal(last.x,source.x);assert.equal(last.lens,0);
  for(let i=1;i<=1000;i++){
    const current=continuityFrame(source,[stop],900,96,false,i/1000);
    assert.ok(Math.abs(current.x-last.x)<.4);
    assert.ok(Math.abs(current.lens-last.lens)<.002);
    last=current;
  }
  assert.equal(last.x,stop.x);assert.equal(last.lens,1);
});

test('fast gallery-to-timeline scrolling retains a visible, bounded transfer instead of skipping it', () => {
  let progress = 0;
  for (let age = 0; age < 1200; age += 60) {
    const next = advanceChapterTransfer(progress, 1, 60);
    assert.ok(next - progress <= .050001);
    progress = next;
    if (age < 1140) assert.ok(progress < 1);
  }
  assert.equal(progress, 1);
  assert.ok(advanceChapterTransfer(progress, 0, 60) > .9);
  assert.equal(advanceChapterTransfer(0, 1, 60, true), 1);
});
