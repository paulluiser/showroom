import test from 'node:test';
import assert from 'node:assert/strict';
import {appendTrailPoint,visibleTrailPoints,TRAIL_LIFETIME} from '../src/cursorTrailState.js';
test('trail points are bounded and disappear completely after their short lifetime',()=>{
 let points=[];
 for(let i=0;i<200;i++)points=appendTrailPoint(points,{x:i*3,y:10,time:i});
 assert.ok(points.length<=32);
 assert.equal(visibleTrailPoints(points,200+TRAIL_LIFETIME).length,0);
});
test('stationary pointer does not accumulate a bright spot',()=>{
 const points=appendTrailPoint([],{x:10,y:20,time:0});
 assert.equal(appendTrailPoint(points,{x:10,y:20,time:50}).length,1);
});
