import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
test('site stylesheet contains valid CSS rather than misplaced component source',()=>{
 const css=['style.css','chapters.css','workflow.css'].map(file=>readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');
 assert.doesNotThrow(()=>postcss.parse(css));
 assert.ok(!/import\s+(?:React|\{)|export default|<div|<section/.test(css));
});
