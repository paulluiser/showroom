import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCharacters} from '../src/textMotion.js';
test('decoding preserves layout whitespace and resolves to exact requested copy',()=>{
 const text='Empowerment through practical use of\nArtificial Intelligence';
 const first=resolveCharacters(text,0,1),half=resolveCharacters(text,.5,9);
 assert.equal(first.length,text.length);
 for(let i=0;i<text.length;i++)if(/\s/.test(text[i]))assert.equal(first[i],text[i]);
 assert.notEqual(first,text);assert.equal(half.slice(0,12),text.slice(0,12));
 assert.equal(resolveCharacters(text,1,25),text);
});
