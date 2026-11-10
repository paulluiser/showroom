import * as THREE from 'three';
import {teams} from './teams.js';

export const teamAccents=[0x35eaff,0xb875ff,0x397dff,0x49ffc2,0xff62bf];

export function createTeamAura(index) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uCore: { value: new THREE.Vector3() },
      uTeam: { value: new THREE.Vector3() },
      uTint: { value: new THREE.Color(teamAccents[index]) },
      uStrength: { value: 0 },
      uWidth: { value: 0 },
      uBend: { value: [.16, -.21, .11, -.14, .20][index] },
      uSeed: { value: index + 1 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vAspect;
      uniform vec3 uCore, uTeam;
      uniform float uWidth, uBend, uSeed, uTime;
      void main() {
        vUv = uv;
        vec2 delta = uTeam.xy - uCore.xy;
        float span = length(delta);
        vec2 side = vec2(-delta.y, delta.x) / max(.001, span);
        float along = uv.x;
        float arc = sin(along * 3.14159265);
        float drift = sin(along * (6. + uSeed * .75) + uSeed * 1.9 + uTime * (.4 + uSeed * .09));
        float eddy = sin(along * 14. - uTime * .77 + uSeed * 2.6);
        float curve = uBend * (.65 + .55 * along) + drift * .09 + eddy * .035;
        float flare = mix(2.4, .42, along);
        float width = uWidth * flare * (1. + .05 * eddy);
        vAspect = max(1., span / max(.001, width * 2.));
        vec3 point = mix(uCore, uTeam, uv.x);
        point.xy += side * (span * arc * curve + position.y * width);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.);
      }`,
    fragmentShader: `
      varying vec2 vUv;
      varying float vAspect;
      uniform vec3 uTint;
      uniform float uStrength, uSeed, uTime;
      void main() {
        float across = abs(vUv.y * 2. - 1.);
        float edge = 1. - smoothstep(.38, 1., across);
        float haze = exp(-across * across * 2.7) * .48;
        float beam = exp(-across * across * 13.) * .35;
        float rays = .88 + .12 * cos((vUv.y - .5) * 43. + sin(vUv.x * 7. + uSeed) * .9);
        float ends = smoothstep(0., .14, vUv.x) * (1. - smoothstep(.88, 1., vUv.x));
        float motes = 0.;
        for (int i = 0; i < 14; i++) {
          float id = float(i);
          float seed = fract(uSeed * .38197 + id * .61803);
          float speed = .54 + seed * .59;
          float progress = fract(uTime * speed + seed + .026 * sin(uTime * 2.3 + id));
          float along = i == 3 || i == 10 ? progress : 1. - progress;
          float lane = .5 + (.13 + seed * .23) * sin(progress * 7. + uSeed + id * 2.1);
          vec2 distanceToMote = (vUv - vec2(along, lane)) * vec2(vAspect * .72, 1.);
          float size = .047 + seed * .042;
          float speck = 1. - smoothstep(.12, 1., dot(distanceToMote, distanceToMote) / (size * size));
          motes += speck * (.48 + seed * .52);
        }
        vec3 tint = mix(vec3(.22, .69, 1.), uTint, vUv.x);
        tint = mix(tint, vec3(.8, .94, 1.), clamp(beam * .55 + motes, 0., 1.));
        gl_FragColor = vec4(tint, ((haze + beam) * rays + motes * 1.08) * edge * ends * uStrength);
      }`,
  });
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(1, 2, 24, 1), material);
  aura.name = `${teams[index].name} energy connection`;
  aura.visible = false;
  aura.frustumCulled = false;
  aura.renderOrder = -1;
  return aura;
}
