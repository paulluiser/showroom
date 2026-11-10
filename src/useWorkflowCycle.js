import { useEffect, useRef, useState } from 'react';
import { advanceWorkflow, workflowPulse, WORKFLOW_DURATION } from './workflowCycle';

export default function useWorkflowCycle(reduced) {
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const state = useRef({ index: 0, elapsed: 0, switchAge: 950 });
  const clock = useRef({ index: 0, progress: 0, pulse: 0 });
  const arrival = useRef(false);
  const host = useRef(null);
  const navigation = useRef(null);
  const options = useRef({ reduced, stopped });
  options.current = { reduced, stopped };

  useEffect(() => {
    const workspace = host.current;
    const controls = navigation.current;
    let frame, last = performance.now(), visible = false, tabsVisible = false;
    let motionRunning = false, wasArrived = false, entered = false;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === workspace) visible = entry.isIntersecting;
        else tabsVisible = entry.isIntersecting && entry.intersectionRatio >= .2;
      }
    }, { threshold: [0, .2] });
    observer.observe(workspace);
    observer.observe(controls);

    function tick(now) {
      const dt = Math.min(80, now - last);
      last = now;
      if (tabsVisible && !entered) {
        entered = true;
        if (!options.current.reduced) workspace.dataset.workflowEntered = 'true';
      }
      if (arrival.current && !wasArrived) {
        state.current = { index: state.current.index, elapsed: 0, switchAge: 950 };
      }
      wasArrived = arrival.current;
      const focused = workspace.contains(document.activeElement) && document.activeElement?.matches(':focus-visible');
      const runMotion = arrival.current && visible && !document.hidden && !options.current.reduced && !options.current.stopped;
      if (runMotion !== motionRunning) {
        motionRunning = runMotion;
        workspace.dataset.workflowMotion = String(runMotion);
      }
      // Keep the selected tab in place when someone scrolls past the timer to read the workflow.
      const held = !runMotion || !tabsVisible || focused;
      const previous = state.current.index;
      state.current = advanceWorkflow(state.current, dt, held);
      if (held && visible && !document.hidden) state.current.switchAge += dt;
      const current = state.current;
      clock.current = {
        index: current.index,
        progress: current.elapsed / WORKFLOW_DURATION,
        pulse: options.current.reduced ? 0 : workflowPulse(current.switchAge),
      };
      workspace.style.setProperty('--workflow-progress', clock.current.progress);
      if (current.index !== previous) setIndex(current.index);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  function choose(next) {
    state.current = { index: next, elapsed: 0, switchAge: 0 };
    clock.current = { index: next, progress: 0, pulse: 0 };
    setIndex(next);
  }

  return { index, choose, host, navigation, clock, arrival, stopped, toggle: () => setStopped(value => !value) };
}
