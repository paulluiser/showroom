import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function createLogisticsWorld() {
  const group=new THREE.Group(),staticMeshes=[],vehicles=[];
  const materials={
    ground:new THREE.MeshStandardMaterial({color:0x20374c,roughness:.85}),
    road:new THREE.MeshStandardMaterial({color:0x142535,roughness:.9}),
    wall:new THREE.MeshStandardMaterial({color:0xb8c8d0,roughness:.55,metalness:.18}),
    roof:new THREE.MeshStandardMaterial({color:0x466a7e,roughness:.44,metalness:.42}),
    trim:new THREE.MeshStandardMaterial({color:0xdde8eb,roughness:.4,metalness:.25}),
    glass:new THREE.MeshStandardMaterial({color:0x63cadc,emissive:0x238399,emissiveIntensity:.18,roughness:.24,metalness:.5}),
    cargo:new THREE.MeshStandardMaterial({color:0xa9a1cf,roughness:.55}),
    green:new THREE.MeshStandardMaterial({color:0x42756e,roughness:.9}),
    tire:new THREE.MeshStandardMaterial({color:0x0f1820,roughness:.85}),
    amber:new THREE.MeshStandardMaterial({color:0xffe2ac,emissive:0xffd38b,emissiveIntensity:.7}),
    red:new THREE.MeshStandardMaterial({color:0xee6593,emissive:0xb42b65,emissiveIntensity:.5}),
    apron:new THREE.MeshStandardMaterial({color:0x334b5d,roughness:.87}),
    marking:new THREE.MeshStandardMaterial({color:0x7599ac,roughness:.75}),
  };
  function mesh(geo,mat,p,parent=group,moving=false) {
    const o=new THREE.Mesh(geo,mat);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);
    if(!moving)staticMeshes.push(o);return o;
  }
  function box(p,size,mat=materials.wall,parent=group,moving=false) {
    const depth=Math.min(...size);
    const geometry=depth>.16
      ? new RoundedBoxGeometry(...size,1,depth*.1)
      : new THREE.BoxGeometry(...size);
    return mesh(geometry,mat,p,parent,moving);
  }
  const detail=(p,size,mat,parent=group,moving=false)=>mesh(new THREE.BoxGeometry(...size),mat,p,parent,moving);
  const cyl=(p,r,h,mat=materials.trim,parent=group,moving=false)=>mesh(new THREE.CylinderGeometry(r,r,h,12),mat,p,parent,moving);
  detail([0,-.67,0],[78,.42,64],materials.ground);
  box([0,-.24,0],[15,.36,10],materials.ground);
  box([0,-.46,0],[14.5,.14,9.6],materials.road);
  // Perimeter road and loading apron.
  for(const z of [-3.7,3.7])box([0,-.038,z],[14.4,.025,1.3],materials.road);
  for(const x of [-6.4,6.4])box([x,-.035,0],[1.3,.025,8],materials.road);
  box([0,-.03,1.35],[11,.03,2.45],materials.road);
  for(let i=0;i<21;i++)for(const z of [-3.7,3.7])box([-6.3+i*.62,-.012,z],[.25,.012,.045],materials.trim);
  for(const x of [-6.4,6.4])for(let i=0;i<10;i++)box([x,-.01,-3+i*.66],[.04,.012,.27],materials.trim);
  function warehouse(x,z,w,d,h) {
    box([x,h/2,z],[w,h,d]);
    // Twin-pitch roof with raised ridge and standing-seam panels.
    const slope=.24;
    for(const sign of [-1,1]) {
      const roof=box([x+sign*w*.25,h+.17,z],[w*.54,.09,d+.18],materials.roof);roof.rotation.z=-sign*slope;
      for(let i=0;i<8;i++){const rib=box([x+sign*w*.25,h+.235,z-d*.45+i*d*.13],[w*.54,.018,.026],materials.trim);rib.rotation.z=-sign*slope;}
      for(let j=0;j<2;j++){const skylight=box([x+sign*w*.25,h+.27,z+(j-.5)*d*.47],[w*.3,.035,d*.2],materials.glass);skylight.rotation.z=-sign*slope;}
    }
    for(let i=0;i<Math.floor(w/.55);i++)box([x-w*.42+i*.55,h*.48,z+d*.5+.012],[.025,h*.86,.025],materials.trim);
    const doors=Math.max(2,Math.floor(w/1.2));
    for(let i=0;i<doors;i++) {
      const dx=x+(i-(doors-1)/2)*1.05;
      box([dx,.55,z+d*.5+.04],[.78,1.1,.07],materials.roof);
      for(let j=0;j<5;j++)box([dx,.16+j*.2,z+d*.5+.085],[.7,.022,.02],materials.trim);
      box([dx,1.15,z+d*.5+.1],[.77,.065,.05],materials.glass);
      box([dx,.06,z+d*.5+.35],[.9,.1,.5],materials.trim);
      for(const side of [-1,1])cyl([dx+side*.46,.15,z+d*.5+.5],.038,.32,materials.amber);
    }
  }
  warehouse(-3.6,-1.15,3.7,3.2,1.5);
  warehouse(1,-1.4,4,3.5,1.9);
  // Two-storey administrative wing and glazed facade.
  box([4.2,.8,-1.15],[1.8,1.6,2.8]);box([4.2,1.66,-1.15],[2,.1,3],materials.roof);
  for(let floor=0;floor<2;floor++)for(let i=0;i<4;i++)box([4.2,.45+floor*.65,-2.05+i*.6],[1.84,.4,.3],materials.glass);
  for(let i=0;i<3;i++)box([4.9,.2,1.4+i*.48],[.5,.4,.35],materials.cargo);
  // Loading pallets and individual shipping containers.
  for(let i=0;i<6;i++) {
    const x=-4.8+i*.67;
    box([x,.06,1.4],[.55,.1,.6],materials.roof);
    for(let level=0;level<(i%2)+1;level++)box([x,.25+level*.31,1.4],[.48,.3,.5],i%2?materials.cargo:materials.wall);
  }
  for(let i=0;i<2;i++) {
    const container=box([2.2+i*1.3,.43,2.15],[1.1,.8,1.65],i===0?materials.cargo:materials.glass);
    for(let j=0;j<6;j++)box([container.position.x-.48+j*.19,.43,3],[.025,.7,.025],materials.trim);
  }
  // Low planting strips, trees, lamps and a loading-yard gate.
  for(const x of [-6.9,6.9])for(let i=0;i<4;i++) {
    const z=-2.7+i*1.7;
    cyl([x,.25,z],.05,.5,materials.roof);
    mesh(new THREE.SphereGeometry(.3,10,8),materials.green,[x,.68,z]);
  }
  for(const x of [-5.5,5.4]) {
    cyl([x,.75,2.8],.035,1.5,materials.roof);
    box([x,1.53,2.8],[.3,.06,.22],materials.amber);
  }
  // Access roads connect the central loading loop to the surrounding logistics campus.
  for(const z of [-17,-6.4,6.6,18]) {
    detail([0,-.43,z],[75,.04,2.6],materials.road);
    for(let x=-35;x<=35;x+=1.45) detail([x,-.402,z],[.65,.01,.045],materials.marking);
  }
  for(const x of [-21,-9,8.9,22]) {
    detail([x,-.435,0],[2.45,.035,62],materials.road);
    for(let z=-29;z<=29;z+=1.45) detail([x,-.4,z],[.045,.01,.65],materials.marking);
  }
  for(const [x,z,width,depth] of [[-15,-11.5,9,7],[1,-11.5,13,7],[15,-11.5,10,7],[-15,1,9,11],[15,1,9,11],[-15,12,9,7],[0,12,14,7],[15,12,9,7],[0,23,13,6]]) {
    detail([x,-.24,z],[width,.44,depth],materials.apron);
  }
  warehouse(-15,-12.7,5.2,3.2,1.55);
  warehouse(-2.2,-12.7,5.4,3.4,1.75);
  warehouse(4.4,-12.7,4.8,3.2,1.45);
  warehouse(15,11.8,6.8,3.1,1.7);
  warehouse(-15,11.5,5.2,3.6,1.5);
  warehouse(0,23,7.2,3.5,1.6);

  // Stacked freight, a transfer gantry and container chassis in the intermodal yard.
  function freight(x,y,z,mat) {
    detail([x,y+.34,z],[.95,.68,2.2],mat);
    for(const side of [-1,1]) {
      detail([x+side*.48,y+.65,z],[.045,.08,2.22],materials.trim);
      for(let i=0;i<7;i++) detail([x+side*.48,y+.34,z-.86+i*.285],[.045,.52,.035],materials.roof);
    }
  }
  for(let lane=0;lane<4;lane++) for(let row=0;row<4;row++) {
    const x=11.6+lane*1.85, z=-3.2+row*2.8;
    const paint=[materials.cargo,materials.roof,materials.glass,materials.wall][(lane*3+row)%4];
    freight(x,0,z,paint);
    if((lane+row)%3!==1) freight(x,.7,z,row%2?materials.cargo:materials.roof);
  }
  for(const z of [-4.9,6]) {
    for(const x of [10.75,18.15]) {
      detail([x,1.42,z],[.21,2.84,.24],materials.roof);
      detail([x,.15,z],[.54,.3,.55],materials.amber);
    }
    detail([14.45,2.78,z],[7.65,.2,.29],materials.roof);
  }
  for(const x of [10.75,18.15]) detail([x,2.76,.55],[.22,.25,11.2],materials.roof);
  const trolley=new THREE.Group();
  trolley.name='gantry-trolley';
  group.add(trolley);
  detail([0,2.66,0],[7.5,.2,.24],materials.amber,trolley,true);
  detail([-.4,2.43,0],[.7,.28,.55],materials.roof,trolley,true);
  detail([-.4,1.97,0],[.035,.7,.035],materials.trim,trolley,true);
  detail([-.4,1.62,0],[.8,.1,.46],materials.amber,trolley,true);

  // Rail spur with sleepers and rolling stock on the north side.
  for(const z of [-13.9,-11.65]) {
    detail([15,-.005,z],[9.7,.035,1.35],materials.road);
    for(let i=0;i<18;i++) detail([10.6+i*.52,.023,z],[.14,.045,1.2],materials.roof);
    for(const side of [-1,1]) detail([15,.065,z+side*.42],[9.7,.07,.06],materials.trim);
    for(let i=0;i<3;i++) {
      const x=11.8+i*3.15;
      detail([x,.2,z],[2.8,.16,1.02],materials.roof);
      if(i!==1 || z<-12) detail([x,.59,z],[2.5,.65,.86],i===0?materials.cargo:materials.wall);
    }
  }
  // Dispatch office, vehicle staging stalls, street lights and green buffers.
  detail([-15,1.22,-2.35],[6.8,2.44,2.8],materials.wall);
  detail([-15,2.48,-2.35],[7,.16,3],materials.roof);
  for(const level of [.76,1.74]) for(let i=0;i<7;i++) {
    detail([-17.8+i*.93,level,-.93],[.69,.43,.045],materials.glass);
  }
  for(const z of [9.4,13.4]) for(let i=0;i<8;i++) {
    const x=-5.7+i*1.58;
    detail([x,.017,z],[.035,.018,2.5],materials.trim);
    if((i+(z>10?1:0))%3!==0) {
      detail([x+.72,.23,z],[.81,.4,1.9],materials.roof);
      detail([x+.72,.52,z-.17],[.73,.37,1.2],i%2?materials.wall:materials.cargo);
      detail([x+.72,.51,z+.66],[.69,.35,.44],materials.glass);
    }
  }
  for(const x of [-24,-19,-11,7.6,20,25]) for(const z of [-20,-8.1,8.35,20]) {
    cyl([x,-.17,z],.07,.58,materials.roof);
    mesh(new THREE.SphereGeometry(.45,8,6),materials.green,[x,.42,z]);
  }
  for(const z of [-7.75,8.05,19.65]) for(const x of [-18,-6,4,12,20]) {
    cyl([x,.56,z],.04,1.95,materials.roof);
    detail([x+.14,1.53,z],[.36,.055,.17],materials.amber);
  }
  const route=new THREE.CatmullRomCurve3([[-6.3,0,3.7],[-2,0,3.7],[3.7,0,3.7],[6.4,0,2.8],[6.4,0,-2.7],[4,0,-3.7],[-4.8,0,-3.7],[-6.4,0,-2.5],[-6.4,0,2.6]].map(v=>new THREE.Vector3(...v)),true,'catmullrom',.08);
  const wheels=[];
  for(let i=0;i<3;i++) {
    const truck=new THREE.Group();truck.name=`delivery-truck-${i}`;group.add(truck);
    const paint=[materials.glass,materials.cargo,materials.trim][i];
    box([0,.29,0],[.65,.22,1.65],materials.roof,truck,true);
    box([0,.63,-.28],[.68,.64,1.12],paint,truck,true);
    box([0,.51,.65],[.64,.58,.53],materials.wall,truck,true);
    box([0,.72,.93],[.52,.21,.025],materials.glass,truck,true);
    box([0,.28,.94],[.68,.1,.08],materials.roof,truck,true);
    for(const side of [-1,1]) {
      box([side*.23,.4,.97],[.11,.09,.025],materials.amber,truck,true);
      box([side*.25,.4,-.87],[.1,.07,.025],materials.red,truck,true);
      box([side*.36,.66,.57],[.07,.12,.07],materials.roof,truck,true);
      for(const z of [-.62,-.2,.66]) {
        const wheel=cyl([side*.35,.19,z],.16,.09,materials.tire,truck,true);wheel.rotation.z=Math.PI/2;wheels.push(wheel);
        const hub=cyl([side*.4,.19,z],.075,.02,materials.trim,truck,true);hub.rotation.z=Math.PI/2;
      }
    }
    vehicles.push(truck);
  }
  // Batch architecture by material; moving trucks remain separate.
  group.updateMatrixWorld(true);const batches=new Map();
  for(const object of staticMeshes){
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
    const expanded=geometry.index?geometry.toNonIndexed():geometry;
    if(expanded!==geometry)geometry.dispose();
    if(!batches.has(object.material))batches.set(object.material,[]);
    batches.get(object.material).push(expanded);
    object.removeFromParent();object.geometry.dispose();
  }
  for(const [material,geometries] of batches){const g=mergeGeometries(geometries);const o=new THREE.Mesh(g,material);o.castShadow=true;o.receiveShadow=true;group.add(o);geometries.forEach(g=>g.dispose());}
  let lightMode=null;
  const tangent=new THREE.Vector3();
  return {group,update(time,light){
    if(light!==lightMode){
      lightMode=light;
      materials.ground.color.set(light?0xdbe4ea:0x20374c);
      materials.road.color.set(light?0xb7c8d4:0x142535);
      materials.apron.color.set(light?0xc5d2dc:0x334b5d);
      materials.wall.color.set(light?0xf3f5f4:0xb8c8d0);
      materials.roof.color.set(light?0x7a98aa:0x466a7e);
    }
    trolley.position.set(14.45,0,.55+Math.sin(time*.32)*4.4);
    vehicles.forEach((truck,i)=>{route.getPointAt((time*.02+i*.32)%1,truck.position);route.getTangentAt((time*.02+i*.32)%1,tangent);truck.rotation.y=Math.atan2(tangent.x,tangent.z);});
    wheels.forEach(w=>{w.rotation.x=-time*3;});
  },dispose(){const geometries=new Set(),mats=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)mats.add(o.material);});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}};
}
