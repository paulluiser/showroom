import { impactRadiation, IMPACT_RADIATION_DURATION } from './heroMotion.js';

const ARRIVAL_TIME = 950;
const WAKE_TIME = ARRIVAL_TIME + 300;
const WAKE_DURATION = 780;
const LOOK_TIME = WAKE_TIME + WAKE_DURATION + 70;
const SQUEEZE_TIME = 3420;
const COMPRESSION_TIME = 650;
const DISPERSION_TIME = 4340;
const POP_DURATION = 160;
const REVEAL_TIME = DISPERSION_TIME + IMPACT_RADIATION_DURATION;
const SETTLE_TIME = REVEAL_TIME + 1000;

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = (from, to, progress) => from + (to - from) * progress;

export function projectViewportPosition(panel, viewportHeight, headerBottom) {
  if (panel.bottom <= headerBottom) return 'above';
  if (panel.top >= viewportHeight) return 'below';
  return 'visible';
}

export function projectArrivalFrame(age, source, center) {
  const approach = ease(age / ARRIVAL_TIME);
  const arc = 4 * approach * (1 - approach);
  const open = ease((age - WAKE_TIME) / WAKE_DURATION);
  const waking = Math.sin(Math.PI * open);
  const blink = Math.sin(Math.PI * clamp((age - LOOK_TIME - 1010) / 190)) ** 2;
  const lookLeft = ease((age - LOOK_TIME) / 220);
  const lookRight = ease((age - LOOK_TIME - 420) / 260);
  const lookHome = ease((age - LOOK_TIME - 770) / 230);
  const squeeze = ease((age - SQUEEZE_TIME) / COMPRESSION_TIME);
  const release = ease((age - DISPERSION_TIME) / POP_DURATION);
  const radiation = impactRadiation(age - DISPERSION_TIME);
  const avatarSquash = squeeze * (1 - release);
  const strain = Math.sin((age - SQUEEZE_TIME) * .075) * .016 * squeeze * (1 - release);
  const phase = age >= SETTLE_TIME ? 'ready'
    : age >= REVEAL_TIME ? 'reveal'
    : age >= DISPERSION_TIME ? 'dispersion'
    : age >= SQUEEZE_TIME ? 'squeeze'
    : age >= WAKE_TIME + WAKE_DURATION ? 'awake'
    : age >= WAKE_TIME ? 'waking'
    : age >= ARRIVAL_TIME ? 'settling'
    : 'flight';

  return {
    phase,
    x: mix(source.x, center.x, approach) + center.radius * strain,
    y: mix(source.y, center.y, approach) - arc * 23 - waking * center.radius * .12,
    radius: mix(source.radius, center.radius, approach) * (1 + .08 * open - .12 * squeeze * (1 - release) + .7 * release),
    orbReveal: 1 - release,
    chapter: mix(source.chapter ?? 0, 1, approach),
    avatarEyes: open * (1 - release),
    avatarEyeOpen: (.08 + .92 * open) * (1 - Math.max(.92 * blink, .86 * squeeze)),
    avatarLookX: (-.23 * lookLeft + .46 * lookRight - .23 * lookHome) * (1 - squeeze),
    avatarLookY: (-.07 * lookLeft + .04 * lookRight + .03 * lookHome) * (1 - squeeze) + .14 * avatarSquash,
    avatarEyeTilt: .24 * squeeze,
    avatarCuriosity: Math.sin((age - LOOK_TIME) / 1000 * Math.PI) * lookLeft * (1 - lookHome),
    avatarWake: waking,
    avatarSquash,
    radiationSpread: radiation.spread,
    radiationOpacity: radiation.opacity,
    projectCharge: (.17 * approach + .2 * open + .63 * squeeze) * (1 - release),
  };
}
