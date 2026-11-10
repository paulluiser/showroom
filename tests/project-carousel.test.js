import test from 'node:test';
import assert from 'node:assert/strict';
import { carouselProjects, projectPosition, wrapProjectIndex } from '../src/projectDeck.js';

test('the project deck opens with inventory and loops in both directions', () => {
  assert.deepEqual(carouselProjects.map(project => project.art), ['enterprise', 'hris', 'streaming', 'operations']);
  assert.equal(wrapProjectIndex(4), 0);
  assert.equal(wrapProjectIndex(-1), 3);
  assert.deepEqual(carouselProjects.map((_, index) => projectPosition(index, 3)), ['next', 'rear', 'previous', 'front']);
});
