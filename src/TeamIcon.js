import * as THREE from 'three';
import { teamAccents } from './TeamOrb.js';
import { teams } from './teams.js';

function stroke(points) {
  const path = new THREE.Path();
  path.moveTo(...points[0]);
  for (const point of points.slice(1)) path.lineTo(...point);
  return path;
}

function roundedRect(x, y, width, height, radius, path = new THREE.Path()) {
  const right = x + width;
  const top = y + height;
  path.moveTo(x + radius, y);
  path.lineTo(right - radius, y);
  path.quadraticCurveTo(right, y, right, y + radius);
  path.lineTo(right, top - radius);
  path.quadraticCurveTo(right, top, right - radius, top);
  path.lineTo(x + radius, top);
  path.quadraticCurveTo(x, top, x, top - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  path.closePath();
  return path;
}

function circle(x, y, radius, path = new THREE.Path()) {
  path.absarc(x, y, radius, 0, Math.PI * 2, false);
  path.closePath();
  return path;
}

function briefcase(add) {
  const handle = stroke([[-.34, .45], [-.34, .57]]);
  handle.quadraticCurveTo(-.34, .76, -.18, .76);
  handle.lineTo(.18, .76);
  handle.quadraticCurveTo(.34, .76, .34, .57);
  handle.lineTo(.34, .45);
  add(handle, { radius: .085 });

  add(roundedRect(-.81, -.53, 1.62, 1.02, .19), { closed: true });
  const seam = stroke([[-.77, .1]]);
  seam.quadraticCurveTo(-.67, -.035, -.4, -.035);
  seam.lineTo(.4, -.035);
  seam.quadraticCurveTo(.67, -.035, .77, .1);
  add(seam, { radius: .065, z: .06 });
  add(roundedRect(-.13, -.16, .26, .24, .045), { radius: .061, closed: true, detail: true, z: .12 });
}

function penNib(add) {
  const nib = stroke([[0, -.81]]);
  nib.quadraticCurveTo(.13, -.43, .52, -.12);
  nib.quadraticCurveTo(.38, .12, .30, .56);
  nib.lineTo(-.30, .56);
  nib.quadraticCurveTo(-.38, .12, -.52, -.12);
  nib.quadraticCurveTo(-.13, -.43, 0, -.81);
  add(nib, { closed: true });
  add(roundedRect(-.34, .54, .68, .22, .08), { radius: .075, closed: true, detail: true });
  add(circle(0, -.02, .115), { radius: .049, closed: true, detail: true });
  add(stroke([[0, -.135], [0, -.72]]), { radius: .041, detail: true });
}

function code(add) {
  for (const direction of [-1, 1]) {
    const bracket = stroke([[direction * .40, .46], [direction * .78, .10]]);
    bracket.quadraticCurveTo(direction * .89, 0, direction * .78, -.10);
    bracket.lineTo(direction * .40, -.46);
    add(bracket, { radius: .112 });
  }
  add(stroke([[-.17, -.63], [.17, .63]]), { radius: .105, detail: true });
}

function shield(add) {
  const edge = stroke([[0, .78]]);
  edge.quadraticCurveTo(.33, .57, .66, .53);
  edge.lineTo(.61, -.06);
  edge.quadraticCurveTo(.55, -.54, 0, -.78);
  edge.quadraticCurveTo(-.55, -.54, -.61, -.06);
  edge.lineTo(-.66, .53);
  edge.quadraticCurveTo(-.33, .57, 0, .78);
  add(edge, { closed: true });

  const check = stroke([[-.34, .01], [-.16, -.17]]);
  check.quadraticCurveTo(-.10, -.23, -.04, -.17);
  check.lineTo(.35, .24);
  add(check, { radius: .091, detail: true, z: .06 });
}

function people(add) {
  function person(x, scale, z, detail) {
    const bottom = -.5;
    const shoulder = .42 * scale;
    const body = stroke([[x - shoulder, bottom]]);
    body.bezierCurveTo(x - shoulder, -.18, x - .25 * scale, .07, x, .07);
    body.bezierCurveTo(x + .25 * scale, .07, x + shoulder, -.18, x + shoulder, bottom);
    body.lineTo(x - shoulder, bottom);
    add(body, { radius: .076, closed: true, z, detail });
    add(circle(x, .40 * scale, .224 * scale), { radius: .079, closed: true, z, detail });
  }

  person(.42, .82, -.12, true);
  person(-.27, 1, .07, false);
}

const makeSymbols = [briefcase, penNib, code, shield, people];

export function createTeamIcon(index, orbMaterial) {
  const accent = new THREE.Color(teamAccents[index]);
  const face = orbMaterial.clone();
  face.depthWrite = false;
  face.uniforms.uBuild.value = 1;
  face.uniforms.uSolidShape.value = 1;
  face.uniforms.uWorkflowTint.value.set(accent.r, accent.g, accent.b);
  const detail = face.clone();

  const model = new THREE.Group();
  makeSymbols[index]((path, { detail: isDetail = false, z = 0, radius = .095, closed = false } = {}) => {
    const points = path.getPoints(8).map(point => new THREE.Vector3(point.x, point.y, z));
    if (closed && points[0].equals(points.at(-1))) points.pop();
    const curve = new THREE.CatmullRomCurve3(points, closed);
    const segments = Math.min(64, Math.max(12, points.length * 2));
    const radialSegments = 10;
    const geometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, closed);
    if (!closed) {
      // Cap each open filament using its existing endpoint rings.
      const indices = [...geometry.index.array];
      const end = segments * (radialSegments + 1);
      for (let i = 1; i < radialSegments - 1; i++) {
        indices.push(0, i, i + 1, end, end + i + 1, end + i);
      }
      geometry.setIndex(indices);
    }
    model.add(new THREE.Mesh(geometry, isDetail ? detail : face));
  });

  // Normalize the full silhouette to the radius used by the orbit's clearance rules.
  const bounds = new THREE.Box3().setFromObject(model);
  const scale = 2 / bounds.getSize(new THREE.Vector3()).length();
  model.scale.setScalar(scale);
  model.position.copy(bounds.getCenter(new THREE.Vector3())).multiplyScalar(-scale);

  const tilt = new THREE.Group();
  tilt.add(model);
  const group = new THREE.Group();
  group.name = teams[index].name;
  group.add(tilt);

  function animate(time, emphasis) {
    const focus = THREE.MathUtils.clamp((emphasis - .92) / .28, 0, 1);
    const phase = time * (.66 + index * .065) + index * 1.8;
    tilt.rotation.set(.08 + Math.sin(phase) * .14, Math.cos(phase * .82) * .26, (index === 1 ? -.28 : 0) + Math.sin(phase * .7) * .07);
    face.uniforms.uTime.value = detail.uniforms.uTime.value = time + index * .52;
    face.uniforms.uReveal.value = detail.uniforms.uReveal.value = .88 + focus * .12;
    face.uniforms.uWorkflowStrength.value = detail.uniforms.uWorkflowStrength.value = .22 + focus * .12;
    face.uniforms.uDetailLight.value = .26 + focus * .23;
    detail.uniforms.uDetailLight.value = .42 + focus * .2;
  }

  return { group, animate };
}
