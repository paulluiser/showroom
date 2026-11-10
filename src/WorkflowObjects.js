import * as THREE from 'three';

const ease = THREE.MathUtils.smoothstep;
const turn = Math.PI * 2;

// Split matching edges on both sides so bent faces cannot open at triangle boundaries.
function subdivideMeltFaces(geometry) {
  const { position, normal, uv } = geometry.attributes;
  const vertices = Array.from({ length: position.count }, (_, i) => [
    position.getX(i), position.getY(i), position.getZ(i),
    normal.getX(i), normal.getY(i), normal.getZ(i), uv.getX(i), uv.getY(i),
  ]);
  const triangles = [];
  const midpoint = new Map();
  function addFace(a, b, c) {
    const boundary = [];
    const face = [a, b, c];
    for (let edge = 0; edge < 3; edge++) {
      const start = face[edge], end = face[(edge + 1) % 3];
      const p = vertices[start], q = vertices[end];
      boundary.push(start);
      const distance = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
      if (distance <= .30 ** 2) continue;
      const key = start < end ? `${start}:${end}` : `${end}:${start}`;
      if (!midpoint.has(key)) {
        midpoint.set(key, vertices.length);
        vertices.push(p.map((value, i) => (value + q[i]) * .5));
      }
      boundary.push(midpoint.get(key));
    }
    if (boundary.length === 3) {
      triangles.push(a, b, c);
      return;
    }
    const center = vertices.length;
    vertices.push(vertices[a].map((value, i) => (value + vertices[b][i] + vertices[c][i]) / 3));
    for (let i = 0; i < boundary.length; i++) addFace(center, boundary[i], boundary[(i + 1) % boundary.length]);
  }
  const faces = geometry.index?.array;
  for (let i = 0; i < (faces?.length ?? position.count); i += 3) {
    addFace(faces?.[i] ?? i, faces?.[i + 1] ?? i + 1, faces?.[i + 2] ?? i + 2);
  }
  if (vertices.length === position.count) return geometry;
  const refined = new THREE.BufferGeometry();
  refined.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flatMap(v => v.slice(0, 3)), 3));
  refined.setAttribute('normal', new THREE.Float32BufferAttribute(vertices.flatMap(v => v.slice(3, 6)), 3));
  refined.setAttribute('uv', new THREE.Float32BufferAttribute(vertices.flatMap(v => v.slice(6)), 2));
  refined.setIndex(triangles);
  geometry.dispose();
  return refined;
}

export function animateWorkflowIdle(stage, time, finishAmount, reduced) {
  const amount = reduced ? 0 : ease(finishAmount, .55, 1);
  stage.position.y = Math.sin(time * 2.4) * .09 * amount;
  stage.rotation.set(
    Math.sin(time * 1.8 + .5) * .10 * amount,
    Math.sin(time * 2.1) * .15 * amount,
    Math.sin(time * 1.6 - .4) * .045 * amount,
  );
}

const mesh = (group, geometry, material, x = 0, y = 0, z = 0) => {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  group.add(part);
  return part;
};

function outline(points) {
  return new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
}

function relief(shape, depth, bevel) {
  return new THREE.ExtrudeGeometry(shape, {
    depth, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24,
  }).translate(0, 0, -depth / 2);
}

function turned(profile, segments = 64) {
  return new THREE.LatheGeometry(profile.map(([radius, y]) => new THREE.Vector2(radius, y)), segments);
}

function wire(points, radius) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), Math.max(16, points.length * 2), radius, 8, false);
}

function hickoryGrain() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const bend = Math.sin(y / 21 + x / 17) * 1.8 + Math.sin(y / 7) * .33;
      const growthRing = Math.sin(x * .47 + bend) * .65 + Math.sin(x * 1.38 + bend * 2) * .23;
      const grain = 14 * growthRing + 4 * Math.sin(x * 5.3 + y * .31);
      pixels.set([160 + grain, 99 + grain, 60 + grain * .72, 255], (y * size + x) * 4);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function lightbulb(group, finish, steel, dark) {
  const glass = finish({
    color: '#eadba2', roughness: .085, metalness: .13, clearcoat: 1,
    emissive: '#ffe34a', emissiveIntensity: 0,
    transparent: true, opacity: .35, depthWrite: false,
  }, THREE.MeshPhysicalMaterial);
  const bulb = turned([
    [.30, -.67], [.32, -.54], [.37, -.43], [.49, -.30], [.64, -.17], [.77, -.01],
    [.85, .15], [.88, .34], [.86, .51], [.80, .69], [.69, .86], [.55, .99],
    [.39, 1.09], [.21, 1.15], [0, 1.17],
  ]);
  mesh(group, bulb, glass).scale.z = .9;

  const nickel = finish({ color: '#a99882', metalness: .92, roughness: .29 });
  mesh(group, turned([
    [0, -1.10], [.20, -1.10], [.255, -1.05], [.287, -.99],
    [.302, -.73], [.325, -.71], [.325, -.66], [.30, -.64], [0, -.64],
  ]), nickel);
  const thread = Array.from({ length: 95 }, (_, i) => {
    const t = i / 94;
    const angle = Math.PI * 2 * 3.25 * t;
    const radius = THREE.MathUtils.lerp(.265, .304, t);
    return new THREE.Vector3(radius * Math.cos(angle), -.99 + t * .266, radius * Math.sin(angle));
  });
  mesh(group, wire(thread, .022), steel);
  mesh(group, new THREE.CylinderGeometry(.203, .146, .062, 32), dark, 0, -1.106);
  mesh(group, new THREE.SphereGeometry(.087, 24, 12).scale(1, .37, 1), nickel, 0, -1.149);

  const warm = finish({ color: '#ffed9a', emissive: '#ffdb32', emissiveIntensity: 0, roughness: .34 });
  for (const direction of [-1, 1]) {
    mesh(group, wire([
      new THREE.Vector3(direction * .075, -.65, 0),
      new THREE.Vector3(direction * .132, -.22, 0),
      new THREE.Vector3(direction * .232, .15, 0),
    ], .019), nickel);
  }
  const filament = Array.from({ length: 65 }, (_, i) => {
    const t = i / 64;
    return new THREE.Vector3(-.232 + .464 * t, .15 + Math.sin(t * Math.PI * 14) * .033, Math.sin(t * Math.PI * 7) * .026);
  });
  mesh(group, wire(filament, .018), warm);
  group.rotation.y = -.11;
  return (age, finishAmount, reduced) => {
    const wiggle = Math.sin(age * .016) * Math.exp(-age / 680) * (1 - ease(age, 850, 1420)) * finishAmount;
    group.rotation.z = wiggle * .24;
    group.rotation.y = -.11 + wiggle * .16;
    const power = finishAmount * (reduced ? 1 : ease(age, 150, 675));
    const surge = reduced ? 0 : ease(age, 410, 495) * (1 - ease(age, 495, 680));
    warm.emissiveIntensity = power * (4.4 + surge * 1.2);
    glass.emissiveIntensity = power * (.58 + surge * .22);
    return power;
  };
}

function hammer(group, finish, steel, dark) {
  const forged = finish({ color: '#414b5b', metalness: .93, roughness: .31 });
  const wood = finish({ map: hickoryGrain(), roughness: .46, clearcoat: .19 }, THREE.MeshPhysicalMaterial);
  const grip = finish({ color: '#252028', roughness: .66 });
  const head = outline([[-.78,.42],[-.71,.71],[-.49,.77],[.10,.77],[.36,.74],[.47,.59],[.32,.42],[-.19,.42],[-.41,.39]]);
  mesh(group, relief(head, .47, .065), forged);
  const face = mesh(group, turned([[0,-.22],[.25,-.22],[.30,-.18],[.30,-.04],[.28,.03],[.19,.10],[0,.10]], 40), steel, -.96, .58);
  face.rotation.z = -Math.PI / 2;

  const claw = new THREE.Shape().moveTo(.19,.71);
  claw.bezierCurveTo(.64,.79,1.02,.67,1.18,.48);
  claw.quadraticCurveTo(1.24,.41,1.20,.35);
  claw.lineTo(1.06,.35);
  claw.quadraticCurveTo(.87,.49,.53,.49);
  claw.lineTo(.19,.49).closePath();
  for (const z of [-.144, .144]) mesh(group, relief(claw, .14, .032), steel, 0, 0, z);

  const handle = new THREE.Shape().moveTo(-.17,.53);
  handle.bezierCurveTo(-.21,.23,-.09,-.18,-.07,-.54);
  handle.bezierCurveTo(-.06,-.77,-.16,-.91,-.17,-1.12);
  handle.quadraticCurveTo(-.04,-1.24,.20,-1.13);
  handle.bezierCurveTo(.30,-.75,.26,-.39,.17,.02);
  handle.quadraticCurveTo(.16,.32,.19,.53).closePath();
  mesh(group, relief(handle, .18, .075), wood);
  for (let i = 0; i < 5; i++) {
    const y = -.84 - i * .059;
    const band = mesh(group, new THREE.TorusGeometry(.139 + i * .003, .015, 8, 32), grip, .055 - i * .014, y, 0);
    band.rotation.x = Math.PI / 2;
    band.scale.x = 1.27;
  }
  mesh(group, new THREE.CylinderGeometry(.080, .080, .015, 6).rotateX(Math.PI / 2), dark, .03, .58, .311);
  group.rotation.set(.08, -.25, -.14);
  return (age, finishAmount) => {
    const windup = ease(age, 30, 310);
    const strike = Math.pow(THREE.MathUtils.clamp((age - 300) / 195, 0, 1), 2.7);
    const recover = 1 - ease(age, 515, 1110);
    const rebound = Math.sin((age - 495) * .032) * ease(age, 495, 520) * (1 - ease(age, 540, 775));
    group.rotation.z = -.14 + finishAmount * ((-.49 * windup + 1.81 * strike) * recover - .16 * rebound);
    group.position.y = finishAmount * ((.09 * windup - .26 * strike) * recover + .07 * rebound);
  };
}

function gear(group, finish, steel, dark) {
  const angles = [-.50, -.34, -.25, -.16, .16, .25, .34, .50];
  const radii = [1.04, 1.04, 1.13, 1.30, 1.30, 1.13, 1.04, 1.04];
  const points = Array.from({ length: 10 }, (_, tooth) => angles.slice(0, -1).map((angle, i) => {
    const theta = (tooth + angle) * Math.PI / 5;
    return [radii[i] * Math.cos(theta), radii[i] * Math.sin(theta)];
  })).flat();
  const shape = outline(points);
  const bore = new THREE.Path();
  bore.absarc(0, 0, .43, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  for (let i = 0; i < 6; i++) {
    const theta = i * Math.PI / 3;
    const opening = new THREE.Path();
    opening.absarc(.765 * Math.cos(theta), .765 * Math.sin(theta), .094, 0, Math.PI * 2, true);
    shape.holes.push(opening);
  }

  const body = finish({ color: '#7789a0', metalness: .9, roughness: .28 });
  mesh(group, relief(shape, .29, .035), body);
  const hub = turned([[.42,-.05],[.43,-.085],[.56,-.085],[.61,-.045],[.61,.042],[.57,.082],[.45,.082],[.42,.048],[.42,-.05]]);
  mesh(group, hub.rotateX(Math.PI / 2), steel, 0, 0, .15);
  mesh(group, new THREE.TorusGeometry(.95, .011, 8, 80), dark, 0, 0, .151);
  mesh(group, new THREE.TorusGeometry(.99, .009, 8, 80), steel, 0, 0, .151);
  group.rotation.set(.13, -.25, .15);
  return age => { group.rotation.z = .15 + turn * ease(age, 30, 1030); };
}

function openBook(group, finish) {
  const cover = finish({ color: '#193d4c', roughness: .66 });
  const edges = finish({ color: '#c7b9a3', roughness: .94 });
  const paper = finish({ color: '#f4ead8', roughness: .87, side: THREE.DoubleSide });
  const ink = finish({ color: '#526070', roughness: 1, side: THREE.DoubleSide });
  const width = 1.29;

  function surface(parent, material, from, to, y, height, arc, offset, segmentsY = 1) {
    const geometry = new THREE.PlaneGeometry(1, 1, 24, segmentsY);
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = THREE.MathUtils.lerp(from, to, vertices.getX(i) + .5);
      const z = Math.sin(Math.PI * Math.abs(x) / width) * arc + offset;
      vertices.setXYZ(i, x, vertices.getY(i) * height + y, z);
    }
    geometry.computeVertexNormals();
    return mesh(parent, geometry, material);
  }

  function printPage(parent, direction, arc, offset, lines) {
    const print = (y, length, height) => {
      const start = .16 * direction, end = (.16 + length) * direction;
      surface(parent, ink, Math.min(start, end), Math.max(start, end), y, height, arc, offset);
    };
    print(.54, .49, .046);
    for (const [i, length] of lines.entries()) print(.32 - i * .119, length, .022);
  }

  const leftPage = [.92, .85, .94, .72, .90, .77];
  const rightPage = [.84, .94, .80, .92, .70, .60];
  const nextPage = [.94, .83, .87, .68, .95, .75];
  const turnedPage = [.89, .96, .73, .88, .82, .67];
  const jacket = outline([[-1.37,-.9],[-.10,-.9],[0,-.94],[.10,-.9],[1.37,-.9],
    [1.37,.9],[.10,.9],[0,.86],[-.10,.9],[-1.37,.9]]);
  mesh(group, relief(jacket, .10, .023), cover, 0, 0, -.15);
  mesh(group, new THREE.CylinderGeometry(.075, .075, 1.79, 24, 8), cover, 0, 0, -.115);

  for (const side of [-1, 1]) {
    const bounds = side < 0 ? [-width, -.025] : [.025, width];
    const block = outline([[bounds[0],-.838],[bounds[1],-.838],[bounds[1],.838],[bounds[0],.838]]);
    mesh(group, relief(block, .115, .013), edges, 0, 0, -.065);
    surface(group, paper, ...bounds, 0, 1.68, .056, .009, 4);
    printPage(group, side, .056, .017, side < 0 ? leftPage : nextPage);
  }

  // The right leaf starts above the next page and lands face-down on the left.
  const leaf = new THREE.Group();
  leaf.position.z = .096;
  group.add(leaf);
  surface(leaf, paper, .024, width, 0, 1.68, .023, 0, 4);
  printPage(leaf, 1, .023, .008, rightPage);
  printPage(leaf, 1, .023, -.008, turnedPage);
  group.rotation.set(.20, -.14, -.08);
  return age => {
    const progress = ease(age, 110, 1520);
    leaf.rotation.y = -Math.PI * progress;
    leaf.position.z = .096 + Math.sin(Math.PI * progress) * .045;
  };
}

function checkMark(group, finish) {
  const mark = new THREE.Shape().moveTo(-1.12,-.04);
  mark.quadraticCurveTo(-1.20,.05,-1.11,.14);
  mark.lineTo(-1.04,.21).quadraticCurveTo(-.95,.29,-.86,.20);
  mark.lineTo(-.40,-.25).quadraticCurveTo(-.35,-.30,-.30,-.25);
  mark.lineTo(.88,.90).quadraticCurveTo(.97,.99,1.07,.89);
  mark.lineTo(1.13,.83).quadraticCurveTo(1.22,.74,1.13,.65);
  mark.lineTo(-.23,-.68).quadraticCurveTo(-.35,-.79,-.48,-.66);
  mark.closePath();
  const enamel = finish({
    color: '#269776', metalness: .45, roughness: .22, clearcoat: .87, clearcoatRoughness: .19,
  }, THREE.MeshPhysicalMaterial);
  mesh(group, relief(mark, .25, .062), enamel);
  group.rotation.set(.14, -.24, 0);
  return (age, finishAmount) => {
    const wobble = Math.sin(age * .020) * Math.exp(-age / 365) * (1 - ease(age, 740, 1110)) * finishAmount;
    group.rotation.z = wobble * .36;
    group.rotation.y = -.24 + wobble * .28;
    group.position.y = Math.sin(ease(age, 0, 640) * Math.PI) * .13 * finishAmount;
  };
}

export function createWorkflowObjects(uniforms) {
  function finish(properties, Material = THREE.MeshStandardMaterial) {
    const material = new Material(properties);
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>
        attribute vec3 workflowPosition;
        uniform float uObjectMelt;
        uniform float uTime;
        uniform float uSpeech;
        uniform vec4 uLiquidCore;
        uniform mat3 uLiquidViewToOrb;
        varying vec3 vWorkflowPosition;
        varying vec3 vWorkflowView;
        varying vec3 vWorkflowRadial;
        varying float vWorkflowPull;
        ${workflowOrbWave}`
      ).replace('#include <begin_vertex>', `#include <begin_vertex>
        vWorkflowPosition = workflowPosition;
        vWorkflowRadial = vec3(0., 0., 1.);
        vWorkflowPull = 0.;`
      ).replace('#include <project_vertex>', `#include <project_vertex>
        if (uObjectMelt > 0.) {
          vec3 offset = mvPosition.xyz - uLiquidCore.xyz;
          float distanceToCore = length(offset);
          float radius = max(.0001, uLiquidCore.w);
          vec3 radial = offset / max(.0001, distanceToCore);
          float distanceRatio = distanceToCore / radius;
          float delay = mix(.16, .02, smoothstep(.20, 1., distanceRatio));
          float pull = smoothstep(delay, .96, uObjectMelt);
          float bend = sin(pull * 3.14159265) * (.19 + .07 * sin(workflowPosition.y * 3. - uTime * 2.));
          mat2 curl = mat2(cos(bend), sin(bend), -sin(bend), cos(bend));
          radial.xy = curl * radial.xy;
          vec3 localDirection = uLiquidViewToOrb * radial;
          localDirection /= max(.0001, length(localDirection));
          float surface = .90 + orbSurfaceWave(localDirection, uTime, uSpeech, 1., 0.) / 1.5;
          vec3 flowing = mix(offset, radial * radius * surface, pull);
          mvPosition.xyz = uLiquidCore.xyz + flowing;
          gl_Position = projectionMatrix * mvPosition;
          vec3 orbLocal = uLiquidViewToOrb * flowing;
          vWorkflowPosition = mix(workflowPosition, orbLocal * (1.5 / max(.0001, length(orbLocal))), pull);
          vWorkflowRadial = flowing / max(.0001, length(flowing));
          vWorkflowPull = pull;
        }
        vWorkflowView = mvPosition.xyz;`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vWorkflowPosition;
        varying vec3 vWorkflowView;
        varying vec3 vWorkflowRadial;
        varying float vWorkflowPull;
        uniform float uObjectReveal;
        uniform float uObjectFinish;
        uniform float uTime;
        uniform float uSpeech;
        uniform float uObjectMelt;
        uniform vec4 uLiquidCore;
        uniform mat3 uLiquidViewToOrb;
        uniform vec2 uLiquidOrb;
        uniform vec3 uWorkflowTint;
        uniform float uWorkflowStrength;
        ${workflowDissolve}
        ${workflowLiquid}`
      ).replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        if (uObjectReveal < 1. && workflowPixel(gl_FragCoord.xy) >= uObjectReveal) discard;`
      ).replace('#include <colorspace_fragment>', `#include <colorspace_fragment>
        if (uObjectFinish < 1.) {
          float flow, rim, ribbon;
          vec3 liquidNormal = normalize(mix(normal, vWorkflowRadial, vWorkflowPull) + vec3(0., 0., .0001));
          vec3 liquid = workflowLiquidColor(vWorkflowPosition / 1.5, liquidNormal, uTime * .65, uSpeech, 1., 1., flow, rim, ribbon);
          liquid = mix(liquid, liquid * .65 + uWorkflowTint * (rim * .6 + ribbon * .35), uWorkflowStrength);
          if (uObjectMelt > .34) {
            // Both surfaces use the orb's ribbons where the same camera ray hits them.
            vec3 ray = normalize(vWorkflowView);
            vec3 closest = ray * dot(ray, uLiquidCore.xyz) - uLiquidCore.xyz;
            float radius = max(.0001, uLiquidCore.w * uLiquidOrb.x);
            float distanceRatio = length(closest) / radius;
            if (distanceRatio < 1.) {
              vec3 front = (closest - ray * sqrt(max(0., radius*radius - dot(closest, closest)))) / radius;
              vec3 local = normalize(uLiquidViewToOrb * front);
              vec3 core = workflowLiquidColor(local, front, uTime * .65, uSpeech, 1., uLiquidOrb.y, flow, rim, ribbon);
              core = mix(core, core * .65 + uWorkflowTint * (rim * .6 + ribbon * .35), uWorkflowStrength);
              float blend = smoothstep(.34, .72, uObjectMelt) * (1. - smoothstep(.88, 1., distanceRatio));
              liquid = mix(liquid, core, blend);
            }
          }
          gl_FragColor.rgb = mix(liquid, gl_FragColor.rgb, uObjectFinish);
          gl_FragColor.a = mix(1., gl_FragColor.a, uObjectFinish);
        }`);
    };
    return material;
  }

  const steel = finish({ color: '#adb9c7', metalness: .93, roughness: .22 });
  const dark = finish({ color: '#313945', metalness: .46, roughness: .45 });
  return [lightbulb, hammer, gear, openBook, checkMark].map(build => {
    const object = new THREE.Group();
    const animate = build(object, finish, steel, dark);
    object.animate = (age, strength, reduced) => animate(reduced ? 0 : age, strength, reduced);
    // Sample the liquid ribbons in the model's coordinates, including across separate parts.
    const position = new THREE.Vector3();
    const toObject = new THREE.Matrix4();
    object.updateMatrixWorld(true);
    const fromWorld = object.matrixWorld.clone().invert();
    object.traverse(part => {
      if (!part.isMesh) return;
      if (part.geometry.type === 'ExtrudeGeometry' || part.geometry.type === 'PlaneGeometry') {
        part.geometry = subdivideMeltFaces(part.geometry);
      }
      toObject.multiplyMatrices(fromWorld, part.matrixWorld);
      const vertices = part.geometry.attributes.position;
      const coordinates = new Float32Array(vertices.count * 3);
      for (let i = 0; i < vertices.count; i++) {
        position.fromBufferAttribute(vertices, i).applyMatrix4(toObject).toArray(coordinates, i * 3);
      }
      part.geometry.setAttribute('workflowPosition', new THREE.BufferAttribute(coordinates, 3));
    });
    object.visible = false;
    return object;
  });
}

export const workflowDissolve = `
  float workflowPixel(vec2 pixel) {
    return fract(52.9829189 * fract(dot(floor(pixel), vec2(.06711056, .00583715))));
  }
`;

export const workflowOrbWave = `
  float orbSurfaceWave(vec3 q, float time, float speech, float build, float fusion) {
    float wave = sin(q.y*4.+time*1.4)*cos(q.x*3.-time*.9)+sin(q.z*5.+q.x*2.-time*1.2)*.45;
    return wave*(.035+speech*.11+(1.-build)*.12+fusion*.08);
  }
`;

export const workflowLiquid = `
  vec3 workflowLiquidColor(vec3 p, vec3 surfaceNormal, float t, float speech, float build, float rimStrength,
                           out float flow, out float rim, out float ribbon) {
    float bend = sin(p.y*3.+p.z*2.+t)*1.3+cos(p.x*3.-t*.8)*.65;
    flow = p.y*4.2+p.x*2.+bend+t;
    float wave = sin(p.x*3.-p.y*4.+cos(p.z*3.+t)+t*.7);
    rim = pow(clamp(1.-abs(surfaceNormal.z),0.,1.),2.5);
    ribbon = pow(.5+.5*sin(flow),5.);
    vec3 cyan = vec3(.12,1.,.96), pink = vec3(1.,.06,.58);
    vec3 color = mix(vec3(.06,.25,1.),pink,.5+.5*sin(p.x*2.+p.y*2.+t*.6));
    color *= .10+ribbon*.95;
    color += cyan*pow(.5+.5*wave,7.)*(.9+speech*.35);
    color += mix(cyan,pink,.5+.5*sin(p.y*3.-t))*rim*.85*rimStrength;
    color += vec3(.8,.85,1.)*pow(rim,6.)*(.7+(1.-build)*2.)*rimStrength;
    rim *= rimStrength;
    return color;
  }
`;
