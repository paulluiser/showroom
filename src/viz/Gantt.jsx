import { useEffect, useRef } from "react";
import { useInView, prefersReducedMotion } from "./motion.js";
import { ROADMAP } from "../content.js";

const { startYear, months, now, rows } = ROADMAP;
const pct = (m) => `${(m / months) * 100}%`;
const YEARS = Array.from({ length: months / 12 }, (_, i) => startYear + i);
const SWEEP_MS = 2400;

/**
 * Roadmap. Motion thesis: time plays forward. A playhead sweeps from Jan 2022 to today;
 * each bar grows exactly as the playhead crosses it and its row lights up, then the playhead
 * becomes the "Today" marker. One CSS variable (--t, in months) drives every element.
 */
export default function Gantt() {
  const [ref, inView] = useInView();
  const fig = useRef(null);

  useEffect(() => {
    const el = fig.current;
    if (!el) return;
    if (!inView) { el.style.setProperty("--t", "0"); el.classList.remove("done"); return; }
    if (prefersReducedMotion()) { el.style.setProperty("--t", String(now)); el.classList.add("done"); return; }
    let raf = 0; const t0 = performance.now();
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / SWEEP_MS);
      el.style.setProperty("--t", (ease(p) * now).toFixed(3));
      if (p < 1) raf = requestAnimationFrame(tick); else el.classList.add("done");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const row = (r) => (
    <div className={`g-row g-row-${r.kind}`} key={r.label} style={{ "--s": r.s, "--e": r.e }}>
      <div className="g-label">{r.label}<small>{r.meta}</small></div>
      <div className="g-track">
        <span className={`g-bar g-${r.kind}`} style={{ left: pct(r.s), width: `max(10px, ${pct(r.e - r.s)})` }} />
        {r.group === "Projects" && <span className="g-end" style={{ left: pct(r.e) }} />}
      </div>
    </div>
  );

  return (
    <figure className={`gantt${inView ? " in" : ""}`} ref={(n) => { ref.current = n; fig.current = n; }} style={{ "--t": 0, "--now": now, "--months": months }} role="img"
      aria-label="Roadmap from 2022 to 2026. Roles: Research Consultant (Delivery Lead) from January 2022 to May 2025, Junior Project Management Intern from February to May 2025, Associate IT Project Manager from June to October 2025, IT Project Manager from December 2025 to today. Projects: tour tracking and streaming in 2025, HRIS and inventory and accounting in 2026.">
      <div className="g-axis" aria-hidden="true">
        <span />
        <div className="g-years">{YEARS.map((y, i) => <span key={y} style={{ "--y": i * 12 }}>{y}</span>)}</div>
      </div>
      <div className="g-body" aria-hidden="true">
        <div className="g-grid"><span className="g-now"><i>Today</i></span></div>
        <div className="g-group">Roles</div>
        {rows.filter((r) => r.group === "Roles").map(row)}
        <div className="g-group">Projects</div>
        {rows.filter((r) => r.group === "Projects").map(row)}
      </div>
    </figure>
  );
}
