import test from 'node:test';
import assert from 'node:assert/strict';
import { continuityFrame } from '../src/continuityMotion.js';
import { projects } from '../src/content.js';
import { projectArrivalFrame, projectViewportPosition } from '../src/projectArrival.js';
import { collisionRadiation, TEAM_DURATION } from '../src/heroMotion.js';
test('the same AI orb shrinks into the project scene and reverses its path',()=>{
  const source={x:320,y:420,radius:150};
  const frame=top=>continuityFrame(source,[{x:620,y:top+540,radius:26,chapter:1,lens:0,loop:0,top}],844,96);
  const frames=Array.from({length:845},(_,i)=>frame(844-i));
  assert.equal(frames[0].radius,150);
  assert.equal(frames.at(-1).radius,26);
  for(let i=1;i<frames.length;i++){
    assert.ok(frames[i].radius<=frames[i-1].radius);
    assert.ok(Math.hypot(frames[i].x-frames[i-1].x,frames[i].y-frames[i-1].y)<4);
    assert.deepEqual(frames[i],frame(844-i));
  }
});
test('inventory case study preserves the confirmed date, method and current UAT milestone',()=>{
  const inventory=projects.find(p=>p.art==='enterprise');
  assert.equal(inventory.date,'May - Nov 2026');
  assert.equal(inventory.methodology,'Agile Scrum');
  assert.match(inventory.milestone,/ready for UAT/);
  assert.match(inventory.problem,/fragmented records/);
});

test('project arrival glides into the card, wakes, squeezes, and disperses before revealing it', () => {
  const source = { x: 320, y: 180, radius: 94 };
  const center = { x: 730, y: 410, radius: 42 };
  const frame = age => projectArrivalFrame(age, source, center);
  assert.equal(frame(0).radius, source.radius);
  assert.equal(frame(850).avatarEyes, 0);
  assert.ok(frame(949).x - frame(940).x < 1);
  for (const age of [950, 1249, 2100, 2400]) {
    const { x, y } = frame(age);
    assert.deepEqual({ x, y }, { x: center.x, y: center.y });
  }
  assert.equal(frame(1249).avatarEyes, 0);
  assert.equal(frame(1640).phase, 'waking');
  assert.ok(frame(1640).avatarEyes > .4 && frame(1640).avatarEyes < .6);
  assert.ok(frame(1640).avatarWake > .9);
  assert.equal(frame(2030).avatarEyes, 1);
  assert.ok(frame(2400).avatarLookX < -.2);
  assert.ok(frame(2790).avatarLookX > .2);
  assert.ok(Math.abs(frame(3110).avatarLookX) < .001);
  assert.ok(frame(3205).avatarEyeOpen < .1);
  assert.ok(frame(3970).avatarSquash > .9);
  assert.equal(frame(4200).avatarSquash, 1);
  assert.equal(frame(4339).phase, 'squeeze');
  assert.equal(frame(4339).radiationOpacity, 0);
  assert.equal(frame(4340).phase, 'dispersion');
  assert.ok(frame(4470).radius > frame(4300).radius * 1.5);
  for (const age of [0, 140, 650, 1099, 1100]) {
    const gallery = frame(4340 + age);
    const team = collisionRadiation(TEAM_DURATION + age);
    assert.equal(gallery.radiationSpread, team.spread);
    assert.equal(gallery.radiationOpacity, team.opacity);
  }
  assert.equal(frame(5439).phase, 'dispersion');
  assert.equal(frame(5440).phase, 'reveal');
  assert.equal(frame(5440).radiationOpacity, 0);
  const end = frame(6440);
  assert.equal(end.phase, 'ready');
  assert.equal(end.avatarEyes, 0);
  assert.equal(end.orbReveal, 0);
});


test('Projects leaves the visible area and re-enters from either scroll direction', () => {
  const height = 844;
  const header = 96;
  const position = top => projectViewportPosition({ top, bottom: top + 700 }, height, header);
  const down = [850, 840, 120, -605].map(position);
  assert.deepEqual(down, ['below', 'visible', 'visible', 'above']);
  assert.deepEqual([-605, 120, 840, 850].map(position), down.toReversed());
});
