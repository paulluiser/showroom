import * as THREE from 'three';
import { createDiorama, makePeople, walk } from './diorama.js';

export function createOfficeWorld() {
  const world = createDiorama();
  const { material, mesh, box, finish } = world;
  const slate = material(0x263b50);
  const base = material(0x172a3e);
  const floor = material(0x526d81);
  const wall = material(0xc4d2d9);
  const oak = material(0xc1a086);
  const rug = material(0x3f7180);
  const green = material(0x448279);
  const violet = material(0x9188b3);
  const display = material(0x388fa2, { emissive: 0x21596e, emissiveIntensity: .6 });
  const warm = material(0xe0b17d);
  box(base, 0, -.57, 0, 65, .36, 52);
  box(slate, 0, -.21, 0, 19.8, .34, 13.9);
  box(floor, 0, -.055, 0, 19.5, .11, 13.6);
  for (let x = -9; x <= 9; x += 1) box(slate, x, .003, 0, .013, .009, 13.4);
  for (let z = -6; z <= 6; z += 1) box(slate, 0, .003, z, 19.4, .009, .013);
  box(rug, -4.5, .024, -3.5, 9.4, .04, 5.2);
  box(violet, 5.35, .024, -2.85, 7.65, .04, 5.6);
  box(rug, 4.15, .026, 4.6, 8.6, .04, 2.85);
  box(wall, 0, .32, -6.65, 19.5, .65, .17);
  box(wall, -9.6, .32, 0, .18, .65, 13.2);
  for (let x = -9.5; x <= 9.5; x += 1.58) box(wall, x, 1.45, -6.64, .09, 1.7, .12);
  box(wall, 0, 2.29, -6.64, 19.4, .09, .12);
  box(wall, -9.59, 1.47, -3.9, .12, 1.67, 5.55);
  box(slate, .82, .56, -3.8, .13, 1.12, 5.55);
  box(wall, .82, 1.14, -3.8, .16, .075, 5.58);

  function planter(x, z, scale = 1) {
    mesh(new THREE.CylinderGeometry(.36 * scale, .27 * scale, .45 * scale, 10), slate, x, .225 * scale, z);
    for (const [dx, dz, rise] of [[0, 0, .88], [-.2, .15, .68], [.22, -.12, .72]]) {
      const leaf = mesh(new THREE.IcosahedronGeometry(.25 * scale, 1), green, x + dx * scale, rise * scale, z + dz * scale);
      leaf.scale.y = 1.52;
    }
  }
  function chair(x, z, facing = 1) {
    box(slate, x, .27, z, .095, .47, .095);
    box(slate, x, .08, z, .51, .065, .48);
    box(violet, x, .49, z, .56, .12, .54);
    box(violet, x, .78, z - facing * .23, .55, .5, .09);
  }
  function desk(x, z) {
    box(oak, x, .91, z, 2.28, .105, 1.14);
    for (const dx of [-.94, .94]) box(slate, x + dx, .43, z, .08, .85, .94);
    box(slate, x, 1.02, z + .24, .34, .13, .25);
    box(slate, x, 1.32, z + .29, .94, .57, .09);
    box(display, x, 1.32, z + .234, .84, .46, .015);
    for (let i = 0; i < 3; i++) box(wall, x - .12 + i * .053, 1.2 + i * .055, z + .224, .27 - i * .04, .025, .012);
    box(slate, x, .976, z - .27, .53, .026, .18);
    box(wall, x + .67, .974, z - .22, .34, .025, .31);
    chair(x, z - .96);
  }
  for (const x of [-7.1, -4.35, -1.6]) desk(x, -3.65);
  for (const x of [-7.1, -4.35, -1.6]) box(slate, x, .46, -5.71, 1.58, .91, .49);

  box(oak, 5.05, .94, -2.85, 4.55, .13, 2.2);
  for (const x of [3.45, 6.65]) {
    box(slate, x, .45, -2.85, .13, .86, 1.45);
    chair(x, -4.28);
    chair(x, -1.42, -1);
    box(wall, x, 1.012, -2.45, .45, .025, .32);
  }
  box(slate, 7.15, 1.28, -5.62, 2.05, 1.58, .11);
  box(display, 7.15, 1.28, -5.55, 1.84, 1.38, .03);
  for (let i = 0; i < 5; i++) box(wall, 6.48 + i * .3, .83 + i * .075, -5.526, .13, .21 + i * .15, .018);
  box(wall, -6.35, .55, 4.7, 3.88, 1.1, 1.2);
  box(oak, -6.35, 1.12, 4.7, 4, .085, 1.3);
  box(display, -6.55, 1.33, 4.96, .9, .38, .08);
  box(violet, 5.15, .28, 5.45, 4.4, .54, .92);
  box(violet, 5.15, .62, 5.82, 4.4, .66, .23);
  box(oak, 5.02, .46, 4.16, 1.72, .12, .85);
  box(slate, 5.02, .22, 4.16, 1.2, .38, .58);
  for (const [x, z] of [[-8.65, -5.5], [-8.8, 2.9], [-3.68, 5.35], [8.6, .48], [8.4, 5.42], [1.5, -5.62]]) planter(x, z);
  for (const z of [-7.75, 7.65]) for (let x = -18; x <= 18; x += 2.5) {
    box(floor, x, -.337, z, 2.34, .08, 1.54);
  }
  for (const x of [-14, 13.5, 17.5]) for (const z of [-8, -3, 6.9]) planter(x, z, 1.45);

  const person = makePeople(world);
  const analyst = person('office-analyst', 0);
  const teammate = person('office-reviewer', 1);
  const facilitator = person('office-facilitator', 2);
  const guest = person('office-guest', 4);
  const walker = person('office-walker', 3);
  const reception = person('office-reception', 4);
  function sit(actor, x, z, turn = 0) {
    actor.root.position.set(x, -.14, z);
    actor.root.rotation.y = turn;
    for (const { hip, knee } of actor.legs) {
      hip.rotation.x = -1.43;
      knee.rotation.x = 1.57;
    }
  }
  sit(analyst, -4.35, -4.59);
  sit(teammate, -1.6, -4.59);
  facilitator.root.position.set(6.95, 0, -4.85);
  facilitator.root.rotation.y = -.48;
  guest.root.position.set(3.85, 0, -.89);
  guest.root.rotation.y = 2.75;
  reception.root.position.set(-6.5, 0, 5.62);
  reception.root.rotation.y = Math.PI;
  box(warm, .08, -.24, .12, .23, .028, .34, walker.arms[1].elbow);

  return finish((time, light) => {
    base.color.set(light ? 0xb7c9d6 : 0x172a3e);
    floor.color.set(light ? 0xa9b8c1 : 0x526d81);
    [analyst, teammate].forEach((actor, i) => {
      actor.arms.forEach(({ shoulder, elbow }, side) => {
        shoulder.rotation.x = -.76 + .055 * Math.sin(time * (i ? 5.8 : 12.8) + side * 2);
        elbow.rotation.x = -.88 + .09 * Math.sin(time * (i ? 4.8 : 10.4) + side * 2.6);
      });
      actor.head.rotation.x = .12 + .06 * Math.sin(time * 1.4 + i);
    });
    facilitator.arms[0].shoulder.rotation.set(-.75 - .67 * Math.sin(time * 1.45), 0, -.34);
    facilitator.arms[0].elbow.rotation.x = -.5;
    facilitator.head.rotation.y = .28 * Math.sin(time * 1.28);
    guest.arms[1].shoulder.rotation.x = -.27 + .24 * Math.sin(time * 2.2 + 1);
    guest.head.rotation.x = .2 * Math.sin(time * 1.7);
    reception.arms[0].shoulder.rotation.x = -.73 + .22 * Math.sin(time * 3.7);
    reception.arms[0].elbow.rotation.x = -1.18;
    reception.head.rotation.y = .17 * Math.sin(time * 1.45);
    const lap = time * .46;
    walker.root.position.x = -.55 + 3.63 * Math.cos(lap);
    walker.root.position.z = 2.61 + 1.35 * Math.sin(lap);
    walker.root.rotation.y = Math.atan2(-3.63 * Math.sin(lap), 1.35 * Math.cos(lap));
    walk(walker, time * 7.6);
    walker.arms[1].shoulder.rotation.x = -.58;
    walker.arms[1].elbow.rotation.x = -.82;
  });
}
