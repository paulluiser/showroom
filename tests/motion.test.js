import test from "node:test";
import assert from "node:assert/strict";
test("render activity stops for paused, hidden, and offscreen scenes", async () => {
  const { canAnimate } = await import("../src/motion.js");
  assert.equal(canAnimate(false, false, true), true);
  assert.equal(canAnimate(true, false, true), false);
  assert.equal(canAnimate(false, true, true), false);
  assert.equal(canAnimate(false, false, false), false);
});
