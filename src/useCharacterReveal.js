import { useEffect, useState } from 'react';
import { resolveCharacters } from './textMotion';

export function useCharacterReveal(text, active, reduced) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (reduced || !active) {
      setDisplay(text);
      return;
    }
    let frame;
    let start;
    let lastStep = -1;
    const animate = now => {
      start ??= now;
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / 1350);
      const step = Math.floor(elapsed / 55);
      if (progress === 1) {
        setDisplay(text);
        return;
      }
      if (step !== lastStep) {
        lastStep = step;
        setDisplay(resolveCharacters(text, progress, step));
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [text, active, reduced]);
  return active && !reduced ? display : text;
}
