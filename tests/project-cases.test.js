import test from 'node:test';
import assert from 'node:assert/strict';
import { carouselProjects } from '../src/projectDeck.js';
import { projectCases, projectCaseForArt, projectCaseForPath } from '../src/projectCases.js';
import { restingOrbFrame } from '../src/projectMagic.js';

test('every gallery project has one unique, independently addressable case study', () => {
  assert.equal(projectCases.length, carouselProjects.length);
  assert.equal(new Set(projectCases.map(study => study.path)).size, carouselProjects.length);
  for (const project of carouselProjects) {
    const study = projectCaseForArt(project.art);
    assert.equal(study.project, project);
    assert.equal(projectCaseForPath(study.path), study);
    assert.equal(projectCaseForPath(`${study.path}/`), study);
    assert.ok(study.title.length && study.intro && study.challenge.body && study.approach.length && study.outcome.body);
  }
  assert.equal(projectCaseForPath('/projects/missing'), undefined);
});
test('case outcomes distinguish inventory UAT readiness from the confirmed deployments', () => {
  assert.match(projectCaseForArt('enterprise').outcome.title, /Ready for UAT/);
  assert.match(projectCaseForArt('hris').outcome.body, /multinational companies around the Philippines/);
  assert.match(projectCaseForArt('streaming').outcome.title, /120,000\+ subscribers/);
  assert.match(projectCaseForArt('operations').outcome.body, /now live and deployed/);
  assert.equal(projectCaseForArt('hris').project.company, '');
  assert.equal(projectCaseForArt('hris').project.methodology, undefined);
});
test('each case keeps the shared orb and its own project identity', () => {
  for (const study of projectCases) {
    const frame = restingOrbFrame({x:100,y:100,radius:30,project:study.project.art});
    assert.equal(frame.project, study.project.art);
    assert.equal(frame.orbReveal, 1);
    assert.deepEqual(frame.satellites, []);
  }
});
