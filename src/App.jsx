import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EMAIL, LINKEDIN, RESUME, NAV, STRENGTHS, TEAMS, PROJECTS, STATS, ROLES } from "./content.js";
import { Lines, Reveal, Stat } from "./ui.jsx";
import { Icon, TOOLS } from "./icons.jsx";
import SprintBoard from "./viz/SprintBoard.jsx";
import AiStudio from "./viz/AiStudio.jsx";
import ProjectArt from "./viz/ProjectArt.jsx";
import linkedinLogo from "./assets/tools/linkedin.svg";
import Gantt from "./viz/Gantt.jsx";
import HireTicket from "./viz/HireTicket.jsx";
import Preloader from "./viz/Preloader.jsx";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const NAME_LH = 0.8;

function useMedia(query) {
  const [on, setOn] = useState(() => typeof matchMedia !== "undefined" && matchMedia(query).matches);
  useEffect(() => {
    const m = matchMedia(query);
    const f = () => setOn(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, [query]);
  return on;
}

function useScrollSpy(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-35% 0px -60% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return active;
}

/** The name, set as large as the width allows, sitting behind the portrait like a poster. */
function HeroName() {
  const lines = ["PAUL LUISER", "VASQUEZ"];
  const refs = useRef([]);
  const h1 = useRef(null);

  useLayoutEffect(() => {
    const box = h1.current;
    if (!box) return;
    const fit = () => {
      const els = refs.current.slice(0, lines.length).filter(Boolean);
      const W = box.clientWidth * 0.88;
      // Each line is fitted to the width (as in the reference); the last one bleeds off the bottom.
      let sizes = els.map((el) => { el.style.fontSize = "100px"; return W / (el.firstElementChild.getBoundingClientRect().width / 100); });
      // Never let the name rise into the copy row above it.
      const hero = box.parentElement, row = hero.querySelector(".hero-top");
      if (row && !matchMedia("(max-width: 700px)").matches) {
        const free = hero.getBoundingClientRect().bottom - row.getBoundingClientRect().bottom - 24;
        const visible = sizes.reduce((a, b) => a + b, 0) * 0.84 * (1 - 0.14);
        if (visible > free) sizes = sizes.map((v) => v * free / visible);
      }
      els.forEach((el, i) => { el.style.fontSize = `${sizes[i]}px`; });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box.parentElement);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  let n = 0;
  return (
    <h1 className="hero-name" id="hero-title" aria-label="Paul Luiser Vasquez" ref={h1}>
      {lines.map((line, li) => (
        <span className="name-line" key={line} ref={(el) => (refs.current[li] = el)} aria-hidden="true">
          <span>{[...line].map((ch, i) => <span className="ltr" key={i} style={{ "--i": n++ }}>{ch === " " ? "\u00A0" : ch}</span>)}</span>
        </span>
      ))}
    </h1>
  );
}

function CopyEmail() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setDone(true); setTimeout(() => setDone(false), 2000); }
    catch { location.href = `mailto:${EMAIL}`; }
  };
  return (
    <button type="button" className="foot-link" onClick={copy} aria-live="polite">
      <Icon name={done ? "check" : "copy"} size={18} />{done ? "Copied" : "Copy email"}
    </button>
  );
}

/**
 * "Email Paul": opens the visitor's mail app and also copies the address, so the click does
 * something useful even when no mail app is set up (e.g. people who use Gmail in the browser).
 */
function EmailButton() {
  const [done, setDone] = useState(false);
  const click = () => {
    navigator.clipboard?.writeText(EMAIL).then(() => { setDone(true); setTimeout(() => setDone(false), 2400); }).catch(() => {});
  };
  return (
    <a className="btn btn-accent" href={`mailto:${EMAIL}`} onClick={click} aria-live="polite">
      {done ? <><Icon name="check" size={16} />Email copied</> : "Email Paul"}
    </a>
  );
}

export default function App() {
  const bar = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const active = useScrollSpy(NAV.map(([id]) => id));

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      setScrolled(scrollY > 24);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Smooth scroll, as in the reference. Anchor links glide to their section, clearing the header.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ smoothWheel: true, anchors: { offset: -60 } });
    window.lenis = lenis;
    if (!document.documentElement.classList.contains("loaded")) lenis.stop();
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.lenis = undefined; };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menu);
    if (menu) window.lenis?.stop(); else if (document.documentElement.classList.contains("loaded")) window.lenis?.start();
    if (!menu) return;
    const onKey = (e) => { if (e.key === "Escape") setMenu(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [menu]);

  const marquee = (hidden) => (
    <ul className="marquee-set" aria-hidden={hidden || undefined}>
      {STRENGTHS.map((s) => <li key={s} className={s === "AI fluency" ? "is-hi" : undefined}>{s}</li>)}
    </ul>
  );

  return (
    <>
      <Preloader onDone={() => document.documentElement.classList.add("loaded")} />
      <a className="skip" href="#main">Skip to content</a>
      <div className="progress" ref={bar} aria-hidden="true" />

      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <nav className="nav-in" aria-label="Sections">
          <a className="nav-name" href="#top" onClick={() => setMenu(false)}>Paul Luiser Vasquez</a>
          <ul className="nav-links">
            {NAV.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} aria-current={active === id ? "location" : undefined}>{label}</a></li>
            ))}
          </ul>
          <button type="button" className="burger" aria-expanded={menu} aria-controls="menu" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu(!menu)}>
            <span /><span /><span />
          </button>
        </nav>
      </header>
      <div className="menu" id="menu" hidden={!menu}>
        <ul>
          {NAV.map(([id, label], i) => (
            <li key={id} style={{ "--i": i }}><a href={`#${id}`} onClick={() => setMenu(false)}>{label}</a></li>
          ))}
        </ul>
      </div>

      <main id="main">
        {/* ---------- Hero ---------- */}
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-top">
            <p className="hero-tagline">
              {["Speaking the", "language of", <><em>tech</em>, <em>business</em>,</>, <>and <em>people</em></>].map((l, i) => (
                <span className="line" key={i}><span className="line-in" style={{ "--d": `${700 + i * 80}ms` }}>{l}</span>{" "}</span>
              ))}
            </p>
            <div className="hero-side">
              <p className="hero-status"><i aria-hidden="true" />Open to opportunities</p>
              <p className="hero-role">IT Project Manager<span>Agile (Scrum) · Waterfall · Hybrid</span></p>
              <p className="hero-desc">I lead software teams from discovery to delivery, with generative and agentic AI built into how I plan, document, and prototype.</p>
              <div className="hero-cta">
                <EmailButton />
                <a className="btn btn-line" href={RESUME} download="Paul-Luiser-Vasquez-Resume.pdf">Download résumé</a>
              </div>
            </div>
          </div>
          <div className="hero-portrait"><img src="./portrait.webp" width="1122" height="1402" alt="Portrait of Paul Luiser Vasquez" fetchPriority="high" /></div>
          <div className="hero-fade" aria-hidden="true" />
          <HeroName />
          <a className="hero-cue" href="#teams"><i aria-hidden="true" />Scroll to enter</a>
        </section>

        {/* ---------- Strengths marquee ---------- */}
        <section className="marquee" aria-label="Strengths">
          <div className="marquee-track">{marquee(false)}{marquee(true)}</div>
        </section>

        {/* ---------- Teams ---------- */}
        <section className="sec" id="teams" aria-labelledby="teams-title">
          <div className="split">
            <div className="split-lead">
              <Lines id="teams-title" className="h-xl" lines={["Five teams.", "One shared", "language."]} />
              <Reveal as="p" className="lead" delay={150}>Projects stall in translation. I make sure the people who need the product, design it, build it, and test it all mean the same thing.</Reveal>
            </div>
            <ul className="rows">
              {TEAMS.map((t, i) => (
                <Reveal as="li" key={t.team} delay={i * 90}>
                  <span className="rows-key">{t.team}</span>
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Delivery: the kanban ---------- */}
        <section className="sec on-ivory" id="delivery" aria-labelledby="delivery-title">
          <div className="sec-head">
            <Lines id="delivery-title" className="h-xl" lines={["Delivery,", "in motion."]} />
            <Reveal as="p" className="sec-note" delay={150}>Agile (Scrum), Waterfall, or hybrid: I pick the method the project needs, then keep the board honest.</Reveal>
          </div>
          <Reveal><SprintBoard /></Reveal>
          <Reveal className="tools-row" delay={100}>
            <h3>Tools I run delivery with</h3>
            <div className="tools-marquee">
              <div className="tools-track">
                {[0, 1].map((copy) => (
                  <ul className="tools" key={copy} aria-hidden={copy ? true : undefined} aria-label={copy ? undefined : "Tools"}>
                    {TOOLS.map((t) => (
                      <li key={t.name}><img src={t.src} alt="" width="40" height="40" /><span translate="no">{t.name}</span></li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---------- AI ---------- */}
        <section className="sec sec-ai" id="ai" aria-labelledby="ai-title">
          <div className="sec-head">
            <Lines id="ai-title" className="h-xl" lines={[<><em>Generative</em> and</>, <><em>agentic AI,</em> with a</>, "human in the loop."]} />
            <Reveal as="p" className="sec-note" delay={150}>I use AI to move faster on requirements, prototypes, research, and documentation. I review every output before it reaches a stakeholder.</Reveal>
          </div>
          <Reveal><AiStudio /></Reveal>
        </section>

        {/* ---------- Work ---------- */}
        <section className="sec" id="work" aria-labelledby="work-title">
          <div className="sec-head">
            <Lines id="work-title" className="h-xl" lines={["Top project", "picks"]} />
          </div>
          <ul className="work">
            {PROJECTS.map((p, i) => (
              <Reveal as="li" key={p.id} className="work-card" delay={i % 2 ? 120 : 0}>
                <ProjectArt id={p.id} />
                <div className="work-row">
                  <div>
                    <h3>{p.name}</h3>
                    <p>{p.blurb}</p>
                  </div>
                  <div className="work-meta">
                    <span>{p.when}</span>
                    <b>{p.outcome}</b>
                  </div>
                </div>
                <p className="work-role">{p.role}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ---------- Numbers + experience ---------- */}
        <section className="sec on-ivory" id="experience" aria-labelledby="experience-title">
          <dl className="stats">
            {STATS.map(([v, label], i) => (
              <Stat key={label} value={v} label={label} delay={i * 110} />
            ))}
          </dl>

          <div className="sec-head sec-head-gap">
            <Lines id="experience-title" className="h-xl" lines={["Four years,", "one direction."]} />
          </div>
          <Reveal><Gantt /></Reveal>

          <ol className="roles">
            {ROLES.map((r, i) => (
              <Reveal as="li" key={r.title} delay={i * 60}>
                <p className="roles-when">{r.when}</p>
                <div>
                  <h3>{r.title}{r.current && <span className="badge-current"><i aria-hidden="true" />Current role</span>}</h3>
                  <p className="roles-org">{r.org}</p>
                </div>
                <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </Reveal>
            ))}
            <Reveal as="li" className="roles-edu">
              <p className="roles-when">2025</p>
              <div>
                <h3>BS Computer Science, Magna Cum Laude</h3>
                <p className="roles-org">STI College Caloocan</p>
              </div>
            </Reveal>
          </ol>
        </section>

        {/* ---------- Contact ---------- */}
        <section className="sec finale" id="contact" aria-labelledby="contact-title">
          <div className="finale-top">
            <div>
              <Lines id="contact-title" className="h-xxl" lines={["One ticket", "left in the", "backlog."]} />
              <Reveal as="p" className="lead" delay={150}>I'm open to IT Project Management and Product Manager/Owner roles. Move the ticket to Done and let's talk.</Reveal>
            </div>
            <Reveal className="finale-board" delay={120}><HireTicket email={EMAIL} /></Reveal>
          </div>

          <Reveal>
            <a className="big-email" href={`mailto:${EMAIL}`}>{EMAIL}<Icon name="mail" size={40} /></a>
          </Reveal>
          <div className="foot">
            <ul>
              <li><CopyEmail /></li>
              <li><a className="foot-link" href={LINKEDIN} target="_blank" rel="noopener noreferrer"><img className="foot-logo" src={linkedinLogo} alt="" width="18" height="18" />LinkedIn</a></li>
              <li><a className="foot-link" href={RESUME} download="Paul-Luiser-Vasquez-Resume.pdf"><Icon name="download" size={18} />Download résumé</a></li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
