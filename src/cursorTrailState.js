export const TRAIL_LIFETIME=420;
export function visibleTrailPoints(points,now) {
 return points.filter(point=>now-point.time<TRAIL_LIFETIME);
}
export function appendTrailPoint(points,point) {
 const live=visibleTrailPoints(points,point.time);
 const last=live.at(-1);
 if(last && Math.hypot(point.x-last.x,point.y-last.y)<2)return live;
 return [...live,point].slice(-32);
}
