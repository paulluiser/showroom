const DWELL = 3200;
const TRAVEL = 1800;
const RETURN = 2400;
const EDGE_TRAVEL = 1000;
const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };

export function timelineDuration(count = 4) {
  return Math.max(1, count) * DWELL + Math.max(0, count - 1) * TRAVEL + RETURN + EDGE_TRAVEL * 2;
}

export function timelineFrame(age, count) {
  if (count <= 1) return { position: 0, active: 0, returning: false, glow: 1 };
  const duration = timelineDuration(count);
  const cycleAge = ((age % duration) + duration) % duration;
  if (cycleAge < EDGE_TRAVEL) return { position: count - ease(cycleAge / EDGE_TRAVEL), active: count - 1, returning: false, glow: 0 };
  const elapsed = cycleAge - EDGE_TRAVEL;
  const returnAt = count * DWELL + (count - 1) * TRAVEL;
  if (elapsed >= returnAt + EDGE_TRAVEL) {
    return { position: -1 + (count + 1) * ease((elapsed - returnAt - EDGE_TRAVEL) / RETURN), active: 0, returning: true, glow: 0 };
  }
  if (elapsed >= returnAt) return { position: -ease((elapsed - returnAt) / EDGE_TRAVEL), active: 0, returning: false, glow: 0 };
  const leg = Math.min(count - 1, Math.floor(elapsed / (DWELL + TRAVEL)));
  const within = elapsed - leg * (DWELL + TRAVEL);
  const active = count - 1 - leg;
  return {
    position: active - (active > 0 ? ease((within - DWELL) / TRAVEL) : 0),
    active,
    returning: false,
    glow: within < DWELL ? .2 + .8 * Math.exp(-within / 700) : 0,
  };
}

export function timelineMilestoneAge(index, count = 4) {
  return EDGE_TRAVEL + (Math.max(1, count) - 1 - Math.max(0, Math.min(count - 1, index))) * (DWELL + TRAVEL);
}


// Dot spacing and line ends are separate coordinates; both end caps belong to the route.
export function timelinePointX(position, { left, right, first, last, count }) {
  if (position < 0) return left + (first - left) * Math.max(0, position + 1);
  if (position > count - 1) return last + (right - last) * Math.min(1, position - count + 1);
  return first + (last - first) * position / Math.max(1, count - 1);
}
