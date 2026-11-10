import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, ShaderLib, Vector3 } from 'three';
import { animateWorkflowIdle, createWorkflowObjects } from '../src/WorkflowObjects.js';

test('liquid and realistic finishes use one surface and the same object-space coordinates', () => {
  const uniforms = {
    uObjectReveal: { value: 1 },
    uObjectFinish: { value: 0 },
    uTime: { value: 0 },
    uSpeech: { value: 0 },
    uWorkflowTint: { value: null },
    uWorkflowStrength: { value: 0 },
  };
  for (const model of createWorkflowObjects(uniforms)) {
    model.traverse(mesh => {
      if (!mesh.isMesh) return;
      const shader = {
        vertexShader: ShaderLib.standard.vertexShader,
        fragmentShader: ShaderLib.standard.fragmentShader,
        uniforms: {},
      };
      mesh.material.onBeforeCompile(shader);
      assert.equal(shader.uniforms.uObjectReveal, uniforms.uObjectReveal);
      assert.equal(shader.uniforms.uObjectFinish, uniforms.uObjectFinish);
      assert.equal(mesh.geometry.attributes.workflowPosition.count, mesh.geometry.attributes.position.count);
      assert.match(shader.fragmentShader, /mix\(liquid, gl_FragColor\.rgb, uObjectFinish\)/);
      const discardLines = shader.fragmentShader.match(/[^\n]*\bdiscard;[^\n]*/g);
      assert.equal(discardLines.length, 1);
      assert.match(discardLines[0], /uObjectReveal/);
    });
  }
});

test('finished objects play their own action and return to their resting pose', () => {
  const [bulb, hammer, gear, book, mark] = createWorkflowObjects({});
  const filament = bulb.children.find(part => part.material.emissive.getHex() === 0xffdb32).material;
  bulb.animate(0, 0, false);
  assert.equal(filament.emissiveIntensity, 0);
  bulb.animate(500, 1, false);
  assert.ok(filament.emissiveIntensity > 1);
  assert.ok(Math.abs(bulb.rotation.z) > .04);
  bulb.animate(500, 0, false);
  assert.equal(filament.emissiveIntensity, 0);

  const page = book.children.find(part => part.isGroup);
  book.animate(800, 1, false);
  assert.ok(page.rotation.y < -.5 && page.rotation.y > -Math.PI);
  book.animate(1650, 1, false);
  assert.equal(page.rotation.y, -Math.PI);
  book.animate(800, 1, true);
  assert.ok(Math.abs(page.rotation.y) < 1e-6);

  const moving = [[hammer, hammer, 'z'], [gear, gear, 'z'], [mark, mark, 'z']];
  for (const [model, part, axis] of moving) {
    const rest = part.rotation[axis];
    model.animate(550, 1, false);
    assert.ok(Math.abs(part.rotation[axis] - rest) > .05);
    model.animate(1300, 1, false);
    assert.ok(Math.abs(Math.sin((part.rotation[axis] - rest) / 2)) < 1e-6);
    model.animate(500, 1, true);
    assert.ok(Math.abs(part.rotation[axis] - rest) < 1e-6);
  }
});

test('finished objects keep moving after their action and stop in the liquid or reduced-motion state', () => {
  const stage = new Group();
  animateWorkflowIdle(stage, 3, 1, false);
  const pose = stage.position.y;
  animateWorkflowIdle(stage, 4, 1, false);
  assert.ok(Math.abs(stage.position.y - pose) > .01);
  animateWorkflowIdle(stage, 3.5, 0, false);
  assert.ok(stage.position.length() === 0 && Math.hypot(stage.rotation.x, stage.rotation.y, stage.rotation.z) === 0);
  animateWorkflowIdle(stage, 3.5, 1, true);
  assert.ok(stage.position.length() === 0 && Math.hypot(stage.rotation.x, stage.rotation.y, stage.rotation.z) === 0);
});

test('the liquid deformation has enough vertices across the flat faces of each object', () => {
  const start = new Vector3();
  const end = new Vector3();
  for (const model of createWorkflowObjects({})) {
    model.traverse(part => {
      if (!part.isMesh) return;
      const { index, attributes: { position } } = part.geometry;
      for (let face = 0; face < (index?.count ?? position.count); face += 3) {
        for (let edge = 0; edge < 3; edge++) {
          const a = face + edge;
          const b = face + (edge + 1) % 3;
          start.fromBufferAttribute(position, index ? index.getX(a) : a);
          end.fromBufferAttribute(position, index ? index.getX(b) : b);
          assert.ok(start.distanceToSquared(end) < .32 ** 2);
        }
      }
    });
  }
});
