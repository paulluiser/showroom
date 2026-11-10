const clamp = value => Math.max(0,Math.min(1,value));
const ease = value => {const t=clamp(value);return t*t*(3-2*t);};
export const INVENTORY_PATH='/projects/inventory-accounting';
export const ROUTE_COVER=1120;
export const ROUTE_DURATION=2040;
export function routeOrbFrame(age,source,viewport,destination) {
  const gather=ease(age/640);
  const arrive=ease((age-ROUTE_COVER)/780);
  const middle={x:viewport.width*.5,y:viewport.height*.5,radius:Math.min(76,viewport.width*.16)};
  const end=destination??middle;
  return {
    x:(source.x+(middle.x-source.x)*gather)*(1-arrive)+end.x*arrive,
    y:(source.y+(middle.y-source.y)*gather)*(1-arrive)+end.y*arrive,
    radius:(source.radius+(middle.radius-source.radius)*gather)*(1-arrive)+end.radius*arrive,
    orbReveal:(source.orbReveal ?? 1) + (1 - (source.orbReveal ?? 1)) * ease(age / 180),
    spread:ease((age-440)/680),
    veil:1-ease((age-ROUTE_COVER)/850),
    cover:age>=ROUTE_COVER,
    done:age>=ROUTE_DURATION,
  };
}
export function restingOrbFrame(target) {
  return {...target,chapter:1,dock:1,build:1,formation:1,orbReveal:target.orbReveal ?? 1,horizon:0,lens:0,loop:0,aiReady:false,
    project:target.project ?? 'enterprise',workflow:{index:0,progress:0,pulse:0},satellites:[],qualityTrails:[],clipTop:0,clipBottom:0};
}
