import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./motion.js";

/** Counts 0 → 100% over 1.8s, fades its labels, then wipes up and releases the page. */
export default function Preloader({ onDone }) {
  const num = useRef(null);
  const [phase, setPhase] = useState(() => (prefersReducedMotion() ? "gone" : "count"));

  useEffect(() => {
    if (phase === "gone") { onDone(); return; }
    window.lenis?.stop();
    scrollTo(0, 0);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1800);
      if (num.current) num.current.textContent = String(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPhase("fade");
        setTimeout(() => { setPhase("wipe"); onDone(); }, 500);
        setTimeout(() => { setPhase("gone"); window.lenis?.start(); }, 1200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "gone") return null;
  return (
    <div className={`preloader is-${phase}`} aria-hidden="true">
      <p className="pre-name">Paul Luiser Vasquez</p>
      <p className="pre-count"><span ref={num}>0</span><em>%</em></p>
    </div>
  );
}
