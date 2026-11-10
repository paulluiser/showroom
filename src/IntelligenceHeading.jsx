import {useEffect,useRef,useState} from 'react';
import {useCharacterReveal} from './useCharacterReveal';
const first='Empowerment through practical use of';
const second='Artificial Intelligence';
const text=`${first}\n${second}`;
export default function IntelligenceHeading({reduced=false}) {
 const element=useRef(null),[visible,setVisible]=useState(false);
 const display=useCharacterReveal(text,visible,reduced);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>{
   setVisible(entry.isIntersecting&&entry.intersectionRatio>=.65);
  },{threshold:[0,.65],rootMargin:'-80px 0px -8% 0px'});
  observer.observe(element.current);
  return()=>observer.disconnect();
 },[]);
 const part=(value,offset,emphasis=false)=><span className={`resolved-part ${emphasis?'ai-heading-feature':''}`}><span className="character-measure">{value.replaceAll(' ','\u00a0')}</span><span className={`resolved-overlay ${emphasis?'ai-heading-emphasis':''}`}>{display.slice(offset,offset+value.length).replaceAll(' ','\u00a0')}</span></span>;
 return <h2 ref={element} className={`ai-heading ${display!==text?'is-decoding':''}`} aria-label={`${first} ${second}`}>
  <span className="ai-heading-line" aria-hidden="true">{part(first,0)}</span>
  <span className="ai-heading-line" aria-hidden="true">{part(second,first.length+1,true)}</span>
 </h2>;
}
