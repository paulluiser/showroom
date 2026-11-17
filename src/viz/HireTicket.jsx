import { useRef, useState } from "react";
import { TypeIcon, Avatar } from "../ui.jsx";
import { Icon } from "../icons.jsx";

const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2;
  const d = 90 + (i % 4) * 34;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, r: (i * 47) % 360, c: ["#ffb22c", "#f1eadb", "#ffc660", "#a2a2a6", "#ffb22c"][i % 5] };
});

/** Final call-to-action: drag the ticket (or press the button) from To Do to Done. */
export default function HireTicket({ email }) {
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [over, setOver] = useState(false);
  const [dragging, setDragging] = useState(false);
  const card = useRef(null);
  const doneCol = useRef(null);
  const start = useRef(null);

  const inDone = (x, y) => {
    const r = doneCol.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  const finish = () => { setTouched(true); setDone(true); };

  const onDown = (e) => {
    if (done || e.button > 0 || e.target.closest("button")) return;
    card.current.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setTouched(true);
    setDragging(true);
  };
  const onMove = (e) => {
    if (!start.current) return;
    card.current.style.transform = `translate(${e.clientX - start.current.x}px, ${e.clientY - start.current.y}px) scale(1.03)`;
    const o = inDone(e.clientX, e.clientY);
    if (o !== over) setOver(o);
  };
  const onUp = (e) => {
    if (!start.current) return;
    start.current = null;
    card.current.style.transform = "";
    setDragging(false);
    setOver(false);
    if (inDone(e.clientX, e.clientY)) finish();
  };

  const ticket = (
    <div ref={card}
      className={`hire-tk${dragging ? " dragging" : ""}${done ? " is-done" : ""}${!touched ? " beckon" : ""}`}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <span className="hire-title">Hire Paul as your next IT Project Manager</span>
      <span className="hire-foot">
        <TypeIcon type="story" />
        <span className="key">PLV-300</span>
        {done ? <span className="lz lz-done">Done</span> : (
          <button type="button" className="hire-move" onClick={finish}>Move to Done</button>
        )}
        <Avatar initials="PV" />
      </span>
    </div>
  );

  return (
    <div className={`hire${done ? " hire-won" : ""}${!touched ? " demo" : ""}`}>
      <div className="hire-board">
        <div className="hire-col">
          <div className="hire-head">To Do <b key={`t${done}`}>{done ? 0 : 1}</b></div>
          {!done && ticket}
        </div>
        <div className="hire-arrow" aria-hidden="true">
          <svg viewBox="0 0 48 24"><path d="M2 12h40M34 4l8 8-8 8" /></svg>
        </div>
        <div className={`hire-col hire-done${over ? " over" : ""}`} ref={doneCol}>
          <div className="hire-head">Done <b key={`d${done}`}>{done ? 1 : 0}</b></div>
          {done ? ticket : <div className="hire-drop" aria-hidden="true">Drop here</div>}
          {done && (
            <div className="confetti" aria-hidden="true">
              {CONFETTI.map((p, i) => <i key={i} style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, "--r": `${p.r}deg`, background: p.c, "--i": i }} />)}
            </div>
          )}
        </div>
        {!touched && (
          <svg className="ghost-cursor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 3l14 7.5-6 1.5-2.5 6z" />
          </svg>
        )}
      </div>

      <div className="hire-result" aria-live="polite">
        {done ? (
          <>
            <p><Icon name="check" size={18} /> Ticket closed. Let's make it official.</p>
            <div className="hire-actions">
              <button type="button" className="btn btn-quiet" onClick={() => setDone(false)}>Undo</button>
              <a className="btn btn-accent" href={`mailto:${email}?subject=${encodeURIComponent("Let's work together")}`}><Icon name="mail" size={18} />Email Paul</a>
            </div>
          </>
        ) : (
          <p className="hire-hint">Drag the ticket to <b>Done</b></p>
        )}
      </div>
    </div>
  );
}
