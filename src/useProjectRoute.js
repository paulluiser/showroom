import { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { projectCaseForPath } from './projectCases';

export default function useProjectRoute(reduced) {
  const [path,setPath]=useState(location.pathname);
  const [transition,setTransition]=useState(null);
  const transitionRef=useRef(null),previousPath=useRef(path),restore=useRef(null),destination=useRef(null),returnPosition=useRef('work');
  const commit=useCallback(()=>{
    const target=destination.current;
    if(!projectCaseForPath(target??''))return;
    history.pushState({fromShowroom:true,showroomScrollY:returnPosition.current},'',target);
    setPath(target);
  },[]);
  const finish=useCallback(()=>{transitionRef.current=null;destination.current=null;setTransition(null);},[]);
  const explore=useCallback(event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const url=new URL(event.currentTarget.href,location.href);
    const study=url.origin===location.origin?projectCaseForPath(url.pathname):null;
    if(!study)return;
    event.preventDefault();if(transitionRef.current)return;
    destination.current=study.path;returnPosition.current=scrollY;
    history.replaceState({...history.state,showroomScrollY:scrollY},'',location.href);
    if(reduced){commit();return;}
    const link = event.currentTarget.getBoundingClientRect();
    const source = { x: link.right, y: link.top + link.height / 2, radius: 16, orbReveal: 0 };
    const transaction = { at: performance.now(), source, project: study.project.art };
    transitionRef.current=transaction;setTransition(transaction);
  },[commit,reduced]);
  const back=useCallback(event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if(history.state?.fromShowroom && !location.hash){history.back();return;}
    restore.current=history.state?.showroomScrollY??returnPosition.current;history.pushState({showroomScrollY:restore.current},'','/#work');setPath('/');
  },[]);
  useEffect(()=>{
    const pop=()=>{transitionRef.current=null;setTransition(null);restore.current=history.state?.showroomScrollY??'work';setPath(location.pathname);};
    window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);
  },[]);
  useLayoutEffect(()=>{
    document.documentElement.dataset.projectPage=String(path!=='/');
    if(path!=='/'){
      const anchor=location.hash?document.getElementById(location.hash.slice(1)):null;
      if(anchor)anchor.scrollIntoView({block:'start',behavior:'instant'});
      else window.scrollTo({top:0,behavior:'instant'});
    }
    else if(previousPath.current!=='/'){
      const stored=restore.current??history.state?.showroomScrollY;
      const y=typeof stored==='number'?stored:(document.getElementById('work')?.offsetTop??0);
      window.scrollTo({top:y,behavior:'instant'});
      requestAnimationFrame(()=>{
        const link=[...document.querySelectorAll('.logistics-explore')].find(node=>node.getClientRects().length && !node.closest('[inert]'));
        link?.focus({preventScroll:true});
      });
    }
    previousPath.current=path;
  },[path]);
  return {path,transition,transitionRef,busy:!!transition,explore,back,commit,finish};
}
