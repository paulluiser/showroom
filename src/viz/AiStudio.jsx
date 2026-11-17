import { useState } from "react";
import { Icon } from "../icons.jsx";
import { AI_MODES } from "../content.js";

/*
  Human-in-the-loop, drawn literally: a ring with three stations. A person frames the work,
  AI does the heavy lift (saffron, icon per mode), a person reviews and closes the loop.
  A comet orbits continuously; switching modes redraws the ring and swaps the labels.
*/
const R = 150, C = 200;
const at = (deg) => [C + R * Math.cos((deg * Math.PI) / 180), C + R * Math.sin((deg * Math.PI) / 180)];
const STATIONS = [-90, 30, 150]; // top, lower right, lower left (clockwise)
const arc = (a, b) => { const [x1, y1] = at(a), [x2, y2] = at(b); return `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`; };
const RING = `M${C} ${C - R} A${R} ${R} 0 1 1 ${C - 0.01} ${C - R}`;

export default function AiStudio() {
  const [i, setI] = useState(0);
  const m = AI_MODES[i];
  const focus = (n) => { setI(n); document.getElementById(`ai-${AI_MODES[n].id}`)?.focus(); };
  const icons = ["doc", m.icon, "userCheck"];

  return (
    <div className="ai">
      <div className="ai-side">
      <ul className="ai-list" role="tablist" aria-orientation="vertical" aria-label="How Paul uses AI">
        {AI_MODES.map((x, n) => (
          <li key={x.id} role="presentation">
            <button id={`ai-${x.id}`} role="tab" type="button" className="ai-item" aria-selected={n === i} aria-controls="ai-panel"
              tabIndex={n === i ? 0 : -1} onClick={() => setI(n)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); focus((n + 1) % AI_MODES.length); }
                if (e.key === "ArrowUp") { e.preventDefault(); focus((n - 1 + AI_MODES.length) % AI_MODES.length); }
              }}>
              <Icon name={x.icon} size={22} />
              <span className="ai-item-main">
                <span className="ai-item-name">{x.tab}</span>
                <span className="ai-item-sub">{x.title}</span>
              </span>
              <span className="ai-item-rule" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {m.text && <p className="ai-quote" key={`q-${m.id}`} aria-label={m.text}>
          {m.text.split(" ").map((w, n) => <span key={n} aria-hidden="true" style={{ "--n": n }}>{w} </span>)}
        </p>}
      </div>

      <div className="ai-panel" id="ai-panel" role="tabpanel" aria-labelledby={`ai-${m.id}`}>
        <figure className="loop" key={m.id} aria-label={`Workflow: ${m.steps[0]}, then ${m.steps[1]} by AI, then ${m.steps[2]}, back to the start.`}>
          <svg viewBox="0 0 400 400" aria-hidden="true">
            <circle className="loop-track" cx={C} cy={C} r={R} />
            <path className="loop-arc loop-human" d={arc(STATIONS[2], STATIONS[0] + 360)} pathLength="1" />
            <path className="loop-arc loop-human" d={arc(STATIONS[0], STATIONS[1])} pathLength="1" style={{ "--d": ".1s" }} />
            <path className="loop-arc loop-ai" d={arc(STATIONS[1], STATIONS[2])} pathLength="1" style={{ "--d": ".25s" }} />
            <circle className="loop-comet" r="5" style={{ offsetPath: `path("${RING}")` }} />
          </svg>
          {STATIONS.map((deg, n) => {
            const [x, y] = at(deg);
            return (
              <div key={n} className={`station station-${n}${n === 1 ? " is-ai" : ""}`} style={{ left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%`, "--n": n }}>
                <span className="station-node"><Icon name={icons[n]} size={22} /></span>
                <span className="station-label">{m.steps[n]}{n === 1 && <em>AI</em>}</span>
              </div>
            );
          })}
          <figcaption className="loop-core">
            <b>{m.title}</b>
          </figcaption>
        </figure>

      </div>
    </div>
  );
}
