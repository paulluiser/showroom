import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceWorkflow,advanceWorkflowMorph,workflowPulse,WORKFLOW_DURATION,PROCESSING_DURATION} from '../src/workflowCycle.js';
test('workflow clock loops all five tabs and retains timing through long frames',()=>{
 const start={index:0,elapsed:0,switchAge:950};
 assert.equal(advanceWorkflow(start,WORKFLOW_DURATION-1).index,0);
 assert.equal(advanceWorkflow(start,WORKFLOW_DURATION).index,1);
 assert.equal(advanceWorkflow(start,WORKFLOW_DURATION*2).index,2);
 assert.equal(advanceWorkflow(start,WORKFLOW_DURATION*3).index,3);
 assert.equal(advanceWorkflow(start,WORKFLOW_DURATION*4).index,4);
 assert.equal(advanceWorkflow(start,WORKFLOW_DURATION*5).index,0);
 assert.equal(advanceWorkflow(start,WORKFLOW_DURATION+500).elapsed,500);
 assert.equal(advanceWorkflow(start,500,true),start);
});
test('each eight-second tab holds the round processing state before morphing and returns to the orb',()=>{
 const morph={index:0,age:0,form:0,finish:0};
 let clock={index:0,elapsed:0,switchAge:950};
 function advance(ms) {
   clock=advanceWorkflow(clock,ms);
   advanceWorkflowMorph(morph,{index:clock.index,progress:clock.elapsed/WORKFLOW_DURATION},ms);
   return [morph.index,morph.form,morph.finish,morph.liquidation];
 }
 assert.deepEqual(advance(PROCESSING_DURATION),[0,0,0,0]);
 assert.deepEqual(advance(910),[0,1,0,0]);
 assert.deepEqual(advance(700),[0,1,.5,0]);
 assert.deepEqual(advance(700),[0,1,1,0]);
 assert.deepEqual(advance(WORKFLOW_DURATION - PROCESSING_DURATION - 5320),[0,1,1,0]);
 assert.deepEqual(advance(700),[0,1,.5,0]);
 assert.deepEqual(advance(700),[0,1,0,0]);
 assert.deepEqual(advance(665),[0,.5,0,.5]);
 assert.deepEqual(advance(665),[0,0,0,1]);
 assert.deepEqual(advance(280),[1,0,0,0]);
});
test('a manual tab change returns to the orb before forming the latest selected object',()=>{
 const morph={index:0,age:2310,form:1,finish:1};
 advanceWorkflowMorph(morph,{index:1,progress:0},490);
 assert.deepEqual([morph.index,morph.form,morph.finish],[0,1,.5]);
 advanceWorkflowMorph(morph,{index:1,progress:0},490);
 assert.deepEqual([morph.index,morph.form,morph.finish],[0,1,0]);
 advanceWorkflowMorph(morph,{index:2,progress:0},280);
 assert.deepEqual([morph.index,morph.form,morph.finish,morph.liquidation],[0,.5,0,.5]);
 advanceWorkflowMorph(morph,{index:2,progress:0},280);
 assert.deepEqual([morph.index,morph.form,morph.finish],[0,0,0]);
 advanceWorkflowMorph(morph,{index:2,progress:0},455);
 assert.deepEqual([morph.index,morph.form,morph.finish],[2,0,0]);
 advanceWorkflowMorph(morph,{index:2,progress:0},PROCESSING_DURATION + 455);
 assert.deepEqual([morph.index,morph.form,morph.finish],[2,.5,0]);
 advanceWorkflowMorph(morph,{index:4,progress:0},0,true);
 assert.deepEqual([morph.index,morph.form,morph.finish],[4,1,1]);
});
test('tab transition pulse eases in quickly and settles completely',()=>{
 assert.equal(workflowPulse(0),0);assert.equal(workflowPulse(100),1);
 assert.ok(workflowPulse(500)>0);assert.equal(workflowPulse(950),0);
});
