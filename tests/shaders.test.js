import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// GLSL ES 3.00 reserves these identifiers even when a JavaScript build accepts them.
const reserved=new Set('patch sample subroutine common partition active asm class union enum typedef template this resource goto inline noinline public static extern external interface long short double half fixed unsigned superp input output filter sizeof cast namespace using row_major'.split(' '));
test('custom shader declarations avoid GLSL ES reserved identifiers',()=>{
 const source=['Scene.jsx','TeamOrb.js'].map(file=>readFileSync(new URL(`../src/${file}`,import.meta.url),'utf8')).join('\n');
 const shaders=[...source.matchAll(/(?:vertexShader|fragmentShader)\s*:\s*`([\s\S]*?)`/g)];
 assert.ok(shaders.length>=6,'Inspect all custom vertex and fragment shaders');
 for(const [,shader] of shaders){
  for(const [,name] of shader.matchAll(/\b(?:float|int|bool|vec[234]|mat[234]|sampler2D)\s+(\w+)/g)){
   assert.equal(reserved.has(name),false,`Reserved shader identifier: ${name}`);
  }
 }
});
