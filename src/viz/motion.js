import { useEffect, useRef, useState } from "react";

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const clamp01 = (t) => Math.min(1, Math.max(0, t));
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Tracks where an element sits relative to the viewport: "in", "above" (scrolled past) or "below"
 * (not reached yet). Updates both ways, so reveals play in on entry and out on exit.
 */
export function useViewState(options = { rootMargin: "0px 0px -12% 0px" }) {
  const ref = useRef(null);
  const [state, setState] = useState("below");
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setState("in");
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setState("in");
      else setState(e.boundingClientRect.top < (e.rootBounds?.top ?? 0) ? "above" : "below");
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, state];
}

/** True while the element is on screen; false again once it leaves. */
export function useInView(options) {
  const [ref, state] = useViewState(options);
  return [ref, state === "in"];
}

/**
 * Runs onFrame(seconds) on requestAnimationFrame only while `ref` is on screen.
 * Under prefers-reduced-motion it renders one still frame at `stillTime` instead.
 * Animation time pauses while offscreen so nothing jumps when you scroll back.
 */
export function useFrameLoop(ref, onFrame, stillTime = 0) {
  const cb = useRef(onFrame);
  cb.current = onFrame;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { cb.current(stillTime); return; }

    let raf = 0, prev = null, t = 0;
    const tick = (now) => {
      if (prev !== null) t += Math.min(0.1, (now - prev) / 1000);
      prev = now;
      cb.current(t);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) { prev = null; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "80px" });
    io.observe(el);
    cb.current(0);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
}
