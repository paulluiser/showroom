import { useRef } from "react";
import { useFrameLoop, easeInOut, clamp01 } from "./motion.js";
import { TypeIcon } from "../ui.jsx";

const COLS = ["To Do", "In Progress", "Done"];
const STEP = 1.6; // seconds per move; exactly one card moves at a time
const SPRINT_S = 14.4; // seconds per sprint on the burndown (nine moves)
const ROW_H = 90;
const ROWS = 5;
const SPRINT_DAYS = 10;

// [key, title, type, points] — work from the CV
const TICKETS = [
  ["PLV-214", "Get BRD signed off by client", "task", 3],
  ["PLV-215", "UAT session: billing module", "story", 5],
  ["PLV-217", "Process change request #14", "story", 3],
  ["PLV-219", "Deploy release to staging", "story", 3],
  ["PLV-208", "Review SRS v2 with QA lead", "task", 2],
  ["PLV-210", "Inventory API specification", "story", 5],
  ["PLV-211", "Stakeholder demo & status report", "story", 2],
  ["PLV-212", "Retro action items", "task", 1],
  ["PLV-201", "Run sprint planning", "story", 1],
  ["PLV-203", "Set up Jira workflow & boards", "task", 2],
  ["PLV-205", "Update risk log & mitigations", "task", 1],
  ["PLV-206", "Fix regression found in QA", "bug", 3],
];
// Starting columns (ticket indexes, top to bottom).
const START = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]];
// The repeating sequence: In Progress → Done, To Do → In Progress, then the oldest Done card
// is archived and comes back as new backlog at the bottom of To Do.
const MOVES = [[1, 2], [0, 1], [2, 0]];
const TOTAL = TICKETS.reduce((n, t) => n + t[3], 0);

// Burndown: remaining points per day; ideal is a straight line.
const ACTUAL = [31, 30, 27, 25, 22, 18, 16, 11, 7, 4, 0];
const BW = 240, BH = 120, PAD = 10;
const bx = (d) => PAD + (d / SPRINT_DAYS) * (BW - PAD * 2);
const by = (v) => PAD + (1 - v / 31) * (BH - PAD * 2);
const ACTUAL_PATH = ACTUAL.map((v, d) => `${d ? "L" : "M"}${bx(d).toFixed(1)} ${by(v).toFixed(1)}`).join(" ");
const AREA_PATH = `${ACTUAL_PATH} L${bx(SPRINT_DAYS)} ${BH - PAD} L${bx(0)} ${BH - PAD} Z`;

export default function SprintBoard({ compact = false }) {
  const root = useRef(null);
  const tickets = useRef([]);
  const counts = useRef([]);
  const fill = useRef(null);
  const sprintEl = useRef(null);
  const dayEl = useRef(null);
  const doneEl = useRef(null);
  const burn = useRef(null);
  const burnDot = useRef(null);
  const clip = useRef(null);
  const dayLine = useRef(null);
  const last = useRef({ sprint: -1, day: -1, counts: "", done: -1 });
  const board = useRef({ k: 0, cols: START.map((c) => [...c]) });

  useFrameLoop(root, (t) => {
    const sprintF = (t / SPRINT_S) % 1;
    const sprint = 14 + Math.floor(t / SPRINT_S);
    const day = Math.min(SPRINT_DAYS, Math.floor(sprintF * SPRINT_DAYS) + 1);

    if (fill.current) fill.current.style.transform = `scaleX(${Math.max(0.002, sprintF)})`;
    if (burn.current) burn.current.style.strokeDashoffset = String(1 - sprintF);
    if (clip.current) clip.current.setAttribute("width", String(Math.max(0, bx(sprintF * SPRINT_DAYS) - PAD)));
    if (dayLine.current) dayLine.current.style.transform = `translateX(${bx(sprintF * SPRINT_DAYS)}px)`;
    if (burnDot.current) {
      const d = sprintF * SPRINT_DAYS;
      const i = Math.min(SPRINT_DAYS - 1, Math.floor(d));
      const v = ACTUAL[i] + (ACTUAL[i + 1] - ACTUAL[i]) * (d - i);
      burnDot.current.style.transform = `translate(${bx(d)}px, ${by(v)}px)`;
    }
    if (sprint !== last.current.sprint && sprintEl.current) { sprintEl.current.textContent = `PLV Sprint ${sprint}`; last.current.sprint = sprint; }
    if (day !== last.current.day && dayEl.current) { dayEl.current.textContent = `Day ${day} of ${SPRINT_DAYS}`; last.current.day = day; }

    // Advance the board to the start of the current move.
    const K = Math.floor(t / STEP), f = t / STEP - K;
    const st = board.current;
    while (st.k < K) {
      const [from, to] = MOVES[st.k % 3];
      st.cols[to].push(st.cols[from].shift());
      st.k++;
    }
    const [from, to] = MOVES[K % 3];
    const mover = st.cols[from][0];
    const m = easeInOut(clamp01((f - 0.12) / 0.6));
    const fade = from === 2 && to === 0; // archive + new backlog: fade out, fade back in at the bottom

    const tally = st.cols.map((c) => c.length);
    tally[from] -= m > 0.5 ? 1 : 0;
    tally[to] += m > 0.5 ? 1 : 0;
    let donePts = 0;

    st.cols.forEach((col, c) => col.forEach((id, idx) => {
      const el = tickets.current[id];
      if (!el) return;
      let x = c, y = idx, lift = 0, opacity = 1, scale = 1, shown = c, z = 1;
      if (id === mover) {
        z = 3;
        if (fade) {
          const out = m < 0.5;
          x = out ? from : to; y = out ? 0 : st.cols[to].length;
          opacity = out ? 1 - m * 2 : m * 2 - 1;
          scale = 0.96 + Math.abs(m - 0.5) * 0.08;
          shown = out ? from : to;
        } else {
          x = from + (to - from) * m;
          y = st.cols[to].length * m;
          lift = Math.sin(m * Math.PI);
          shown = m > 0.5 ? to : from;
        }
      } else if (c === from) {
        y = idx - m; // cards below the mover slide up to close the gap
      }
      if (shown === 2) donePts += TICKETS[id][3];
      el.style.zIndex = String(z);
      el.style.transform = `translate3d(calc(${x * 100}% + ${x * 24}px), ${y * ROW_H - lift * 10}px, 0) scale(${scale * (1 + lift * 0.035)})`;
      el.style.opacity = String(opacity);
      el.style.setProperty("--lift", lift.toFixed(3));
      if (el.dataset.col !== String(shown)) {
        el.dataset.col = String(shown);
        if (shown === 2) { el.classList.remove("arrive"); void el.offsetWidth; el.classList.add("arrive"); }
        else el.classList.remove("arrive");
      }
    }));

    const key = tally.join(",");
    if (key !== last.current.counts) {
      tally.forEach((n, i) => {
        const c = counts.current[i];
        if (!c || c.textContent === String(n)) return;
        c.textContent = String(n);
        c.classList.remove("tick"); void c.offsetWidth; c.classList.add("tick");
      });
      last.current.counts = key;
    }
    if (donePts !== last.current.done && doneEl.current) { doneEl.current.textContent = `${donePts} of ${TOTAL} pts done`; last.current.done = donePts; }
  }, 0);

  return (
    <div className={`sb${compact ? " sb-compact" : ""}`} ref={root} role="img" aria-label="Animated sprint board: one at a time, issues such as BRD sign-off, UAT sessions, and change requests move from To Do to In Progress to Done, with a sprint burndown chart beside it.">
      <div className="sb-board" aria-hidden="true">
        <div className="sb-cols">
          {COLS.map((c, i) => (
            <div className={`sb-col sb-col-${i}`} key={c}>
              <div className="sb-head">
                <span>{c}</span><b ref={(el) => (counts.current[i] = el)}>0</b>
                {i === 2 && <svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
            </div>
          ))}
        </div>
        <div className="sb-lanes" style={{ height: ROWS * ROW_H }}>
          {TICKETS.map(([key, title, type, pts], i) => (
            <div className="tk" key={key} ref={(el) => (tickets.current[i] = el)} data-col="0">
              <span className="tk-title">{title}</span>
              <span className="tk-foot">
                <TypeIcon type={type} />
                <span className="tk-key">{key}</span>
                <span className="tk-pts">{pts}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {!compact && <aside className="burn" aria-hidden="true">
        <div className="burn-top">
          <b ref={sprintEl}>PLV Sprint 14</b>
          <span ref={dayEl}>Day 1 of 10</span>
        </div>
        <div className="sb-track"><div className="sb-fill" ref={fill} /></div>
        <div className="burn-head"><span>Burndown chart</span><span ref={doneEl}>0 pts done</span></div>
        <svg viewBox={`0 0 ${BW} ${BH}`}>
          {[0, 0.5, 1].map((p) => <line key={p} x1={PAD} x2={BW - PAD} y1={PAD + p * (BH - PAD * 2)} y2={PAD + p * (BH - PAD * 2)} className="burn-grid" />)}
          <defs><clipPath id="burn-clip"><rect ref={clip} x={PAD} y="0" width="0" height={BH} /></clipPath></defs>
          <path d={AREA_PATH} className="burn-area" clipPath="url(#burn-clip)" />
          <line x1={bx(0)} y1={by(31)} x2={bx(SPRINT_DAYS)} y2={by(0)} className="burn-ideal" />
          <line ref={dayLine} x1="0" x2="0" y1={PAD} y2={BH - PAD} className="burn-day" />
          <path d={ACTUAL_PATH} pathLength="1" className="burn-actual" ref={burn} />
          <circle r="4.5" className="burn-dot" ref={burnDot} />
        </svg>
      </aside>}
    </div>
  );
}
