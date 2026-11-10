import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LogisticsStage from './LogisticsStage';
import { carouselProjects, projectPosition, wrapProjectIndex } from './projectDeck';
import { projectCaseForArt } from './projectCases';

const galleryTitle = 'Project Gallery';

function GalleryHeading({ finished }) {
  const heading = useRef(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = heading.current;
      const composition = node.parentElement.getBoundingClientRect();
      const top = composition.top;
      const amount = Math.max(0, Math.min(1, (88 - top) / 150));
      const eased = amount * amount * (3 - 2 * amount);
      node.style.setProperty('--gallery-exit', eased);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);
  return <div ref={heading} className="project-gallery-heading">
    <h2 id="project-gallery-heading">
      <span className={`ai-heading-feature${finished ? ' ai-heading-emphasis' : ''}`}>{galleryTitle}</span>
    </h2>
  </div>;
}

function ProjectDetails({ project, onExplore }) {
  const inventory = project.art === 'enterprise';
  const study = projectCaseForArt(project.art);
  return <div className="project-details">
    <p>{inventory ? 'I bring stock, sales, and procurement into one shared system.' : project.summary}</p>
    <div className="logistics-meta"><span>{project.role}</span><span>{project.date}</span>{project.methodology && <span>{project.methodology}</span>}</div>
    <a href={study.path} onClick={onExplore} className="logistics-explore">Explore the case study <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></a>
  </div>;
}

function SceneFooter({ reduced, playing, onToggle }) {
  return <div className="logistics-art-footer">
    <span>Conceptual illustration</span>
    {!reduced && <button type="button" onClick={onToggle} aria-label={playing ? 'Pause project animation' : 'Play project animation'}>
      {playing ? 'Pause scene' : 'Play scene'}
    </button>}
  </div>;
}

export default function ProjectCarousel({ reduced, entry, motion, onExplore, active }) {
  const frame = useRef(null);
  const dispersion = useRef(null);
  const touch = useRef(null);
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [auto, setAuto] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const interactive = reduced || entry === 'ready';
  const toggleScene = () => setPlaying(value => !value);
  const running = active && visible && playing && !reduced && entry === 'ready';
  const rotating = active && visible && auto && !reduced && entry === 'ready' && !hovered && !focused;

  useLayoutEffect(() => {
    if (entry !== 'dispersion' || reduced) return;
    const orb = motion.current;
    dispersion.current.style.setProperty('--dispersion-x', `${orb.x}px`);
    dispersion.current.style.setProperty('--dispersion-y', `${orb.y}px`);
  }, [entry, reduced, motion]);

  useEffect(() => {
    const observer = new IntersectionObserver(([item]) => setVisible(item.intersectionRatio >= .35), { threshold: .35 });
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!rotating) return;
    let timer;
    const sync = () => {
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(() => setSelected(index => wrapProjectIndex(index + 1)), 9000);
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [rotating, selected]);

  function step(direction) {
    setSelected(index => wrapProjectIndex(index + direction));
  }

  function finishSwipe(event) {
    const start = touch.current;
    touch.current = null;
    if (!start || !interactive) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - start.clientX;
    const dy = end.clientY - start.clientY;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  }

  return <><section id="work" className="section work logistics-project" aria-labelledby="project-gallery-heading" aria-roledescription="carousel"
    data-entry={reduced ? 'ready' : entry} data-running={running}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
    onPointerLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="project-gallery-composition">
    <GalleryHeading finished={reduced || entry === 'ready'}/>
    <div ref={frame} className="project-preview-frame"
      onTouchStart={event => { touch.current = event.touches.length === 1 ? event.touches[0] : null; }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={finishSwipe}>
      <div className="project-stack" id="project-stack" inert={!interactive}>
        {carouselProjects.map((project, index) => {
          const inventory = project.art === 'enterprise';
          const front = index === selected;
          const poster = <img className="project-card-poster" src={`/projects/${project.art}.jpg`} alt="" decoding="async" loading="lazy"/>;
          return <article key={project.art} className="logistics-landing project-card" data-kind={project.art}
            data-position={projectPosition(index, selected)} role="group" aria-roledescription="slide"
            aria-label={`${index + 1} of ${carouselProjects.length}`} inert={!front}>
            {front ? <LogisticsStage kind={project.art} running={running}>{poster}</LogisticsStage> : poster}
            <div className="logistics-intro">
              <h3 id={inventory ? 'inventory-title' : undefined}>
                {inventory ? <>Inventory.<br/><span>In motion.</span></> : project.name}
              </h3>
              <ProjectDetails project={project} onExplore={onExplore}/>
            </div>
            <SceneFooter reduced={reduced} playing={playing} onToggle={toggleScene}/>
          </article>;
        })}
      </div>
    </div>
    <div className="project-mobile-details" inert={!interactive}>
      <ProjectDetails project={carouselProjects[selected]} onExplore={onExplore}/>
      <SceneFooter reduced={reduced} playing={playing} onToggle={toggleScene}/>
    </div>
    <div className="project-carousel-controls" inert={!interactive} onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        step(event.key === 'ArrowRight' ? 1 : -1);
      }
    }}>
      <button type="button" onClick={() => step(-1)} aria-controls="project-stack" aria-label="Previous project">Previous</button>
      <span className="project-carousel-counter" aria-live={rotating ? 'off' : 'polite'} aria-atomic="true">
        <span className="sr-only">{carouselProjects[selected].name}, project </span>
        {String(selected + 1).padStart(2, '0')} <span aria-hidden="true">/</span><span className="sr-only"> of </span> {String(carouselProjects.length).padStart(2, '0')}
      </span>
      <button type="button" onClick={() => step(1)} aria-controls="project-stack" aria-label="Next project">Next</button>
      {!reduced && <button className="project-rotation-control" type="button" onClick={() => setAuto(value => !value)}
        aria-label={auto ? 'Pause carousel' : 'Play carousel'} title={auto ? 'Pause carousel' : 'Play carousel'}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          {auto ? <><rect x="5" y="4" width="3" height="12" rx="1"/><rect x="12" y="4" width="3" height="12" rx="1"/></> : <path d="m6 3 10 7-10 7Z"/>}
        </svg>
      </button>}
    </div>
    </div>
  </section>{createPortal(<div ref={dispersion} className="project-impact-wash" data-phase={reduced ? 'ready' : entry} aria-hidden="true"><div/></div>, document.body)}</>;
}
