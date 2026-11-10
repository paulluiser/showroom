import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';
import { projectArrivalFrame, projectViewportPosition } from './projectArrival';
import { continuityFrame, advanceChapterTransfer } from './continuityMotion';
import { advanceContact, contactFrame } from './contactMotion';
import {aiOrbArrived,orbPowerTransfer,robotWakeFrame,collectTeamOrb,COLLECTION_DURATION,POSSESSION_DURATION} from './robotMotion';
import { qualities } from './qualities';
import { teams } from './teams';
import { heroFrame, ease, teamOrbitPositions, teamOrbState, teamCollisionGlow, teamCollisionBreath, impactBreath, collisionRadiation, headerZone, tourStep, qualityArrival, collisionFrame, entranceBlast, advanceHeroCenter, INTRO_DURATION, INTRO_SETTLE_DURATION, FUSION_START, FUSION_DURATION, TEAM_DURATION, CENTER_DURATION, teamLabelPositions } from './heroMotion';
const perspectives = teams;
export default function Hero({paused,workflow=0,workflowClock,workflowArrival,project="enterprise",orbMotion,contactSignals,onProjectEntry,active=true}) {
  const root=useRef(null), header=useRef(null), orbSlot=useRef(null), controls=useRef({paused,elapsed:0});
  const motion=orbMotion;
  controls.current.active=active;
  const [centered,setCentered]=useState(false), [docked,setDocked]=useState(false);
  const [tour,setTour]=useState({index:0});
  const [introDone,setIntroDone]=useState(paused);
  const [sweepReady,setSweepReady]=useState(false);
  const [announcement,setAnnouncement]=useState('');
  controls.current.paused=paused;
  controls.current.workflow=workflow;
  controls.current.project=project;
  controls.current.contactSignals=contactSignals;
  controls.current.workflowClock=workflowClock;
  controls.current.workflowArrival=workflowArrival;
  useEffect(()=> {
    let id,last=performance.now(),introElapsed=paused?INTRO_DURATION:0,centerElapsed=0,dockProgress=0,orbitTime=0,wakeElapsed=0;
    let wasCentered=false,wasDocked=false,wasSweepReady=false,done=false;
    let previousIndex=-1,finishingIntro=false,collectionElapsed=0,collectionTour=null;
    const landingLinks=root.current.querySelector('.hero-links');
    const aiSection=document.getElementById('intelligence');
    const aiStage=aiSection?.querySelector('#robot-stage');
    const projectPanel = document.querySelector('.project-preview-frame');
    const sectionRail = document.querySelector('.section-rail');
    let projectPhase = 'waiting';
    let projectArrival = null;
    let historyProgress = 0;
    let contactProgress = 0, contactFocus = 0;
    let scrollingUntil = 0;
    const scrolling = () => { if (scrollY > 12) scrollingUntil = performance.now() + 340; };
    function setProjectPhase(next) {
      if (next === projectPhase) return;
      projectPhase = next;
      onProjectEntry(next);
    }
    const chapterSlots=[
      {section:'work',chapter:1,lens:0,loop:0},
      {id:'experience-orb-stage',section:'experience',chapter:2,lens:0,loop:0},
      {id:'contact-orb-stage',section:'contact',chapter:3,lens:0,loop:0},
    ].map(stop=>({...stop,node:stop.chapter === 1 ? projectPanel : document.getElementById(stop.id),host:document.getElementById(stop.section)}));
    const tick=(now)=> {
      const dt=Math.min(now-last,60); last=now;
      const c=controls.current;
      if(!c.active){id=requestAnimationFrame(tick);return;}
      if(['#work','#experience','#contact','#intelligence'].includes(location.hash)){
        introElapsed=INTRO_DURATION;
        if(!done){centerElapsed=CENTER_DURATION;collectionElapsed=COLLECTION_DURATION;dockProgress=1;}
      }
      if(!document.hidden) {
        if(!c.paused) introElapsed=Math.min(INTRO_DURATION,introElapsed+dt*(finishingIntro?12:1));
        else introElapsed=INTRO_DURATION;
        if(!c.paused)orbitTime+=dt/1000;
        centerElapsed=advanceHeroCenter(centerElapsed,scrollY,dt,c.paused,introElapsed>=INTRO_DURATION);
      }
      const slot=innerWidth<=700 ? orbSlot.current?.getBoundingClientRect() : null;
      const landing=slot ? {y:slot.top+slot.height/2,radius:slot.width/2} : undefined;
      const protectedTop=Math.max(headerZone(innerWidth),(header.current?.getBoundingClientRect().bottom ?? 0)+16);
      document.documentElement.style.setProperty('--header-zone',`${protectedTop}px`);
      const center=ease(centerElapsed/CENTER_DURATION);
      const teamHeaderBottom=protectedTop+(innerWidth<=700?50:28);
      const headerPresence=ease((center-.58)/.34);
      landingLinks.inert=introElapsed<INTRO_DURATION || center>=.32;
      if(header.current) {
        const collapsed = now < scrollingUntil;
        header.current.dataset.collapsed = String(collapsed);
        header.current.style.opacity=collapsed ? 0 : headerPresence;
        header.current.style.translate=`0 ${collapsed ? -90 : -6*(1-headerPresence)}px`;
        header.current.style.visibility=headerPresence>0?'visible':'hidden';
        header.current.inert=headerPresence<.98 || collapsed;
      }
      const handoffBoundary=root.current.offsetHeight-innerHeight;
      const requestedDock=ease((scrollY-handoffBoundary)/(innerHeight*.55));
      if(scrollY<handoffBoundary-8){collectionElapsed=0;collectionTour=null;}
      if(collectionTour===null && requestedDock>0 && introElapsed>=INTRO_DURATION){
        collectionTour=c.elapsed;
      }
      // Native chapter links bypass the earlier hero choreography.
      if(requestedDock>0 && ['#work','#inventory-case','#inventory-title','#experience','#contact'].includes(location.hash)) collectionElapsed=COLLECTION_DURATION;
      if(collectionTour!==null && collectionElapsed<COLLECTION_DURATION && !document.hidden){
        collectionElapsed=Math.min(COLLECTION_DURATION,collectionElapsed+(c.paused?COLLECTION_DURATION:dt));
      }
      const collectionComplete=collectionElapsed>=COLLECTION_DURATION;
      const dockTarget=collectionComplete?ease((scrollY-handoffBoundary)/(innerHeight*.55)):0;
      const transferTarget=collectionComplete?dockTarget:0;
      const transferStep=c.paused?1:dt/POSSESSION_DURATION;
      dockProgress=transferTarget>dockProgress?Math.min(transferTarget,dockProgress+transferStep):Math.max(transferTarget,dockProgress-(c.paused?1:dt/800));
      const dock=dockProgress;
      const robotRect=aiStage?.getBoundingClientRect();
      const robotTarget=robotRect ? {
        x:robotRect.left+robotRect.width/2,y:robotRect.top+robotRect.height*.50,
        size:Math.min(robotRect.width/2.85,robotRect.height/3.22),
        visible:robotRect.bottom>0&&robotRect.top<innerHeight,
      } : null;
      if(dock>.68 && robotTarget?.visible && !document.hidden)wakeElapsed=Math.min(3200,wakeElapsed+(c.paused?3200:dt));
      if(dock<.05)wakeElapsed=0;
      const intro=ease(introElapsed/INTRO_DURATION);
      const collision=collisionFrame(introElapsed);
      const horizonReveal=collision.landscapeReveal;
      const f=heroFrame({width:innerWidth,height:innerHeight,intro,center,dock,horizonReveal,landing,headerBottom:teamHeaderBottom});
      if(introElapsed<INTRO_DURATION) {
        const settle=collision.settle;
        const target=heroFrame({width:innerWidth,height:innerHeight,intro:1,center:0,dock:0,landing});
        f.x=innerWidth*.5+(target.x-innerWidth*.5)*settle;
        f.y=innerHeight*.5+(target.y-innerHeight*.5)*settle;
      }
      Object.assign(f,collision);
      f.revealFeather=Math.min(280,Math.max(120,innerWidth*.15));
      f.revealRadius=Math.hypot(innerWidth*.5,root.current.offsetHeight-innerHeight*.5)*collision.landscapeReveal;
      if(introElapsed<INTRO_DURATION) {
        const finalRadius=heroFrame({width:innerWidth,height:innerHeight,intro:1,center:0,dock:0,landing}).radius;
        f.radius=finalRadius*collision.orbScale;
      }
      const activeTeam=tourStep(c.elapsed).index;
      if(robotTarget && dock>0){
        const source=heroFrame({width:innerWidth,height:innerHeight,intro,center,dock:0,horizonReveal,landing,headerBottom:teamHeaderBottom});
        Object.assign(f,orbPowerTransfer(source,robotTarget,dock,{
          width:innerWidth,height:innerHeight,headerBottom:protectedTop,
        }));
        if(c.paused)f.flight=null;
        f.robot={...robotTarget,state:robotWakeFrame(wakeElapsed),mode:c.workflow};
        aiStage.style.setProperty('--robot-power',f.robot.state.energy);
      }
      if(robotTarget)f.robot={...robotTarget,state:robotWakeFrame(wakeElapsed),mode:c.workflow};
      if(robotTarget && aiSection){
        const sectionRect=aiSection.getBoundingClientRect();
        aiSection.style.setProperty('--ai-glow-x',`${robotTarget.x-sectionRect.left}px`);
        aiSection.style.setProperty('--ai-glow-y',`${robotTarget.y-sectionRect.top}px`);
        aiSection.style.setProperty('--ai-glow-power',f.robot.state.energy);
      }
      f.blast=c.paused?entranceBlast(INTRO_DURATION):entranceBlast(introElapsed);
      f.selected=qualities.length+activeTeam;
      f.teamMode=center;
      f.collisionGlow=c.paused?0:teamCollisionGlow(c.elapsed)*center*(1-dock);
      f.impactBreath=c.paused?0:teamCollisionBreath(c.elapsed)*center*(1-dock);
      const radiation=collisionRadiation(c.elapsed);
      f.radiationSpread=radiation.spread;
      f.radiationOpacity=c.paused?0:radiation.opacity*center*(1-dock);
      if(collectionTour!==null && !collectionComplete){
        const mergeTime=collectionElapsed*1800/COLLECTION_DURATION;
        const impact=Math.max(0,...teams.map((_,i)=>Math.exp(-Math.pow((mergeTime-(i*120+1100))/180,2))));
        f.collisionGlow=Math.max(f.collisionGlow,impact);
        if(!c.paused)f.impactBreath=Math.max(f.impactBreath,...teams.map((_,i)=>teamOrbState(i,collectionTour).visibility>0?impactBreath(mergeTime-(i*120+1100)):0));
        f.radiationOpacity=impact*.65;f.radiationSpread=ease(collectionElapsed/COLLECTION_DURATION);
      }
      f.collisionGlow *= .88;
      f.impactBreath *= .88;
      const age=c.elapsed%TEAM_DURATION;
      f.shimmer=c.paused?0:center*(1-dock)*Math.exp(-Math.pow((age-650)/220,2));
      const orbitRadius=Math.min(innerWidth*.18,heroFrame({width:innerWidth,height:innerHeight,intro:1,center,dock,landing}).radius);
      const orbitalPositions=teamOrbitPositions(orbitTime,{width:innerWidth,height:innerHeight,centerX:f.x,centerY:f.y,mainRadius:f.radius,headerBottom:teamHeaderBottom});
      f.satellites=[
        ...qualities.map((_,i)=>{
          const arrival=qualityArrival(i,introElapsed,{width:innerWidth,height:innerHeight,coreX:f.x,coreY:f.y,radius:orbitRadius});
          return {...arrival,visibility:arrival.visibility*(1-dock)};
        }),
        ...teams.map((_,i)=>{
          const position=orbitalPositions[i];
          const state=collectionTour===null?teamOrbState(i,c.elapsed):collectTeamOrb(i,collectionElapsed,collectionTour);
          const travel=state.phase==='birth'?state.spawn:1-state.pull;
          return {...position,x:position.x*travel,y:position.y*travel-Math.sin(state.pull*Math.PI)*f.radius*.12,z:position.z*travel,
            visibility:f.teamVisibility*state.visibility,focus:state.focus,pull:state.pull,spawn:state.spawn};
        }),
      ];
      f.qualityTrails=introElapsed>=INTRO_DURATION?[]:qualities.map((_,i)=>Array.from({length:48},(_,j)=>{
        const past=Math.max(0,introElapsed-(47-j)*8);
        return qualityArrival(i,past,{width:innerWidth,height:innerHeight,coreX:innerWidth*.5,coreY:innerHeight*.5,radius:orbitRadius});
      }));
      const qualityPoints=f.satellites.slice(0,qualities.length);
      const currentBeat=qualityPoints.reduce((strongest,point)=>point.visibility>strongest.visibility?point:strongest,qualityPoints[0]);
      f.fusion=currentBeat.pulse;
      if(intro>=1 && !c.paused){
        const age=c.elapsed%TEAM_DURATION;
        const consumed=teamOrbState(activeTeam,c.elapsed);
        f.shimmer=Math.max(f.shimmer,consumed.phase==='collision'?Math.exp(-Math.pow((age-5300)/170,2))*center*(1-dock):0);
      }
      f.workflow=c.workflowClock?.current ?? {index:c.workflow,progress:0,pulse:0};
      f.dock=dock;
      f.project=c.project;
      f.clipTop=0;
      const aiSource = { x: f.x, y: f.y, radius: f.radius };
      const panel = projectPanel?.getBoundingClientRect();
      const mobileProject = innerWidth <= 700;
      const projectBottom = mobileProject ? sectionRail?.getBoundingClientRect().top ?? innerHeight : innerHeight;
      const projectPosition = panel && projectViewportPosition(panel, projectBottom, protectedTop);
      if (projectPosition && projectPosition !== 'visible' && !c.paused) {
        projectArrival = null;
        setProjectPhase('waiting');
      }
      const historyStage = chapterSlots[1].node;
      const historyBounds = chapterSlots[1].host?.getBoundingClientRect();
      const historyTarget = historyBounds ? Math.max(0, Math.min(1, (innerHeight * .9 - historyBounds.top) / Math.max(1, innerHeight * .9 - protectedTop - 32))) : 0;
      historyProgress = advanceChapterTransfer(historyProgress, historyTarget, dt, c.paused);
      const contactBounds = chapterSlots[2].host?.getBoundingClientRect();
      const contactTarget = contactBounds ? Math.max(0, Math.min(1, (innerHeight * .9 - contactBounds.top) / Math.max(1, innerHeight * .9 - protectedTop - 32))) : 0;
      if (!document.hidden) contactProgress = advanceContact(contactProgress, c.paused ? (contactTarget >= .5 ? 1 : 0) : contactTarget, dt, c.paused);
      if (dock > 0) {
        const leaveAI = robotTarget
          ? ease((protectedTop + robotTarget.size * .65 - robotTarget.y) / Math.max(72, robotTarget.size * .8))
          : 1;
        const stops = chapterSlots.filter(stop => stop.chapter !== 3 && stop.node && stop.host && (stop.chapter !== 1 || projectPhase === 'ready' || projectPosition === 'above')).map(stop=>{
          const rect=stop.node.getBoundingClientRect();
          const projectTravel = stop.chapter === 1 && panel
            ? ease((innerHeight * .96 - panel.top) / (innerHeight * .18)) * ease(dock)
            : undefined;
          return {...stop, travel: stop.chapter === 2 ? ease(historyProgress) * ease(dock * leaveAI) : projectTravel, top:stop.host.getBoundingClientRect().top,
            x:rect.left+rect.width/2,y:stop.chapter === 1 && historyProgress > 0 ? Math.max(protectedTop + 32, Math.min(innerHeight - 40, rect.top + rect.height / 2)) : rect.top+rect.height/2,
            radius:stop.chapter === 1 ? 16 : stop.chapter === 2 ? 7 : Math.min(rect.width*.34,rect.height*.34)};
        });
        Object.assign(f,continuityFrame(f,stops,innerHeight,protectedTop,c.paused,dock*leaveAI));
        const historyGlow = Number(chapterSlots[1].node?.dataset.glow || 0);
        if (!c.paused) f.collisionGlow = Math.max(f.collisionGlow || 0, historyGlow * ease(1 - Math.abs(f.chapter - 2)) * .6);
        if (projectPhase === 'ready' && projectPosition === 'visible' && historyProgress === 0) {
          f.orbReveal = (f.orbReveal ?? 1) * ease(Math.abs(f.chapter - 1) * 1.5);
        }
      }
      const historyInView = historyBounds && historyBounds.top < innerHeight && historyBounds.bottom > protectedTop;
      f.chapterTransit = historyInView && historyProgress > 0 && f.chapter < 1.999;
      if (historyInView && historyProgress > 0 && f.chapter < 2.01) f.orbReveal = ease(historyProgress / .12);
      if (historyStage) {
        const target = historyStage.getBoundingClientRect();
        historyStage.dataset.docked = String(contactProgress === 0 && historyInView && historyProgress === 1 && Math.abs(f.chapter - 2) < .01 && Math.hypot(f.x - target.left - target.width / 2, f.y - target.top - target.height / 2) < 3);
      }
      if (panel && projectPhase !== 'ready' && dock > 0 && historyProgress === 0 && !document.hidden) {
        const centerY = panel.top + panel.height / 2;
        const radius = Math.min(50, panel.height * .22);
        const panelVisible = centerY > protectedTop + radius && centerY < projectBottom - radius;
        // Carry the orb along its AI column as the taller layouts scroll away.
        const anticipation = robotTarget && dock === 1 && !c.paused
          ? ease((protectedTop + aiSource.radius * 1.55 - aiSource.y) / Math.max(90, aiSource.radius * 1.35))
          : 0;
        const heldOrb = {
          x: aiSource.x,
          y: aiSource.y + (protectedTop + 35 - aiSource.y) * anticipation,
          radius: aiSource.radius + (16 - aiSource.radius) * anticipation,
        };
        if (c.paused) {
          setProjectPhase('ready');
        } else if (projectPosition === 'visible' && (panelVisible || projectArrival)) {
          if (!projectArrival) {
            const previous = motion.current;
            projectArrival = { age: 0, source: previous && (previous.orbReveal ?? 1) > .06 ? previous : heldOrb };
          } else {
            projectArrival.age += dt;
          }
          const frame = projectArrivalFrame(projectArrival.age, projectArrival.source, {
            x: panel.left + panel.width / 2, y: centerY, radius,
          });
          Object.assign(f, frame, { flight: null, lens: 0, loop: 0 });
          setProjectPhase(frame.phase);
          if (frame.phase === 'ready') projectArrival = null;
        } else {
          if (anticipation > 0 && panel.top > protectedTop) {
            Object.assign(f, heldOrb, { chapter: anticipation, projectCharge: anticipation * .75, flight: null });
          }
        }
      }

      const contactVisible = contactBounds && contactBounds.top < innerHeight && contactBounds.bottom > protectedTop;
      if (contactProgress > 0 && contactVisible && dock > 0) {
        const stage = chapterSlots[2].node.getBoundingClientRect();
        const email = chapterSlots[2].host.querySelector('.contact-email').getBoundingClientRect();
        const origin = historyStage.getBoundingClientRect();
        const x = stage.left + stage.width / 2, y = stage.top + stage.height / 2;
        const dx = email.right - x, dy = email.bottom - y, distance = Math.max(1, Math.hypot(dx, dy));
        const signal = c.contactSignals.current;
        const focused = !c.paused && (signal.hover || signal.focus) ? 1 : 0;
        contactFocus += (focused - contactFocus) * (c.paused ? 1 : 1 - Math.exp(-dt / 180));
        const ending = contactFrame(contactProgress, {
          x: Math.max(24, Math.min(innerWidth - 24, origin.left + origin.width / 2)),
          y: Math.max(protectedTop + 20, Math.min(innerHeight - 35, origin.top + origin.height / 2)), radius: 7,
        }, { x, y, radius: Math.min(stage.width, stage.height) * .34, leanX: dx / distance * 9, leanY: dy / distance * 9 }, {
          focus: contactFocus, copyAge: now - signal.copyAt, reduced: c.paused,
        });
        Object.assign(f, ending);
        if (!c.paused && contactProgress < 1) f.y = Math.max(protectedTop + f.radius + 8, Math.min(innerHeight - f.radius - 32, f.y));
        f.collisionGlow = Math.max((f.collisionGlow || 0) * (1 - contactProgress), ending.contactGlow);
        f.chapterTransit = !c.paused && contactProgress < 1;
      }
      f.radiationOpacity *= .86;
      f.clipBottom=0;
      f.aiReady=aiOrbArrived(dock,robotTarget,f,protectedTop,innerHeight);
      if(c.workflowArrival)c.workflowArrival.current=f.aiReady;
      motion.current=f;
      const el=root.current;
      el.style.setProperty('--center',center);
      el.style.setProperty('--dock',dock);
      el.style.setProperty('--intro',intro);
      el.style.setProperty('--copy-reveal',collision.copyReveal);
      el.style.setProperty('--horizon',f.horizon);
      el.style.setProperty('--impact-x',`${innerWidth*.5}px`);
      el.style.setProperty('--impact-y',`${innerHeight*.5+scrollY}px`);
      el.style.setProperty('--reveal-radius',`${f.revealRadius}px`);
      el.style.setProperty('--reveal-feather',`${f.revealFeather}px`);
      el.style.setProperty('--quality-visibility',f.qualityVisibility);
      el.style.setProperty('--team-visibility',f.teamVisibility);
      el.style.setProperty('--orb-x',`${f.x}px`);
      el.style.setProperty('--orb-y',`${f.y}px`);
      const ready=center===1;
      if(ready!==wasCentered) {wasCentered=ready;setCentered(ready);}
      const isDocked=dock>.96;
      if(isDocked!==wasDocked) {wasDocked=isDocked;setDocked(isDocked);}
      if(intro===1&&!done) {done=true;setIntroDone(true);}
      const showSweep=done && !c.paused && scrollY<=12 && center<.04 && dock<.04;
      if(showSweep!==wasSweepReady) {wasSweepReady=showSweep;setSweepReady(showSweep);}
      if(ready && collectionTour===null && dock<.1 && !c.paused && !document.hidden) c.elapsed+=dt;
      const next=tourStep(c.elapsed);
      if(next.index!==previousIndex) {
        previousIndex=next.index;setTour(next);
      }
      el.querySelectorAll('.satellite').forEach((node)=> {
        const orbIndex=Number(node.dataset.orbIndex);
        if(orbIndex>=qualities.length) {
          const anchor=teamLabelPositions(innerWidth,innerHeight)[orbIndex-qualities.length];
          node.style.setProperty('--badge-width',`${anchor.width}px`);
          node.style.opacity=1;
          node.style.visibility='visible';
          node.inert=false;
          return;
        }
        const point=f.satellites[orbIndex];
        const worldPerPixel=2*Math.tan(Math.PI/9)*8/innerHeight;
        const projection=8/(8-point.z*worldPerPixel);
        node.style.setProperty('--sx',`${point.x*projection}px`);
        node.style.setProperty('--sy',`${point.y*projection}px`);
        node.style.setProperty('--depth',projection);
        node.style.opacity=point.labelOpacity ?? point.visibility;
        const occluded=point.visibility<=0 || (point.z<0 && Math.hypot(point.x,point.y)<f.radius+16);
        node.style.visibility=occluded?'hidden':'visible';
        node.inert=occluded;
      });
      id=requestAnimationFrame(tick);
    };
    const finishIntro=(event)=>{
      if(event.type==='keydown' && !['ArrowDown','PageDown','End',' '].includes(event.key))return;
      finishingIntro=true;
    };
    window.addEventListener('scroll',scrolling,{passive:true});
    window.addEventListener('wheel',finishIntro,{passive:true});
    window.addEventListener('touchmove',finishIntro,{passive:true});
    window.addEventListener('keydown',finishIntro);
    id=requestAnimationFrame(tick);
    return ()=>{
      cancelAnimationFrame(id);
      window.removeEventListener('scroll',scrolling);
      window.removeEventListener('wheel',finishIntro);
      window.removeEventListener('touchmove',finishIntro);
      window.removeEventListener('keydown',finishIntro);
    };
  },[]);
  const choose=(i)=> {
    controls.current.elapsed=i*TEAM_DURATION;
    setTour({index:i});
    setAnnouncement(`${perspectives[i].name}. ${perspectives[i].detail}`);
  };
  const [displayedIndex,setDisplayedIndex]=useState(0);
  const [leaving,setLeaving]=useState(false);
  useEffect(()=>{
    if(paused){setDisplayedIndex(tour.index);setLeaving(false);return;}
    if(tour.index===displayedIndex){setLeaving(false);return;}
    setLeaving(true);
    const timer=setTimeout(()=>{setDisplayedIndex(tour.index);setLeaving(false);},220);
    return ()=>clearTimeout(timer);
  },[tour.index,paused,displayedIndex]);
  const p=perspectives[displayedIndex];
  return <section id="home" ref={root} className={`cinematic-hero ${centered?'is-centered':''} ${docked?'is-docked':''} ${introDone?'intro-complete':''} ${sweepReady?'sweep-ready':''}`}>
    {createPortal(<>
      <header ref={header} className="identity-header" style={{opacity:0,visibility:'hidden'}} inert aria-label="Paul Luiser Vasquez">
        <div className="header-identity">
          <a href="#home">Paul Luiser Vasquez</a>{' '}
          <span>IT Project Manager</span>
        </div>
        <a className="header-resume" href="/Paul-Luiser-Vasquez-Resume.pdf" download aria-label="Download résumé (PDF)" title="Download résumé">
          <span>Résumé</span><Download size={16} aria-hidden="true"/>
        </a>
      </header>
    </>,document.body)}
    <div className="hero-pin">
      <div className="hero-title">
        <div className="hero-identity" role="region" aria-label="Name, role, and methodologies"
          tabIndex={introDone && !centered ? 0 : undefined}>
          <strong className="hero-name">Paul Luiser Vasquez</strong>{' '}
          <span className="hero-role">IT Project Manager</span>{' '}
          <span className="hero-methodologies">Agile (Scrum) · Waterfall · Hybrid</span>
        </div>
        <h1>
          <span className="hero-lead">Speaking the language of</span>{' '}
          <span className="hero-sweep">
            <span className="hero-sweep-word">tech,</span>{' '}
            <span className="hero-sweep-word">business,</span>{' and '}
            <span className="hero-sweep-word">people</span>
          </span>
        </h1>
        <div className="hero-links"><a href="#work" className="button primary">Explore my work</a></div>
      </div>
      <div ref={orbSlot} className="hero-orb-space" aria-hidden="true"/>
      {!introDone && <div className="orbit-system quality-system" aria-hidden="true">
        {qualities.map((quality,i)=><span key={quality.name} data-orb-index={i} className="satellite"><span className="energy-pulse"/><span>{quality.name}</span></span>)}
      </div>}
      <h2 className="team-scene-heading" aria-hidden={!centered || docked}>How I bridge teams</h2>
      <div className="perspective-panel" inert={!centered||docked?true:undefined}>
      <div className="team-system" role="group" aria-label="Explore team perspectives" inert={!centered||docked?true:undefined}>
        {teams.map((team,i)=><button key={team.name} data-orb-index={qualities.length+i} className={`satellite team-badge ${i===tour.index?'active':''}`} onClick={()=>choose(i)} aria-pressed={i===tour.index} aria-controls="perspective-copy"><span>{team.name}</span></button>)}
      </div>
        <div className="perspective-stage">
          {perspectives.map(person=><div key={person.name} className="perspective-measure" aria-hidden="true"><h2>{person.title}</h2><p>{person.detail}</p></div>)}
          <div id="perspective-copy" key={p.name} className={`perspective-copy ${leaving?'leaving':''}`}><h2>{p.title}</h2><p>{p.detail}</p></div>
        </div>
        <div className="tour-controls">
          <div className="tour-dots" aria-label="Perspective progress">{perspectives.map((item,i)=><button key={item.name} aria-label={`Explore ${item.name}`} aria-current={i===tour.index?'step':undefined} onClick={()=>choose(i)}><span/></button>)}</div>
        </div>
      </div>
      {!centered&&<p className="hero-scroll-cue">Scroll for team perspectives</p>}
    </div>

    <span role="status" className="sr-only">{announcement}</span>
  </section>;
}
