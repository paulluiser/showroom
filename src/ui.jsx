// Small shared pieces, drawn in the site's own three colours.
import { createElement, useEffect, useState } from "react";
import { useViewState, prefersReducedMotion } from "./viz/motion.js";

const GLYPH = {
  story: <path d="M4.5 2.5h7v11L8 11l-3.5 2.5z" fill="currentColor" />,
  task: <><rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.2 8.2l2 2 3.6-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  bug: <><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="8" r="2" fill="currentColor" /></>,
};
export const TypeIcon = ({ type = "story" }) => (
  <svg className={`ti ti-${type}`} viewBox="0 0 16 16" aria-hidden="true">{GLYPH[type]}</svg>
);

export const Avatar = ({ initials = "PV" }) => <span className="av" aria-hidden="true">{initials}</span>;

const cls = (state) => (state === "in" ? " in" : state === "above" ? " out-up" : "");

/** A heading whose lines rise into place as it scrolls in, and lift away as it scrolls out. */
export function Lines({ as = "h2", lines, className = "", delay = 0, stagger = 90, ...rest }) {
  const [ref, state] = useViewState();
  return createElement(as, { ref, className: `lines ${className}${cls(state)}`, ...rest },
    lines.map((l, i) => (
      <span className="line" key={i}><span className="line-in" style={{ "--d": `${delay + i * stagger}ms` }}>{l}</span>{" "}</span>
    )));
}

/** Fades and lifts its children in on entry; fades them up and out on exit, both directions. */
export function Reveal({ as = "div", className = "", delay = 0, style, children, ...rest }) {
  const [ref, state] = useViewState();
  return createElement(as, { ref, className: `reveal ${className}${cls(state)}`, style: { "--d": `${delay}ms`, ...style }, ...rest }, children);
}

/**
 * A figure whose digits shuffle through random values, then lock in left to right.
 * Commas, plus signs and spaces stay put. Replays each time `active` turns true.
 */
export function Shuffle({ value, active, delay = 0, step = 90, run = 520 }) {
  const [text, setText] = useState(value);
  useEffect(() => {
    if (!active || prefersReducedMotion()) { setText(value); return; }
    const chars = [...value];
    const digits = chars.map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0);
    const lockAt = new Map(digits.map((i, n) => [i, delay + run + n * step]));
    let raf = 0, last = 0; const t0 = performance.now();
    const tick = (t) => {
      const e = t - t0;
      if (t - last > 55) {
        last = t;
        setText(chars.map((c, i) => (lockAt.has(i) && e < lockAt.get(i) ? String((Math.random() * 10) | 0) : c)).join(""));
      }
      if (e < delay + run + digits.length * step) raf = requestAnimationFrame(tick); else setText(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);
  return <span aria-hidden="true">{text}</span>;
}

/** One stat: the block reveals like the rest, and its number shuffles before settling. */
export function Stat({ value, label, delay = 0 }) {
  const [ref, state] = useViewState();
  return (
    <div ref={ref} className={`reveal${cls(state)}`} style={{ "--d": `${delay}ms` }}>
      <dd aria-label={value}><Shuffle value={value} active={state === "in"} delay={delay} /></dd>
      <dt>{label}</dt>
    </div>
  );
}
