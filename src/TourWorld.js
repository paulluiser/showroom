import * as THREE from 'three';
import { createDiorama, makePeople, walk } from './diorama.js';

export function createTourWorld() {
  const world = createDiorama();
  const { group, material, mesh, box, finish } = world;
  const lake = material(0x26677d, { roughness: .36, metalness: .16 });
  const ripples = material(0x569ca9, { roughness: .49 });
  const shore = material(0x496c69);
  const meadow = material(0x668875);
  const trail = material(0xb69e83);
  const stone = material(0x617787);
  const peak = material(0x9aafb6);
  const pine = material(0x326b63);
  const spruce = material(0x4b8277);
  const timber = material(0x8e6b60);
  const cedar = material(0xc79a74);
  const beacon = material(0x84d9ce, { emissive: 0x296658, emissiveIntensity: .62 });
  box(lake, 0, -.45, 0, 65, .21, 58);

  function bank(surface, points, depth, y) {
    const shape = new THREE.Shape();
    points.forEach(([x, z], index) => index ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
    shape.closePath();
    const land = mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), surface, 0, y, 0);
    land.rotation.x = -Math.PI / 2;
  }
  const west = [[-31, -27], [-3, -27], [-2, -8], [-1.45, -5], [-2, -2], [-2.5, 2], [-1.65, 5], [-3, 9], [-2.5, 28], [-31, 28]];
  const east = [[2.4, -28], [31, -28], [31, 28], [4, 28], [3, 9], [2.4, 6], [2.65, 1.3], [1.9, -2.2], [2.4, -5.7], [2.75, -8.5]];
  bank(shore, west, .57, -.59);
  bank(meadow, east, .57, -.59);
  for (const [x, z, radius, height] of [
    [-10, -8, 3.8, 4.4], [-6.1, -10.1, 3.25, 5.1], [-3.2, -12.2, 2.8, 3.6],
    [5.7, -9.8, 3.2, 3.8], [9.1, -9.6, 3.8, 5.7], [12.2, -11.5, 4.1, 4.6],
    [-13, 4.2, 3.8, 2.4], [12, 4.8, 3.25, 2.4],
  ]) {
    const mountain = mesh(new THREE.ConeGeometry(radius, height, 6), stone, x, height / 2 - .17, z);
    mountain.rotation.y = z * .33;
    if (height > 3.5) {
      const cap = mesh(new THREE.ConeGeometry(radius * .25, height * .25, 6), peak, x, height * .875 - .16, z);
      cap.rotation.y = mountain.rotation.y;
    }
  }

  function tree(x, z, scale, surface) {
    mesh(new THREE.CylinderGeometry(.06 * scale, .09 * scale, .7 * scale, 6), timber, x, .32 * scale, z);
    for (let layer = 0; layer < 3; layer++) {
      mesh(new THREE.ConeGeometry((.55 - layer * .108) * scale, .88 * scale, 7), surface, x, (.73 + layer * .35) * scale, z);
    }
  }
  const trees = [
    [-9, -5.9], [-8.1, -4.6], [-10.1, -3.7], [-7.1, -5.6], [-5.5, -6.6], [-4.3, -5.6],
    [-9.1, .3], [-8.5, 2.1], [-7.9, 4.2], [-7, 5.55], [-5.6, 5.4], [-4, 5.8],
    [3.7, -6.6], [4.7, -5.9], [6.6, -5.6], [7.8, -4.35], [9, -3.4], [10.2, -1.8],
    [10.5, .4], [9.6, 2.9], [8.2, 5.4], [6.7, 5.65], [5.05, 4.5], [4.55, 6.75],
    [-11.8, -6.7], [-12.5, -3.4], [-11.25, 1.9], [-11, 5.5], [12.8, -5.5], [13.3, -1.5], [12.7, 7.2],
  ];
  trees.forEach(([x, z], i) => tree(x, z, .7 + (i * 7 % 11) * .065, i % 3 ? pine : spruce));
  for (const [x, z] of [[-2.2, -7], [-2.8, 3.2], [-2.4, 6.1], [2.7, 3.45], [3.25, -2.3], [3.7, 6.4], [-7.3, 3.75]]) {
    const rock = mesh(new THREE.DodecahedronGeometry(.5, 0), stone, x, .12, z);
    rock.scale.set(1.5, .72, .88);
    rock.rotation.y = x * .7;
  }

  const route = new THREE.CatmullRomCurve3([
    [-5.45, 2.6], [-3.7, 1.3], [-2.45, 1.15], [2.75, 1.15], [4.75, 1.2],
    [6.45, -.65], [6.15, -3], [4.1, -4.45], [2.55, -4.5], [-2.2, -4.5],
    [-4.45, -3.95], [-6.65, -1.8], [-7.02, .5],
  ].map(([x, z]) => new THREE.Vector3(x, .12, z)), true, 'catmullrom', .22);
  const vertices = [];
  const edges = t => {
    const point = route.getPointAt(t);
    const tangent = route.getTangentAt(t);
    return [-1, 1].map(side => [point.x - tangent.z * side * .45, .019, point.z + tangent.x * side * .45]);
  };
  for (let i = 0; i < 108; i++) {
    const [a, b] = edges(i / 108);
    const [c, d] = edges((i + 1) / 108);
    vertices.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
  const pathGeometry = new THREE.BufferGeometry();
  pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  pathGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(vertices.length / 3 * 2), 2));
  pathGeometry.computeVertexNormals();
  mesh(pathGeometry, trail, 0, 0, 0);
  for (const [z, start, end] of [[1.15, -2.7, 2.85], [-4.5, -2.3, 2.45]]) {
    for (let x = start; x <= end; x += .25) box(cedar, x, .042, z, .235, .12, 1.46);
    for (const side of [-1, 1]) {
      for (let x = start; x <= end; x += .96) box(timber, x, .23, z + side * .73, .07, .58, .075);
      box(timber, (start + end) / 2, .46, z + side * .73, end - start, .075, .075);
    }
  }
  box(timber, 7.6, .14, 2.48, 2.9, .3, 1.9);
  for (let x = 6.3; x < 9; x += .19) box(cedar, x, .302, 2.48, .17, .05, 1.8);
  for (const x of [6.28, 7.55, 8.88]) box(timber, x, .51, 3.33, .085, .55, .085);
  box(timber, 7.58, .75, 3.33, 2.66, .07, .085);
  for (const [x, z] of [[-4.5, 2.68], [-6.03, -2.82], [4.48, -3.94], [6.7, .68]]) {
    box(timber, x, .38, z, .075, .76, .085);
    box(beacon, x, .69, z, .34, .17, .08);
  }
  const waterDetail = new THREE.Group();
  group.add(waterDetail);
  for (let i = 0; i < 16; i++) {
    box(ripples, -.79 + (i * 7 % 17) * .115, -.335, -9.1 + i * 1.18, .31 + (i % 4) * .29, .013, .042, waterDetail);
  }
  const person = makePeople(world);
  const hikers = Array.from({ length: 4 }, (_, index) => person(`tourist-${index}`, index, true));
  const tangent = new THREE.Vector3();
  return finish((time, light) => {
    lake.color.set(light ? 0x5197a9 : 0x26677d);
    meadow.color.set(light ? 0x7d9b85 : 0x668875);
    waterDetail.position.x = .26 * Math.sin(time * 1.15);
    hikers.forEach((hiker, index) => {
      const distance = (time / 48 + .14 - index * .034 + 1) % 1;
      route.getPointAt(distance, hiker.root.position);
      route.getTangentAt(distance, tangent);
      hiker.root.rotation.y = Math.atan2(tangent.x, tangent.z);
      walk(hiker, (time / 48 * 55 + index * .43) * Math.PI * 2, .12);
      hiker.head.rotation.y = .16 * Math.sin(time * 1.4 + index * 2);
    });
  });
}
