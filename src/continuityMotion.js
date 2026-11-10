const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

// The same surface travels between reserved slots; reversing scroll reverses the morph.
export function continuityFrame(source, stops, height, headerBottom, reduced = false, connection = 1) {
  let frame = { ...source, lens: 0, loop: 0, chapter: 0 };
  for (const stop of stops) {
    const progress = ease((height * .82 - stop.top) / Math.max(1, height * .82 - headerBottom - 32));
    const t = stop.travel ?? (reduced ? (progress >= .5 ? 1 : 0) : progress) * ease(connection);
    frame = {
      ...frame,
      x: mix(frame.x, stop.x, t),
      y: mix(frame.y, stop.y, t),
      radius: mix(frame.radius, stop.radius, t),
      lens: mix(frame.lens, stop.lens, t),
      loop: mix(frame.loop, stop.loop, t),
      chapter: mix(frame.chapter, stop.chapter, t),
    };
  }
  return frame;
}

// A fast scroll changes the destination, not the minimum visible handoff time.
export function advanceChapterTransfer(current, target, dt, reduced = false) {
  if (reduced) return target;
  return target > current ? Math.min(target, current + dt / 1200) : Math.max(target, current - dt / 900);
}
