import { projects } from './content.js';

export const carouselProjects = ['enterprise', 'hris', 'streaming', 'operations']
  .map(art => projects.find(project => project.art === art));

export function wrapProjectIndex(index) {
  const count = carouselProjects.length;
  return (index % count + count) % count;
}

export function projectPosition(index, active) {
  return ['front', 'next', 'rear', 'previous'][wrapProjectIndex(index - active)];
}
