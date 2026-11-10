import { Fragment, useEffect, useRef } from 'react';
import { restingOrbFrame } from './projectMagic';

export default function ProjectCase({study,motion,transitionRef,onBack,busy}) {
  const heading=useRef(null),orb=useRef(null);
  const {project}=study;
  useEffect(()=>{
    if(!busy)heading.current?.focus({preventScroll:true});
    document.title=`${project.name} — Paul Luiser Vasquez`;
    let frame;
    function tick(){
      if(!transitionRef.current){
        const r=orb.current.getBoundingClientRect();
        motion.current=restingOrbFrame({x:r.left+r.width/2,y:r.top+r.height/2,radius:r.width*.34,project:project.art});
      }
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);document.title='Paul Luiser Vasquez — The Showroom';};
  },[motion,transitionRef,busy,project]);
  const facts=[['My role',project.role],['Period',project.date]];
  if(project.methodology)facts.push(['Method',project.methodology]);
  if(project.company)facts.push(['Organization',project.company]);
  facts.push(...(study.facts??[]));
  return <div className="project-case-screen" inert={busy} data-project={project.art}>
    <a className="skip" href="#case-main">Skip to case study</a>
    <header className="case-page-header"><a href="/#work" onClick={onBack} className="case-return"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>Back to projects</a><span>Paul Luiser Vasquez</span></header>
    <main id="case-main" className="project-case-page">
      <header className="case-page-intro">
        <div><h1 ref={heading} tabIndex={-1}>{study.title.map((line,index)=><Fragment key={line}>{index>0&&<br/>}{line}</Fragment>)}</h1><p>{study.intro}</p></div>
        <div ref={orb} id="case-orb-stage" className="case-orb-slot" aria-hidden="true"/>
      </header>
      <dl className="case-page-facts">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <nav className="case-page-index" aria-label="Case study sections"><a href="#case-challenge">The challenge</a><a href="#case-approach">My approach</a>{study.deliverables&&<a href="#case-deliverables">Deliverables</a>}<a href="#case-outcome">{study.outcome.label}</a></nav>
      <section id="case-challenge" className="case-editorial-row"><h2>The challenge</h2><div><p className="case-lead">{study.challenge.lead}</p><p>{study.challenge.body}</p></div></section>
      <section id="case-approach" className="case-editorial-row"><h2>How I led the work</h2><div className="case-approach-list">{study.approach.map(([title,body])=><section key={title}><h3>{title}</h3><p>{body}</p></section>)}</div></section>
      {study.deliverables&&<section id="case-deliverables" className="case-editorial-row"><h2>What I delivered</h2><div><p>{study.deliverables.body}</p><div className="case-document-pair">{study.deliverables.items.map(([label,title,body])=><div key={label}><span>{label}</span><h3>{title}</h3><p>{body}</p></div>)}</div></div></section>}
      <section id="case-outcome" className="case-editorial-row case-outcome"><h2>{study.outcome.label}</h2><div><span className="case-status">{study.outcome.status}</span><h3>{study.outcome.title}</h3><p>{study.outcome.body}</p></div></section>
      <footer className="case-page-footer"><a href="/#work" onClick={onBack}>Back to projects</a><a href="mailto:paulluiser@gmail.com">Discuss an opportunity</a></footer>
    </main>
  </div>;
}
