import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTeamIcon } from '../src/TeamIcon.js';
import { teams } from '../src/teams.js';

const orbMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uBuild: { value: 0 }, uTime: { value: 0 }, uSolidShape: { value: 0 },
    uWorkflowTint: { value: new THREE.Vector3() }, uWorkflowStrength: { value: 0 },
    uReveal: { value: 1 }, uDetailLight: { value: 0 },
  },
});

test('each subject has 3D filaments within the existing orbit clearance radius', () => {
  const point = new THREE.Vector3();
  for (const [index, team] of teams.entries()) {
    const icon = createTeamIcon(index, orbMaterial);
    assert.equal(icon.group.name, team.name);
    icon.animate(2.3, 1.2);
    icon.group.updateMatrixWorld(true);
    let parts = 0;
    icon.group.traverse(object => {
      if (!object.isMesh) return;
      parts++;
      assert.equal(object.geometry.type, 'TubeGeometry');
      const positions = object.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
        assert.ok(point.length() <= 1.001, team.name);
      }
    });
    assert.ok(parts >= 2);
  }
});

test('the spotlight brightens the icon and its depth changes as it tilts', () => {
  for (const [index] of teams.entries()) {
    const icon = createTeamIcon(index, orbMaterial);
    const tilt = icon.group.children[0];
    const face = tilt.children[0].children[0].material;
    icon.animate(0, .92);
    const restingAngle = tilt.rotation.y;
    const restingGlow = face.uniforms.uDetailLight.value;
    icon.animate(1.3, 1.2);
    assert.notEqual(tilt.rotation.y, restingAngle);
    assert.ok(face.uniforms.uDetailLight.value > restingGlow);
    assert.equal(face.fragmentShader, orbMaterial.fragmentShader);
    assert.equal(face.uniforms.uSolidShape.value, 1);
    assert.equal(orbMaterial.uniforms.uSolidShape.value, 0);
  }
});
