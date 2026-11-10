import test from 'node:test';
import assert from 'node:assert/strict';
import { createOfficeWorld } from '../src/OfficeWorld.js';
import { createTourWorld } from '../src/TourWorld.js';
import { createBroadcastWorld } from '../src/BroadcastWorld.js';

test('HRIS staff have distinct work motions', () => {
  const world = createOfficeWorld();
  try {
    const staff = ['office-analyst', 'office-facilitator', 'office-walker'].map(name => world.group.getObjectByName(name));
    const pose = person => {
      const result = [];
      person.traverse(part => result.push(...part.position.toArray(), ...part.rotation.toArray().slice(0, 3)));
      return result;
    };
    world.update(0, false);
    const before = staff.map(pose);
    world.update(1.2, true);
    staff.forEach((person, index) => assert.notDeepEqual(pose(person), before[index]));
    assert.notDeepEqual(staff[0].position.toArray(), staff[2].position.toArray());
  } finally {
    world.dispose();
  }
});

test('tourists follow a continuous trail with distinct positions and a repeating route', () => {
  const world = createTourWorld();
  try {
    const tourists = [0, 1, 2, 3].map(index => world.group.getObjectByName(`tourist-${index}`));
    world.update(0, false);
    const start = tourists.map(person => person.position.clone());
    world.update(4, false);
    assert.ok(tourists[0].position.distanceTo(start[0]) > 1);
    for (let t = 0; t <= 48; t += .5) {
      world.update(t, false);
      tourists.slice(1).forEach((person, index) => assert.ok(person.position.distanceTo(tourists[index].position) > .4));
    }
    world.update(48, false);
    tourists.forEach((person, index) => assert.ok(person.position.distanceTo(start[index]) < .001));
  } finally {
    world.dispose();
  }
});

test('broadcast playback, audio levels, and operator motion advance together', () => {
  const world = createBroadcastWorld();
  try {
    const program = world.group.getObjectByName('program-preview');
    const meter = world.group.getObjectByName('audio-meter-0');
    const operator = world.group.getObjectByName('broadcast-operator-0');
    world.update(0, false);
    const level = meter.scale.y;
    const pose = operator.children.flatMap(part => part.rotation.toArray().slice(0, 3));
    world.update(.7, false);
    assert.equal(program.material.uniforms.uTime.value, .7);
    assert.notEqual(meter.scale.y, level);
    assert.notDeepEqual(operator.children.flatMap(part => part.rotation.toArray().slice(0, 3)), pose);
  } finally {
    world.dispose();
  }
});
