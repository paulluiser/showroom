import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { career } from './content';
import { timelineFrame, timelineMilestoneAge, timelinePointX } from './timelineMotion';
import './timeline.css';

export default function Timeline({ reduced = false, enabled = true }) {
  const host = useRef(null), track = useRef(null), traveler = useRef(null);
  const clock = useRef({ age: 0, follow: true, visible: false, x: null });
  const [active, setActive] = useState(career.length - 1);
  const [open, setOpen] = useState(null);

  useLayoutEffect(() => {
    host.current.scrollLeft = track.current.scrollWidth;
    const x = track.current.querySelector('.history-axis').offsetLeft + track.current.querySelector('.history-axis').offsetWidth;
    clock.current.x = x;
    traveler.current.style.transform = `translate3d(${x - 7}px, 0, 0)`;
    traveler.current.dataset.docked = 'false';
    track.current.style.setProperty('--history-progress', `${x}px`);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([item]) => { clock.current.visible = item.isIntersecting; }, { threshold: .25 });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame, last = performance.now(), spotlight = -2;
    const tick = now => {
      const dt = Math.min(now - last, 60);
      last = now;
      const state = clock.current;
      if (enabled && !document.hidden) {
        const docked = traveler.current.dataset.docked === 'true';
        if (state.visible && docked && !reduced && open === null) state.age += dt;
        const scene = timelineFrame(state.age, career.length);
        const entries = track.current.querySelectorAll('.history-milestone');
        const first = entries[0], lastEntry = entries[entries.length - 1];
        const axis = track.current.querySelector('.history-axis');
        const x = timelinePointX(scene.position, {
          left: axis.offsetLeft, right: axis.offsetLeft + axis.offsetWidth,
          first: first.offsetLeft + first.offsetWidth / 2,
          last: lastEntry.offsetLeft + lastEntry.offsetWidth / 2, count: entries.length,
        });
        const previousX = state.x ?? x;
        if (!reduced && state.seekFrom != null) {
          state.seekAge = Math.min(650, state.seekAge + dt);
          const t = state.seekAge / 650;
          state.x = state.seekFrom + (x - state.seekFrom) * t * t * (3 - 2 * t);
          if (t === 1) state.seekFrom = null;
        } else state.x = x;
        traveler.current.dataset.moving = String(!reduced && docked);
        traveler.current.style.setProperty('--spark-direction', state.x >= previousX ? 1 : -1);
        traveler.current.style.transform = `translate3d(${state.x - 7}px, 0, 0)`;
        traveler.current.dataset.glow = String(scene.glow);
        track.current.style.setProperty('--history-progress', `${state.x}px`);
        if (scene.active !== spotlight) { spotlight = scene.active; setActive(spotlight); }
        if (state.follow && !reduced) {
          const target = Math.max(0, Math.min(track.current.scrollWidth - host.current.clientWidth, state.x - host.current.clientWidth / 2));
          host.current.scrollLeft += (target - host.current.scrollLeft) * (1 - Math.exp(-dt / 200));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, enabled, open]);

  function select(index) {
    clock.current.seekFrom = clock.current.x;
    clock.current.seekAge = 0;
    clock.current.age = timelineMilestoneAge(index, career.length);
    clock.current.follow = true;
    setActive(index);
    const node = track.current.querySelectorAll('.history-milestone')[index];
    if (reduced || open !== null) host.current.scrollTo({ left: node.offsetLeft + node.offsetWidth / 2 - host.current.clientWidth / 2, behavior: reduced ? 'instant' : 'smooth' });
  }

  return <div className="professional-history">
    <div className="history-viewport" ref={host} role="region" aria-label="Career milestones, newest to earliest" tabIndex={0}
      onPointerDown={() => { clock.current.follow = false; }}
      onWheel={event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) clock.current.follow = false; }}
      onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); select(Math.max(0, Math.min(career.length - 1, (active < 0 ? 0 : active) + (event.key === 'ArrowRight' ? 1 : -1)))); } }}>
      <div className="history-track" ref={track}>
        <div className="history-axis" aria-hidden="true"/>
        <div id="experience-orb-stage" className="history-traveler" ref={traveler} aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} className="history-spark" style={{ '--spark': index, '--drift': [-2, 2, -1, 3, 0, -3, 2, -1, 1][index] }}/>)}</div>
        {career.map((role, index) => <article key={role.title} className="history-milestone" data-active={active === index} data-current={index === 0}>
          <time className="history-date">{role.date}</time>
          <button className="history-node" type="button" onClick={() => select(index)} aria-label={`Spotlight ${role.title}`} aria-current={active === index ? 'step' : undefined}><span/></button>
          <div className="history-story">
            <span className="history-company">{role.company}</span>
            {index === 0 && <span className="history-current-label">Current role</span>}
            <h3>{role.title}</h3>
            <p>{open === index ? role.details.join(' ') : role.summary}</p>
            <button className="history-details" type="button" aria-expanded={open === index} onClick={() => { setOpen(open === index ? null : index); select(index); }}>{open === index ? 'Less detail' : 'My responsibilities'}<span aria-hidden="true">{open === index ? '−' : '+'}</span></button>
          </div>
        </article>)}
      </div>
    </div>
  </div>;
}
