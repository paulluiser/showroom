import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceContact, contactFrame } from '../src/contactMotion.js';
const source = { x: 150, y: 120, radius: 7 };
const destination = { x: 1080, y: 407, radius: 140, leanX: -8, leanY: 4 };

test('the final connection preserves the same point and gently reforms it into the contact orb', () => {
  const first = contactFrame(0, source, destination);
  assert.equal(first.x, source.x); assert.equal(first.y, source.y); assert.equal(first.radius, 7);
  let last = first;
  for (let step = 1; step <= 1000; step++) {
    const f = contactFrame(step / 1000, source, destination);
    assert.ok(Math.hypot(f.x - last.x, f.y - last.y) < 2);
    assert.ok(f.radius >= 7 && f.radius <= 140);
    last = f;
  }
  assert.equal(last.x, destination.x); assert.equal(last.y, destination.y);
  assert.equal(last.radius, 140); assert.equal(last.chapter, 3);
});
test('fast navigation keeps the ending visible; copy feedback acknowledges a real action', () => {
  assert.ok(advanceContact(0, 1, 60) < .04);
  assert.equal(advanceContact(0, 1, 60, true), 1);
  assert.ok(contactFrame(1, source, destination, { copyAge: 780 }).contactGlow > .6);
  const reduced = contactFrame(1, source, destination, { reduced: true, copyAge: 780 });
  assert.equal(reduced.radius, 140); assert.equal(reduced.contactHeading, 1);
});
