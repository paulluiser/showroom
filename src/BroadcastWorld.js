import * as THREE from 'three';
import { createDiorama, makePeople, walk } from './diorama.js';

const monitorVertex = `
  varying vec2 screenUv;
  void main() {
    screenUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Original looping test footage. Each feed shifts between a skyline and a mountain landscape.
const monitorFragment = `
  uniform float uTime;
  uniform float uOffset;
  varying vec2 screenUv;

  void main() {
    vec2 uv = screenUv;
    float playhead = fract(uTime * .085 + uOffset);
    float cut = smoothstep(.43, .55, playhead) * (1.0 - smoothstep(.91, 1.0, playhead));
    vec2 frame = (uv - vec2(.06, .16)) / vec2(.88, .76);
    float inside = step(0.0, frame.x) * step(frame.x, 1.0) * step(0.0, frame.y) * step(frame.y, 1.0);
    float sun = 1.0 - smoothstep(.112, .125, length((frame - vec2(.72, .66)) * vec2(1.55, 1.0)));
    float ridge = .33 + sin(frame.x * 7.0 + playhead * 2.0) * .16 + sin(frame.x * 17.0) * .065;
    float tower = .19 + fract(sin(floor((frame.x + playhead * .055) * 15.0) * 17.3) * 41.0) * .34;
    vec3 sky = mix(vec3(.76, .26, .47), vec3(.14, .58, .73), cut);
    vec3 picture = mix(sky, vec3(.14, .14, .31), frame.y * .72);
    picture = mix(picture, vec3(1.0, .78, .58), sun * .8);
    picture = mix(picture, vec3(.08, .17, .33), step(frame.y, mix(tower, ridge, cut)));
    picture = mix(picture, vec3(.18, .38, .57), step(frame.y, .14) * .65);
    vec3 color = mix(vec3(.045, .068, .13), picture, inside);
    float track = step(.06, uv.x) * step(uv.x, .94) * step(.075, uv.y) * step(uv.y, .102);
    color += track * mix(vec3(.12, .19, .3), vec3(.29, .82, .89), step(uv.x, .06 + .88 * playhead));
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function createBroadcastWorld() {
  const world = createDiorama();
  const { group, material, mesh, box, finish } = world;
  const base = material(0x1a263b);
  const floor = material(0x435570);
  const slate = material(0x253147);
  const trim = material(0x7b8ba8);
  const consoleTop = material(0x596b88);
  const seat = material(0x635780);
  const glass = material(0x263e65);
  const cyan = material(0x6abfcb, { emissive: 0x225b76, emissiveIntensity: .75 });
  const magenta = material(0xbd77ac, { emissive: 0x743054, emissiveIntensity: .6 });
  const amber = material(0xe0ae76, { emissive: 0x935027, emissiveIntensity: .42 });
  box(base, 0, -.58, 0, 66, .42, 52);
  box(slate, 0, -.20, 0, 19.4, .32, 12.9);
  box(floor, 0, -.055, 0, 19.1, .11, 12.6);
  for (let x = -9; x <= 9; x++) box(slate, x, .004, 0, .018, .01, 12.5);
  for (let z = -6; z <= 6; z++) box(slate, 0, .004, z, 19.1, .01, .018);
  box(slate, 0, .14, -3.76, 17.7, .26, 3.8);
  box(trim, 0, .265, -1.94, 17.7, .05, .055);
  box(cyan, 0, .20, -1.90, 17.7, .027, .025);
  box(slate, 0, 2.1, -5.02, 17.5, 3.7, .58);
  box(trim, 0, 4.06, -4.78, 17.65, .17, .54);
  box(magenta, 0, 4.04, -4.49, 17.25, .04, .025);
  for (const x of [-8.8, 8.8]) box(trim, x, 2.16, -4.77, .21, 3.76, .68);

  const previews = [];
  const screenWall = new THREE.Group();
  group.add(screenWall);
  function monitor(x, y, z, width, height, offset, name) {
    box(slate, x, y, z - .07, width + .15, height + .15, .13);
    const surface = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOffset: { value: offset } },
      vertexShader: monitorVertex,
      fragmentShader: monitorFragment,
    });
    const screen = mesh(new THREE.PlaneGeometry(width, height), surface, x, y, z + .006, screenWall);
    screen.castShadow = screen.receiveShadow = false;
    if (name) screen.name = name;
    previews.push(surface);
  }
  monitor(0, 2.45, -4.67, 5.75, 2.83, .04, 'program-preview');
  for (const [x, offset] of [[-5.86, .25], [5.86, .64]]) {
    monitor(x, 2.8, -4.66, 4.55, 1.66, offset);
    monitor(x, 1.48, -4.66, 4.55, .74, offset + .18);
  }
  for (const x of [-5.85, 0, 5.85]) {
    box(trim, x, .76, -4.63, 1.56, .055, .038);
    box(magenta, x - .94, .76, -4.61, .16, .085, .07);
  }

  const person = makePeople(world);
  const operators = [-4.25, 0, 4.25].map((x, i) => {
    box(slate, x, .51, .06, 3.65, .97, 1.62);
    box(consoleTop, x, 1.015, .06, 3.8, .12, 1.76);
    box(cyan, x, .91, .957, 3.4, .04, .018);
    box(slate, x, 1.24, -.46, 2.5, .42, .15);
    box(glass, x, 1.25, -.372, 2.36, .32, .025);
    for (let column = 0; column < 10; column++) {
      const dx = -1.26 + column * .28;
      box(column % 3 ? cyan : magenta, x + dx, 1.087, .22, .135, .022, .135);
      box(column % 2 ? trim : amber, x + dx, 1.083, .52, .12, .016, .082);
    }
    box(seat, x, .49, 1.31, .68, .14, .59);
    box(seat, x, .82, 1.58, .68, .55, .12);
    box(slate, x, .23, 1.31, .085, .44, .085);
    box(slate, x, .06, 1.31, .55, .055, .48);
    const operator = person(`broadcast-operator-${i}`, i + 1);
    operator.root.position.set(x, -.13, 1.32);
    operator.root.rotation.y = Math.PI;
    operator.legs.forEach(({ hip, knee }) => {
      hip.rotation.x = -1.4;
      knee.rotation.x = 1.59;
    });
    return operator;
  });
  const supervisor = person('broadcast-supervisor', 0);
  box(slate, 0, -.22, .057, .093, .14, .035, supervisor.arms[1].elbow);

  const meters = [];
  for (const x of [-7.75, 7.2, 8.38]) {
    box(slate, x, 1.18, -.62, .98, 2.36, 1.37);
    box(glass, x, 1.17, .08, .82, 2.14, .036);
    for (let row = 0; row < 7; row++) {
      box(trim, x, .35 + row * .241, .106, .6, .022, .014);
      box(row % 3 ? cyan : magenta, x - .26, .44 + row * .241, .114, .085, .043, .025);
    }
    if (x < 0) continue;
    for (let column = 0; column < 4; column++) {
      const moving = new THREE.Group();
      moving.position.set(x - .23 + column * .154, 1.94, .114);
      moving.name = `audio-meter-${meters.length}`;
      group.add(moving);
      box(column < 2 ? cyan : magenta, 0, .135, 0, .061, .27, .026, moving);
      meters.push(moving);
    }
  }
  for (const x of [-8.35, 8.35]) {
    box(slate, x, .34, 3.78, 1.3, .68, 3.12);
    box(trim, x, .71, 3.78, 1.38, .074, 3.2);
    box(magenta, x, .69, 5.41, 1.17, .045, .025);
  }
  for (let i = 0; i < 13; i++) {
    box(trim, -7.8 + i * 1.3, .018, 4.78, .72, .022, .07);
  }

  return finish((time, light) => {
    base.color.set(light ? 0xc7d0e0 : 0x1a263b);
    floor.color.set(light ? 0x8f9bb2 : 0x435570);
    previews.forEach(surface => { surface.uniforms.uTime.value = time; });
    meters.forEach((meter, i) => {
      meter.scale.y = .42 + .32 * (1 + Math.sin(time * (5 + i * .27) + i * 1.68)) + .11 * Math.sin(time * 12 + i);
    });
    operators.forEach((operator, i) => {
      operator.head.rotation.y = .17 * Math.sin(time * 1.55 + i);
      operator.arms.forEach(({ shoulder, elbow }, side) => {
        shoulder.rotation.x = -.88 + .15 * Math.sin(time * (3.4 + i * 1.2) + side * 2);
        elbow.rotation.x = -.94 + .19 * Math.sin(time * (4.5 + i) + side * 2.4);
      });
    });
    const angle = time * .45;
    supervisor.root.position.x = 3.45 * Math.cos(angle);
    supervisor.root.position.z = 3.34 + .73 * Math.sin(angle);
    supervisor.root.rotation.y = Math.atan2(-3.45 * Math.sin(angle), .73 * Math.cos(angle));
    walk(supervisor, time * 7.4);
    supervisor.arms[1].shoulder.rotation.x = -.88;
    supervisor.arms[1].elbow.rotation.x = -1.22;
  });
}
