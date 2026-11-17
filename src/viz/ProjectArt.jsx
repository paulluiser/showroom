import { useInView } from "./motion.js";

/*
  One flat "product shot" per project: a device drawn head-on in ivory hairlines, an abstract
  interface inside (shapes only, no real labels, fields or data), and one saffron element that
  carries the project's idea. Outlines draw in once; the saffron element loops only while on
  screen (CSS pauses it otherwise) and rests in its finished state under reduced motion.
*/

const W = 320, H = 220;

/** Figure label + blueprint corner marks, shared by every frame. */
const Chrome = ({ n, label, status }) => (
  <>
    <path className="dv-mark" d="M10 14h8M14 10v8M302 14h8M306 10v8M10 206h8M14 202v8M302 206h8M306 202v8" />
    {status && <g className="dv-status"><circle cx={296 - status.length * 6.9 - 7} cy="18.3" r="2.2" /><text x="296" y="20.5" textAnchor="end">{status}</text></g>}
  </>
);

/** Scales a device up around its centre so it fills the frame, below the figure label. */
const Stage = ({ cy, k = 1.15, children }) => <g transform={`translate(160 120) scale(${k}) translate(-160 ${-cy})`}>{children}</g>;

/** A run of skeleton text bars (shapes, never words). */
const Bars = ({ x, y, w, gap = 7, op }) => w.map((ww, i) => <rect key={i} className="dv-bar" x={x} y={y + i * gap} width={ww} height="3" rx="1.5" style={op ? { opacity: op } : undefined} />);

/* 01 Inventory: laptop. Three source rows merge into one ledger row. */
function Inventory() {
  return (
    <>
      <Chrome n={1} label="LEDGER" status="SYNCED" />
      <Stage cy={102} k={1.15}>
      <rect className="dv-line" pathLength="1" x="66" y="36" width="188" height="122" rx="5" />
      <path className="dv-line" pathLength="1" d="M44 158H276L268 168H52Z" />
      <path className="dv-line dv-faint" pathLength="1" d="M146 162h28" />
      {/* screen */}
      <rect className="dv-block" x="74" y="44" width="34" height="106" rx="2" />
      <rect className="dv-acc-fill" x="80" y="50" width="10" height="10" rx="2.5" />
      <Bars x={80} y={70} w={[20, 16, 22, 12]} gap={9} />
      <Bars x={116} y={50} w={[46]} />
      <g className="dv-src">
        {[0, 1, 2].map((i) => (
          <g key={i} style={{ "--i": i, "--y": `${(3 - i) * 16 - 2}px` }}>
            <rect className="dv-row" x="116" y={62 + i * 16} width="130" height="11" rx="2" />
            <rect className="dv-bar" x="121" y={66 + i * 16} width={[44, 58, 36][i]} height="3" rx="1.5" />
            <rect className="dv-bar" x="222" y={66 + i * 16} width="18" height="3" rx="1.5" />
          </g>
        ))}
      </g>
      <g className="dv-ledger">
        <rect className="dv-acc-box" x="116" y="122" width="130" height="16" rx="2" />
        <rect className="dv-acc-fill" x="122" y="128.5" width="52" height="3" rx="1.5" />
        <rect className="dv-acc-fill" x="218" y="128.5" width="22" height="3" rx="1.5" />
      </g>
          </Stage>
    </>
  );
}

/* 02 HRIS: desktop monitor. A check ticks down an approvals list. */
function Hris() {
  return (
    <>
      <Chrome n={2} label="PEOPLE" status="DEPLOYED" />
      <Stage cy={107} k={1.13}>
      <rect className="dv-line" pathLength="1" x="58" y="34" width="204" height="126" rx="4" />
      <path className="dv-line" pathLength="1" d="M150 160V176M170 160V176M126 180H194" />
      <rect className="dv-block" x="66" y="42" width="188" height="12" rx="2" />
      <rect className="dv-acc-fill" x="71" y="45" width="6" height="6" rx="1.5" />
      <Bars x={82} y={46.5} w={[40]} />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 62 + i * 18;
        return (
          <g key={i} className="dv-item" style={{ "--i": i }}>
            <rect className="dv-row" x="66" y={y} width="188" height="14" rx="2" />
            <circle className="dv-bar" cx="75" cy={y + 7} r="4" />
            <rect className="dv-bar" x="84" y={y + 4} width={[52, 40, 60, 46, 34][i]} height="3" rx="1.5" />
            <rect className="dv-bar" x="84" y={y + 9} width={[30, 24, 36, 28, 22][i]} height="2" rx="1" style={{ opacity: 0.55 }} />
            <rect className="dv-check-box" x="238" y={y + 3} width="8" height="8" rx="2" />
            <path className="dv-check" d={`M239.8 ${y + 7.2}l1.8 1.8 3.2-3.6`} />
          </g>
        );
      })}
          </Stage>
    </>
  );
}

/* 03 Streaming: phone. A growth line climbs; the subscribe button is the one call to action. */
const GROWTH = "M136 128C146 127 152 122 160 114S176 94 184 86";
function Stream() {
  return (
    <>
      <Chrome n={3} label="SUBSCRIPTIONS" />
      <Stage cy={110} k={1.0}>
      <rect className="dv-line" pathLength="1" x="124" y="32" width="72" height="156" rx="12" />
      <path className="dv-line dv-faint" pathLength="1" d="M152 39h16" />
      <rect className="dv-acc-fill" x="133" y="48" width="12" height="12" rx="3.5" />
      <Bars x={133} y={66} w={[34, 46]} />
      <path className="dv-grid" d="M134 132H186M134 112H186M134 92H186" />
      <path className="dv-acc-line dv-grow" pathLength="1" d={GROWTH} />
      <circle className="dv-acc-dot dv-grow-dot" r="2.6" style={{ offsetPath: `path("${GROWTH}")` }} />
      <Bars x={133} y={142} w={[44, 30]} />
      <rect className="dv-acc-fill dv-cta" x="133" y="164" width="54" height="12" rx="6" />
          </Stage>
    </>
  );
}

/* 04 Tours: tablet. A vehicle runs the route between checkpoints. */
const ROUTE = "M84 150C98 132 96 116 118 110S146 126 166 116 186 74 206 66";
function Tour() {
  return (
    <>
      <Chrome n={4} label="LIVE ROUTE" status="LIVE" />
      <Stage cy={110} k={1.12}>
      <rect className="dv-line" pathLength="1" x="50" y="36" width="220" height="148" rx="10" />
      <rect className="dv-block" x="60" y="46" width="160" height="128" rx="3" />
      <path className="dv-road" d="M60 92C96 104 120 76 160 86S206 120 220 108" />
      <path className="dv-road" d="M110 46C118 90 100 130 116 174" />
      <path className="dv-route-base" d={ROUTE} />
      <path className="dv-acc-line dv-route" pathLength="1" d={ROUTE} />
      {[[84, 150], [118, 110], [166, 116]].map(([x, y], i) => <circle key={i} className="dv-stop" cx={x} cy={y} r="3.4" />)}
      <circle className="dv-acc-dot" cx="206" cy="66" r="4" />
      <rect className="dv-acc-dot dv-bus" x="-5" y="-3" width="10" height="6" rx="1.5" style={{ offsetPath: `path("${ROUTE}")` }} />
      {/* side panel */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect className="dv-row" x="226" y={46 + i * 22} width="36" height="18" rx="2" />
          <rect className="dv-bar" x="230" y={51 + i * 22} width="24" height="3" rx="1.5" />
          <rect className={i === 0 ? "dv-acc-fill" : "dv-bar"} x="230" y={57 + i * 22} width="12" height="2.5" rx="1.25" />
        </g>
      ))}
          </Stage>
    </>
  );
}

const SCENES = { inventory: Inventory, hris: Hris, streaming: Stream, tour: Tour };

export default function ProjectArt({ id }) {
  const [ref, inView] = useInView();
  const Scene = SCENES[id];
  return (
    <div className={`art-frame${inView ? " in" : ""}`} ref={ref} aria-hidden="true">
      <svg className="sc dv" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"><Scene /></svg>
    </div>
  );
}
