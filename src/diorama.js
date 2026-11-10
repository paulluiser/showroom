import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function createDiorama() {
  const group = new THREE.Group();
  const batches = new Map();
  const materials = new Set();
  const geometries = new Set();
  const material = (color, settings) => {
    const surface = new THREE.MeshStandardMaterial({ color, roughness: .76, ...settings });
    materials.add(surface);
    return surface;
  };
  function mesh(geometry, surface, x, y, z, parent = group) {
    materials.add(surface);
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    if (parent === group) {
      if (!batches.has(surface)) batches.set(surface, []);
      batches.get(surface).push(object);
    }
    return object;
  }
  function box(surface, x, y, z, width, height, depth, parent) {
    return mesh(new THREE.BoxGeometry(width, height, depth), surface, x, y, z, parent);
  }
  function finish(update) {
    for (const [surface, objects] of batches) {
      const parts = objects.map(object => {
        object.updateMatrix();
        object.removeFromParent();
        geometries.delete(object.geometry);
        const part = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
        object.geometry.dispose();
        return part.applyMatrix4(object.matrix);
      });
      const geometry = mergeGeometries(parts);
      parts.forEach(part => part.dispose());
      geometries.add(geometry);
      const combined = new THREE.Mesh(geometry, surface);
      combined.castShadow = combined.receiveShadow = true;
      group.add(combined);
    }
    return {
      group,
      update,
      dispose() {
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(surface => surface.dispose());
      },
    };
  }
  return { group, material, mesh, box, finish };
}

export function makePeople(world) {
  const { group, material, mesh, box } = world;
  const trousers = material(0x25394f);
  const shoes = material(0x121f33);
  const hair = material(0x293346);
  const skin = [0xe5b498, 0xb17c5f, 0x885d51].map(color => material(color));
  const shirts = [0x4aa2a5, 0xbb9bcc, 0xe1aa6c, 0x7799c7, 0xd68c9f].map(color => material(color));
  const pack = material(0x3f5974);
  const sphere = new THREE.SphereGeometry(1, 10, 7);

  return function person(name, style, hiking = false) {
    const root = new THREE.Group();
    root.name = name;
    group.add(root);
    const shirt = shirts[style % shirts.length];
    const tone = skin[style % skin.length];
    const oval = (surface, x, y, z, w, h, d, parent) => {
      const model = mesh(sphere, surface, x, y, z, parent);
      model.scale.set(w, h, d);
      return model;
    };
    oval(shirt, 0, .89, 0, .235, .27, .14, root);
    oval(trousers, 0, .67, 0, .19, .105, .13, root);
    const head = new THREE.Group();
    head.position.y = 1.24;
    root.add(head);
    oval(tone, 0, 0, 0, .132, .159, .128, head);
    oval(hiking ? shirt : hair, 0, .08, -.026, .137, .107, .13, head);
    oval(tone, 0, -.006, .12, .039, .036, .038, head);
    if (hiking) {
      box(shirt, 0, .084, .094, .24, .027, .17, head);
      oval(pack, 0, .89, -.18, .19, .238, .112, root);
    }
    const pivot = (parent, x, y, z) => {
      const joint = new THREE.Group();
      joint.position.set(x, y, z);
      parent.add(joint);
      return joint;
    };
    const arms = [-1, 1].map(side => {
      const shoulder = pivot(root, side * .204, 1.045, 0);
      oval(shirt, 0, -.105, 0, .076, .15, .077, shoulder);
      const elbow = pivot(shoulder, 0, -.21, 0);
      oval(tone, 0, -.09, 0, .053, .13, .052, elbow);
      return { shoulder, elbow };
    });
    const legs = [-1, 1].map(side => {
      const hip = pivot(root, side * .104, .66, 0);
      oval(trousers, 0, -.15, 0, .079, .19, .084, hip);
      const knee = pivot(hip, 0, -.31, 0);
      oval(trousers, 0, -.124, 0, .064, .15, .067, knee);
      oval(shoes, 0, -.273, .037, .066, .056, .107, knee);
      return { hip, knee };
    });
    return { root, head, arms, legs };
  };
}

export function walk(person, phase, height = 0) {
  person.root.position.y = height + .026 * (1 - Math.cos(phase * 2));
  person.legs.forEach(({ hip, knee }, index) => {
    const swing = Math.sin(phase + index * Math.PI);
    hip.rotation.x = .47 * swing;
    knee.rotation.x = .16 + .48 * Math.max(0, -swing);
    person.arms[index].shoulder.rotation.x = -.37 * swing;
    person.arms[index].elbow.rotation.x = -.24;
  });
}
