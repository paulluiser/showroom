import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Scene from "./Scene";
import ProjectCase from "./ProjectCase";
import useProjectRoute from "./useProjectRoute";
import OrbRouteTransition from "./OrbRouteTransition";
import { projectCaseForPath } from "./projectCases";
import ProjectCarousel from "./ProjectCarousel.jsx";
import ThemeToggle from "./ThemeToggle";
import Timeline from "./Timeline";
import ContactSection from "./ContactSection";
import Hero from "./Hero";
import useWorkflowCycle from "./useWorkflowCycle";
import IntelligenceHeading from "./IntelligenceHeading";
import WorkflowWorkspace from "./WorkflowWorkspace";
import CursorTrail from "./CursorTrail.jsx";
import { workflows } from "./content";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "./style.css";
import "./chapters.css";
import "./workflow.css";
import "./light.css";
import "./theme.css";
import "./project-pages.css";
import "./section-locks.css";

const sections = ["home", "intelligence", "work", "experience", "contact"];
function App() {
  const [active, setActive] = useState("home");
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const orbMotion=useRef(null);
  const contactSignals=useRef({hover:false,focus:false,copyAt:-Infinity});
  const processingLabel = useRef(null);
  const [projectEntry, setProjectEntry] = useState('waiting');
  const navigation=useProjectRoute(paused);
  const isHome=navigation.path==='/';
  const selectedCase=projectCaseForPath(navigation.path);
  const cycle=useWorkflowCycle(paused);
  useEffect(() => {
    const nodes = [...document.querySelectorAll('#main>section')];
    let frame = 0;
    const trackSection = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const marker = innerHeight * .35;
        const section = nodes.find(node => {
          const bounds = node.getBoundingClientRect();
          return bounds.top <= marker && bounds.bottom > marker;
        });
        if (section) setActive(section.id);
      });
    };
    const observer = new ResizeObserver(trackSection);
    observer.observe(document.querySelector('main'));
    window.addEventListener('scroll', trackSection, { passive: true });
    window.addEventListener('resize', trackSection);
    trackSection();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = (e) => setPaused(e.matches);
    media.addEventListener("change", change);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', trackSection);
      window.removeEventListener('resize', trackSection);
      media.removeEventListener("change", change);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "running";
  }, [paused]);
  useEffect(() => {
    document.documentElement.dataset.section = active;
  }, [active]);
  useEffect(() => {
    const elements = document.querySelectorAll(
      "main > .section .section-heading, .education",
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("entered");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    elements.forEach((el) => {
      el.classList.add("scroll-reveal");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div inert={navigation.busy}><ThemeToggle /></div>
      <Scene paused={paused} motion={orbMotion} processingLabel={processingLabel}/>
      <p className="sr-only" role="status">{navigation.busy?'Opening the project case study.':''}</p>
      <div className="showroom-home" hidden={!isHome} inert={navigation.busy}>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <div className="atmosphere" aria-hidden="true" />
      <nav className="section-rail" aria-label="Page sections">
        {sections.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            aria-label={
              ["Home", "AI capabilities", "Work", "About", "Contact"][i]
            }
            aria-current={id === active ? "location" : undefined}
          >
            <span />
            <em>{["Home", "AI", "Work", "About", "Contact"][i]}</em>
          </a>
        ))}
      </nav>
      <main id="main">
        <Hero paused={paused} workflow={cycle.index} workflowClock={cycle.clock} workflowArrival={cycle.arrival} orbMotion={orbMotion} contactSignals={contactSignals} onProjectEntry={setProjectEntry} active={isHome && !navigation.busy} />
        <section id="intelligence" className="section intelligence">
          <div className="ai-awakening-layout">
            <div className="section-heading"><IntelligenceHeading reduced={paused} /></div>
            <div className="ai-orb-presentation">
              <div className="robot-stage ai-orb-stage" id="robot-stage" role="img"
                aria-label={`AI energy orb in ${workflows[cycle.index].form} form`}>
                <div className="speaking-orb-fallback" aria-hidden="true"><i/></div>
                <div ref={processingLabel} className="ai-processing" aria-hidden="true" data-visible="false">
                  <span>Thinking</span><i>.</i><i>.</i><i>.</i>
                </div>
              </div>
            </div>
            <WorkflowWorkspace cycle={cycle} reduced={paused} />
          </div>
        </section>
        <ProjectCarousel reduced={paused} entry={projectEntry} motion={orbMotion} onExplore={navigation.explore} active={isHome && !navigation.busy} />
        <section id="experience" className="section experience">
          <div className="section-heading">
            <h2>
              Professional Timeline
            </h2>
          </div>
          <Timeline reduced={paused} enabled={isHome && !navigation.busy} />
          <div className="education">
            <span>
              BS Computer Science <strong>Magna Cum Laude</strong>
            </span>
            <span>STI College Caloocan · 2025</span>
          </div>

        </section>
        <ContactSection motion={orbMotion} signals={contactSignals} reduced={paused} enabled={isHome && !navigation.busy}/>
      </main>
      <CursorTrail paused={paused}/>
      </div>
      {selectedCase && <ProjectCase key={selectedCase.path} study={selectedCase} motion={orbMotion} transitionRef={navigation.transitionRef} onBack={navigation.back} busy={navigation.busy}/>}
      {!isHome && !selectedCase && <main className="project-not-found"><h1>Project not found.</h1><a href="/#work" onClick={navigation.back}>Back to projects</a></main>}
      {navigation.transition && <OrbRouteTransition transaction={navigation.transition} motion={orbMotion} onCover={navigation.commit} onDone={navigation.finish}/>}
    </>
  );
}
const reactRoot=import.meta.hot?.data.reactRoot ?? createRoot(document.getElementById('root'));
if(import.meta.hot)import.meta.hot.data.reactRoot=reactRoot;
reactRoot.render(<App />);
