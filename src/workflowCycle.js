import { workflows } from './content.js';

export const WORKFLOW_DURATION=8000;
export const PROCESSING_DURATION = 2000;
const FORM_DURATION = 910;
const FINISH_DURATION = 1400;
const MANUAL_FINISH_RETURN = 980;
const MANUAL_FORM_RETURN = 560;
const LIQUIDATION_DURATION = 1330;
const FINISH_ENTERED = FORM_DURATION + FINISH_DURATION;
const FORM_EXITED = WORKFLOW_DURATION - 280;
const FINISH_EXITED = FORM_EXITED - LIQUIDATION_DURATION;

export function advanceWorkflow(state,dt,held=false) {
 if(held)return state;
 const total=state.elapsed+dt,steps=Math.floor(total/WORKFLOW_DURATION);
 return {index:(state.index+steps)%workflows.length,elapsed:total%WORKFLOW_DURATION,switchAge:steps?total%WORKFLOW_DURATION:state.switchAge+dt};
}

export function easeWorkflowMorph(amount) {
  const t = Math.min(1, Math.max(0, amount));
  return t * t * (3 - 2 * t);
}

export function advanceWorkflowMorph(state, { index, progress }, dt, reduced = false) {
  if (reduced) {
    Object.assign(state, { index, age: FINISH_ENTERED, form: 1, finish: 1, liquidation: 0 });
    return;
  }

  if (state.index !== index) {
    if (state.finish > 0) {
      state.finish = Math.max(0, state.finish - dt / MANUAL_FINISH_RETURN);
      state.age = FORM_DURATION + state.finish * FINISH_DURATION;
      return;
    }
    if (state.form > 0) {
      const isMelting = state.form === 1 || state.liquidation > 0;
      state.form = Math.max(0, state.form - dt / MANUAL_FORM_RETURN);
      state.liquidation = isMelting ? 1 - state.form : 0;
      state.age = state.form * FORM_DURATION;
      return;
    }
    state.index = index;
    state.processingAge = 0;
    state.age = 0;
    state.liquidation = 0;
    return;
  }

  if (state.age === 0 && !state.liquidation) {
    const remaining = PROCESSING_DURATION - (state.processingAge ?? 0);
    const held = Math.min(dt, remaining);
    state.processingAge = PROCESSING_DURATION - remaining + held;
    dt -= held;
  }
  const elapsed = progress * WORKFLOW_DURATION;
  const wasFormed = state.form === 1 || state.liquidation > 0;
  state.age = Math.min(FINISH_ENTERED, state.age + dt);
  state.form = Math.max(0, Math.min(1, state.age / FORM_DURATION, (FORM_EXITED - elapsed) / LIQUIDATION_DURATION));
  state.liquidation = wasFormed
    ? Math.max(0, Math.min(1, (elapsed - FINISH_EXITED) / LIQUIDATION_DURATION))
    : 0;
  state.finish = Math.max(0, Math.min(1, (state.age - FORM_DURATION) / FINISH_DURATION, (FINISH_EXITED - elapsed) / FINISH_DURATION));
}
export function workflowPulse(age) {
 if(age<0||age>=950)return 0;
 const t=age<100?age/100:(950-age)/850;
 return t*t*(3-2*t);
}
