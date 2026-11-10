export function canAnimate(paused, hidden, inView) {
  return !paused && !hidden && inView;
}
