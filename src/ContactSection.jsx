import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import OrbStage from './OrbStage';
import './contact.css';

export default function ContactSection({ motion, signals, reduced, enabled }) {
  const host = useRef(null);
  const copiedTimer = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let frame, visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(host.current);
    const tick = () => {
      if (visible && enabled && !document.hidden) {
        const f = motion.current;
        if (f) {
          const progress = f.contactProgress ?? 0;
          host.current.dataset.contactPhase = reduced || progress === 1 ? 'settled' : 'arriving';
          host.current.style.setProperty('--contact-heading', f.contactHeading ?? 0);
          host.current.style.setProperty('--contact-body', f.contactBody ?? .55);
          host.current.style.setProperty('--contact-actions', f.contactActions ?? .75);
          host.current.style.setProperty('--contact-presence', progress);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [motion, signals, reduced, enabled]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText('paulluiser@gmail.com');
      signals.current.copyAt = performance.now();
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      location.href = 'mailto:paulluiser@gmail.com';
    }
  }

  return <section id="contact" ref={host} className="section contact contact--finale" aria-labelledby="contact-heading">
    <div className="contact-composition">
      <OrbStage id="contact-orb-stage" kind="contact"/>
      <div className="contact-copy">
        <h2 id="contact-heading">I’m ready for what’s next.</h2>
        <p>I’m open to IT Project Management and Product Manager/Owner opportunities.</p>
        <a className="contact-email" href="mailto:paulluiser@gmail.com"
          onPointerEnter={event => { if (event.pointerType === 'mouse') signals.current.hover = true; }}
          onPointerLeave={() => { signals.current.hover = false; }}
          onFocus={() => { signals.current.focus = true; }} onBlur={() => { signals.current.focus = false; }}>
          <span className="ai-heading-feature ai-heading-emphasis">paulluiser@gmail.com</span>
        </a>
        <div className="contact-actions">
          <button className="text-link" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy email'}{copied ? <Check size={15}/> : <Copy size={15}/>}</button>
          <a className="text-link" href="/Paul-Luiser-Vasquez-Resume.pdf" download>Download résumé <Download size={15}/></a>
        </div>
      </div>
    </div>
    <span role="status" className="sr-only">{copied ? 'Email address copied' : ''}</span>
    <a className="contact-back-top" href="#home" aria-label="Back to top" title="Back to top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>
    </a>

  </section>;
}
