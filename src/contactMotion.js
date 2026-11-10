const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

export function advanceContact(current, target, dt, reduced = false) {
  if (reduced) return target;
  return target > current ? Math.min(target, current + dt / 1900) : Math.max(target, current - dt / 900);
}

export function contactFrame(progress, source, destination, { focus = 0, copyAge = Infinity, reduced = false } = {}) {
  const p = ease(progress);
  const arc = Math.sin(p * Math.PI);
  const direction = Math.sign(destination.x - source.x) || 1;
  const feedback = reduced ? 0 : Math.exp(-Math.pow((copyAge - 780) / 180, 2));
  const radius = mix(source.radius, destination.radius, ease((progress - .16) / .84));
  return {
    x: mix(source.x, destination.x, p) + (reduced ? 0 : direction * arc * Math.min(72, Math.abs(destination.x - source.x) * .18 + 24)) + (destination.leanX ?? 0) * focus * p,
    y: mix(source.y, destination.y, p) - (reduced ? 0 : arc * 40) + (destination.leanY ?? 0) * focus * p,
    radius: radius * (1 + feedback * .035),
    chapter: 2 + p, lens: 0, loop: 0, orbReveal: 1,
    contactProgress: progress,
    contactHeading: reduced ? 1 : ease((progress - .2) / .38),
    contactBody: reduced ? 1 : .55 + .45 * ease((progress - .35) / .4),
    contactActions: reduced ? 1 : .75 + .25 * ease((progress - .48) / .4),
    contactGlow: focus * .2 + feedback * .65,
  };
}
