import test from 'node:test';
import assert from 'node:assert/strict';
import { timelineFrame, timelineDuration, timelineMilestoneAge } from '../src/timelineMotion.js';

test('timeline starts with research and stops at each dot before moving toward the current role', () => {
  assert.equal(timelineFrame(0, 4).position, 4);
  for (let index = 0; index < 4; index++) {
    const age = timelineMilestoneAge(index);
    const arrival = timelineFrame(age, 4);
    assert.equal(arrival.position, index);
    assert.equal(arrival.active, index);
    assert.equal(arrival.glow, 1);
    assert.equal(timelineFrame(age + 2000, 4).position, index);
  }
  const traveling = timelineFrame(5100, 4);
  assert.equal(traveling.position, 2.5);
  assert.equal(traveling.active, 3);
  assert.equal(timelineFrame(6000, 4).active, 2);
});
test('timeline returns smoothly without a cut at the loop boundary', () => {
  const total = timelineDuration();
  assert.equal(timelineFrame(total - 1200, 4).returning, true);
  assert.equal(timelineFrame(total - 1200, 4).position, 1.5);
  assert.ok(Math.abs(timelineFrame(total - 1, 4).position - timelineFrame(total, 4).position) < .00001);
  assert.deepEqual(timelineFrame(100000, 1), { position: 0, active: 0, returning: false, glow: 1 });
});

test('the light reaches the physical line ends beyond the outer milestone dots', async () => {
  const { timelinePointX } = await import('../src/timelineMotion.js');
  const geometry = { left: 10, right: 1070, first: 134, last: 944, count: 4 };
  assert.equal(timelineFrame(0, 4).position, 4);
  assert.equal(timelinePointX(4, geometry), 1070);
  assert.equal(timelinePointX(-1, geometry), 10);
  for (let index = 0; index < 4; index++) assert.equal(timelinePointX(index, geometry), 134 + 270 * index);
});
