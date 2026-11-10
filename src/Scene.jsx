import { useEffect, useRef } from "react";
import { canAnimate } from "./motion";
import { qualities } from "./qualities";
import { teams } from "./teams";
import { workflows } from "./content";
import { advanceWorkflowMorph, easeWorkflowMorph, PROCESSING_DURATION, WORKFLOW_DURATION } from "./workflowCycle";
import { speechEnvelope } from "./speechMotion";
import { createTeamAura } from "./TeamOrb";
import { createTeamIcon } from "./TeamIcon";
import { animateWorkflowIdle, createWorkflowObjects, workflowDissolve, workflowLiquid, workflowOrbWave } from "./WorkflowObjects";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import * as THREE from "three";

export default function Scene({ paused, motion, processingLabel }) {
  const host = useRef(null);
  const avatar = useRef(null);
  const pauseRef = useRef(paused);
  const syncRef = useRef(null);
  useEffect(() => {
    pauseRef.current = paused;
    syncRef.current?.();
  }, [paused]);
  useEffect(() => {
    const container = host.current;
    const face = avatar.current;
    function updateAvatar(frame) {
      const opacity = frame.avatarEyes ?? 0;
      if (opacity < .01) {
        if (!face.hidden) face.hidden = true;
        return;
      }
      face.hidden = false;
      face.style.opacity = opacity;
      face.style.setProperty('--face-x', `${frame.x}px`);
      face.style.setProperty('--face-y', `${frame.y}px`);
      face.style.setProperty('--face-radius', `${frame.radius}px`);
      face.style.setProperty('--eye-open', frame.avatarEyeOpen);
      face.style.setProperty('--look-x', `${frame.radius * frame.avatarLookX}px`);
      face.style.setProperty('--look-y', `${frame.radius * frame.avatarLookY}px`);
      face.style.setProperty('--eye-tilt', `${frame.avatarEyeTilt}rad`);
      face.style.setProperty('--curiosity', frame.avatarCuriosity);
    }
    const processingMessages = ['Thinking', 'Exploring', 'Analyzing', 'Synthesizing', 'Checking'];
    let processingText = '';
    function updateProcessing(index, visible) {
      const label = processingLabel.current;
      if (!label) return;
      const text = visible ? processingMessages[index] : '';
      if (text === processingText) return;
      processingText = text;
      if (text) label.firstElementChild.textContent = text;
      label.dataset.visible = String(!!text);
    }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      container.classList.add("scene-fallback");
      document.documentElement.dataset.renderer = "fallback";
      let fallbackFrame;
      const follow = () => {
        const f = motion.current;
        if (f) {
          updateAvatar(f);
          container.style.zIndex=f.transitioning?'110':f.chapterTransit?'24':'';
          container.style.setProperty("--fallback-x", `${f.x}px`);
          container.style.setProperty("--fallback-y", `${f.y}px`);
          container.style.setProperty("--fallback-size", `${f.radius * 2}px`);
          container.style.setProperty("--orb-reveal", f.orbReveal ?? 1);
          const radiationOpacity = f.radiationOpacity ?? 0;
          container.style.setProperty('--radiation-opacity', radiationOpacity);
          if (radiationOpacity > 0) {
            const radius = f.radius * .3 + f.radiationSpread * Math.hypot(innerWidth, innerHeight);
            container.style.setProperty('--radiation-radius', `${radius}px`);
          }
          updateProcessing(f.workflow?.index ?? 0, f.aiReady && !pauseRef.current && (f.workflow?.progress ?? 0) < PROCESSING_DURATION / WORKFLOW_DURATION);
          container.style.setProperty('--project-charge', f.projectCharge ?? 0);
          container.style.setProperty('--avatar-squash', f.avatarSquash ?? 0);
          container.style.setProperty('--avatar-wake', f.avatarWake ?? 0);
          container.style.zIndex=f.transitioning?'110':f.chapterTransit?'24':'';
          container.style.clipPath=`inset(${f.clipTop || 0}px 0 ${f.clipBottom || 0}px 0)`;
          container.style.setProperty('--fallback-flight',f.flight?.amount ?? 0);
          container.style.setProperty('--fallback-flight-angle',`${f.flight?.angle ?? 0}rad`);
          container.style.setProperty('--fallback-lens',f.lens || 0);
          container.style.setProperty('--fallback-loop',f.loop || 0);
        }
        fallbackFrame = requestAnimationFrame(follow);
      };
      fallbackFrame = requestAnimationFrame(follow);
      return () => cancelAnimationFrame(fallbackFrame);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 8;
    camera.updateMatrixWorld();
    const globe = new THREE.Group();
    scene.add(globe);
    let studioEnvironment;
    let studioReady = false;
    function prepareStudio() {
      studioReady = true;
      if (renderer.extensions.has("EXT_color_buffer_float")) {
        const room = new RoomEnvironment();
        const generator = new THREE.PMREMGenerator(renderer);
        studioEnvironment = generator.fromScene(room, .04, .1, 40, { size: 128 });
        scene.environment = studioEnvironment.texture;
        scene.environmentIntensity = .86;
        room.dispose();
        generator.dispose();
      }
      scene.add(new THREE.HemisphereLight(0xd8e9ff, 0x3d2c44, .88));
      const key = new THREE.DirectionalLight(0xffe9d4, 2.2);
      key.position.set(-3, 5, 6);
      const edge = new THREE.DirectionalLight(0x9bbaff, 1.55);
      edge.position.set(4, 2, -5);
      scene.add(key, edge);
    }
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uMorph: { value: new THREE.Vector2() }, uFlight: { value: new THREE.Vector2() }, uFlightX: { value: new THREE.Vector4() }, uFlightY: { value: new THREE.Vector4() }, uAiForms: { value: Array(workflows.length).fill(0) }, uObjectReveal: { value: 0 }, uRimStrength: { value: 1 }, uSolidShape: { value: 0 }, uDetailLight: { value: 0 }, uTime: { value: 0 }, uSpeech: { value: 0 }, uWorkflowTint: { value: new THREE.Vector3(.12,1.,.95) }, uWorkflowStrength: { value: 0 }, uBuild: { value: 0 }, uFormation: { value: 1 }, uFusion: { value: 0 }, uReveal: { value: 1 }, uSpot: { value: 0 }, uCollisionGlow: { value: 0 }, uTeamDirection: { value: new THREE.Vector3(1,0,1) } },
      vertexShader: `varying vec3 vNormal; varying vec3 vPosition; uniform float uTime; uniform float uSpeech; uniform float uBuild; uniform float uFormation; uniform float uFusion; uniform float uSolidShape; uniform vec2 uMorph;
      varying vec3 vShapedPosition;
      uniform vec2 uFlight;
      uniform vec4 uFlightX, uFlightY;
      uniform float uAiForms[${workflows.length}];
      ${workflowOrbWave}
      vec2 flightPoint(float t){
        float s=1.-t;
        vec4 weights=vec4(s*s*s,3.*s*s*t,3.*s*t*t,t*t*t);
        return vec2(dot(uFlightX,weights),dot(uFlightY,weights));
      }
      void main(){
      float a=uv.x*6.2831853;float b=(uv.y-.5)*6.2831853;
      vec3 loopPosition=vec3((1.02+.36*cos(b))*cos(a),(1.02+.36*cos(b))*sin(a),.36*sin(b));
      vec3 loopNormal=vec3(cos(b)*cos(a),cos(b)*sin(a),sin(b));
      vec3 lensScale=vec3(1.12,.78,.42);
      vec3 shape=mix(position,position*lensScale,uMorph.x);
      shape=mix(shape,loopPosition,uMorph.y);
      vec3 shapeNormal=normalize(mix(normal,normal/lensScale,uMorph.x));
      shapeNormal=normalize(mix(shapeNormal,loopNormal,uMorph.y));
      vec3 q=position/1.5;
      float aiShape=uAiForms[0]+uAiForms[1]+uAiForms[2]+uAiForms[3]+uAiForms[4];
      if(aiShape>.0001) {
        vec3 cube=q/pow(max(.001,dot(pow(abs(q),vec3(6.)),vec3(1.))),1./6.);
        vec3 cubeNormal=normalize(sign(cube)*pow(abs(cube),vec3(5.)));
        float neck=smoothstep(-1.,-.25,q.y);
        vec3 bulbScale=vec3(mix(.39,.91,neck),.94,mix(.37,.81,neck));
        vec3 bulb=q*bulbScale+vec3(0.,.24,0.);
        float peen=smoothstep(.22,.99,cube.x);
        vec3 hammer=vec3(cube.x*1.19,.59+cube.y*mix(.27,.12,peen)-.13*peen,cube.z*mix(.35,.23,peen));
        float teeth=smoothstep(-.3,.7,cos(a*10.));
        float gearWall=cos(b);
        float gearRadius=.77+min(0.,gearWall)*.34+max(0.,gearWall)*(.27+.26*teeth);
        vec3 gear=vec3(gearRadius*cos(a),gearRadius*sin(a),.18*sin(b));
        float pageArc=sin(abs(cube.x)*3.1415927);
        vec3 book=vec3(cube.x*1.34,cube.y*.87,cube.z*.11+pageArc*.07);
        float markProgress=.5+.5*q.y;
        vec2 markStart=vec2(-1.02,.06),markJoint=vec2(-.36,-.61),markEnd=vec2(1.10,.82);
        vec2 firstLeg=mix(markStart,markJoint,min(markProgress/.36,1.));
        vec2 secondLeg=mix(markJoint,markEnd,clamp((markProgress-.36)/.64,0.,1.));
        float turn=smoothstep(.28,.44,markProgress);
        vec2 tangent=normalize(mix(markJoint-markStart,markEnd-markJoint,turn));
        vec2 side=vec2(tangent.y,-tangent.x);
        vec3 mark=vec3(firstLeg+secondLeg-markJoint+side*q.x*.30,q.z*.27);
        shape=shape*(1.-aiShape)+bulb*uAiForms[0]+hammer*uAiForms[1]+gear*uAiForms[2]+book*uAiForms[3]+mark*uAiForms[4];
        vec3 plateNormal=normalize(cubeNormal*vec3(.65,.65,2.4));
        vec3 markNormal=normalize(vec3(side*q.x+tangent*q.y*.28,q.z));
        shapeNormal=normalize(shapeNormal*(1.-aiShape)+normalize(q/bulbScale)*uAiForms[0]+cubeNormal*uAiForms[1]+loopNormal*uAiForms[2]+plateNormal*uAiForms[3]+markNormal*uAiForms[4]);
      }
      vNormal=normalize(normalMatrix*shapeNormal);vPosition=position;vShapedPosition=shape;
      float wave=orbSurfaceWave(q,uTime,uSpeech,uBuild,uFusion);
      vec4 viewPosition=modelViewMatrix*vec4(shape+shapeNormal*(1.-uSolidShape)*(wave*(1.-.7*aiShape)+sin(position.y*7.+position.x*4.-uTime)*.16*(1.-uFormation)),1.);
      if(uFlight.y>0.){
        // Map the existing surface along the direction of flight before stretching it.
        vec2 forward=normalize(flightPoint(min(1.,uFlight.x+.004))-flightPoint(max(0.,uFlight.x-.004))+vec2(.0001,0.));
        vec3 direction=normalize(mat3(modelViewMatrix)*q);
        float axial=clamp(dot(direction.xy,forward),-1.,1.);
        float along=.5+.5*axial;
        float section=max(.0001,sqrt(max(0.,1.-axial*axial)));
        float lateral=dot(direction.xy,vec2(-forward.y,forward.x))/section;
        float depth=direction.z/section;
        float pathTime=mix(max(0.,uFlight.x-.43),min(1.,uFlight.x+.085),along);
        vec2 tangent=flightPoint(min(1.,pathTime+.004))-flightPoint(max(0.,pathTime-.004));
        vec2 side=normalize(vec2(-tangent.y,tangent.x)+vec2(.0001,0.));
        float radius=length(modelViewMatrix[0].xyz)*1.5;
        float taper=pow(max(0.,sin(along*3.14159265)),.72);
        float swell=1.+.18*sin(along*16.-uTime*4.)+.08*sin(along*29.+uTime*3.);
        float width=radius*taper*mix(.15,.63,along)*swell;
        float sway=radius*taper*(.09*sin(along*8.+uTime*2.5)+.045*sin(along*18.-uTime*3.));
        vec2 center=flightPoint(pathTime)-flightPoint(uFlight.x)+modelViewMatrix[3].xy;
        vec3 stream=vec3(center+side*(lateral*width+sway),modelViewMatrix[3].z+depth*width*.42);
        viewPosition.xyz=mix(viewPosition.xyz,stream,uFlight.y);
        vNormal=normalize(mix(vNormal,vec3(side*lateral*.48,depth),uFlight.y)+vec3(0.,0.,.0001));
        vPosition=mix(position,vec3(lateral*.65,(along-.5)*3.7,depth*.7)*1.5,uFlight.y);
      }
      gl_Position=projectionMatrix*viewPosition;}`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vPosition; uniform float uTime; uniform float uSpeech; uniform float uBuild; uniform float uFormation; uniform float uFusion; uniform float uReveal; uniform float uSpot; uniform float uCollisionGlow; uniform float uSolidShape; uniform float uDetailLight; uniform vec3 uTeamDirection;uniform vec3 uWorkflowTint;uniform float uWorkflowStrength;
      uniform float uObjectReveal; uniform float uRimStrength; uniform vec2 uFlight;
      varying vec3 vShapedPosition;
      uniform float uAiForms[${workflows.length}];
      ${workflowDissolve}
      ${workflowLiquid}
      void main(){
      if(uObjectReveal > 0. && workflowPixel(gl_FragCoord.xy) < uObjectReveal) discard;
      vec3 p=mix(vPosition,vShapedPosition,uObjectReveal)/mix(1.5,.84,uSolidShape);
      float t=uTime*.65;
      float flow,rim,ribbon;
      vec3 color=workflowLiquidColor(p,normalize(vNormal),t,uSpeech,uBuild,uRimStrength,flow,rim,ribbon);
      float highlightMask=pow(max(0.,dot(normalize(vPosition),normalize(uTeamDirection))),6.);
      color+=vec3(.25,.7,1.)*highlightMask*uSpot*.6;
      color+=vec3(.24,.72,1.)*rim*uCollisionGlow*.65;
      color=mix(color,color*.65+uWorkflowTint*(rim*.6+ribbon*.35),uWorkflowStrength);
      if(uSolidShape>.5) {
        vec3 blue=vec3(.06,.25,1.), pink=vec3(1.,.06,.58), cyan=vec3(.12,1.,.96);
        float sweep=clamp(.5+p.x*.38+p.y*.17+.08*sin(t+p.y*3.),0.,1.);
        vec3 spectrum=mix(mix(cyan,blue,smoothstep(.06,.49,sweep)),pink,smoothstep(.4,.86,sweep));
        vec3 filament=mix(spectrum,uWorkflowTint,.15);
        float reflection=pow(max(0.,dot(normalize(vNormal),normalize(vec3(-.3,.46,1.)))),16.);
        color=filament*(.50+ribbon*.24+rim*.24+uDetailLight*.52)
          +vec3(.79,.93,1.)*reflection*(.35+uDetailLight*.43);
      }
      float surface=smoothstep(0.,.22,uFormation-(.5+.5*sin(p.y*3.+flow*1.4))*(1.-uFormation));
      color=mix(vec3(.55,.9,1.),color,smoothstep(0.,.8,uFormation));
      gl_FragColor=vec4(color*(1.+uFusion*.55+uCollisionGlow*.4),.98*uReveal*surface*mix(1.,.86,uFlight.y)); }`,
    });
    const objectFinish = { value: 0 };
    const modelReveal = { value: 0 };
    const objectMelt = { value: 0 };
    const liquidCore = { value: new THREE.Vector4() };
    const liquidViewToOrb = { value: new THREE.Matrix3() };
    const liquidOrb = { value: new THREE.Vector2(1,1) };
    const orbView = new THREE.Matrix4();
    const finishedObjects = createWorkflowObjects({
      uObjectReveal: modelReveal,
      uObjectFinish: objectFinish,
      uObjectMelt: objectMelt,
      uLiquidCore: liquidCore,
      uLiquidViewToOrb: liquidViewToOrb,
      uLiquidOrb: liquidOrb,
      uTime: material.uniforms.uTime,
      uSpeech: material.uniforms.uSpeech,
      uWorkflowTint: material.uniforms.uWorkflowTint,
      uWorkflowStrength: material.uniforms.uWorkflowStrength,
    });
    const objectStage = new THREE.Group();
    objectStage.add(...finishedObjects);
    globe.add(objectStage);
    // A full UV grid retains the pole triangles when the sphere opens into a loop.
    const morphGeometry=new THREE.PlaneGeometry(1,1,80,64);
    const positions=morphGeometry.attributes.position,normals=morphGeometry.attributes.normal,uvs=morphGeometry.attributes.uv;
    for(let i=0;i<positions.count;i++){
      const a=uvs.getX(i)*Math.PI*2,b=(1-uvs.getY(i))*Math.PI;
      const x=Math.cos(a)*Math.sin(b),y=Math.sin(a)*Math.sin(b),z=Math.cos(b);
      positions.setXYZ(i,x*1.5,y*1.5,z*1.5);normals.setXYZ(i,x,y,z);
    }
    morphGeometry.computeBoundingSphere();morphGeometry.boundingSphere.radius=2;
    const sphere = new THREE.Mesh(morphGeometry,material);
    globe.add(sphere);
    const objectParts = [
      new THREE.Mesh(new THREE.CylinderGeometry(.33,.26,.49,40), material.clone()),
      new THREE.Mesh(new THREE.CapsuleGeometry(.155,1.19,6,20), material.clone()),
    ];
    objectParts[0].position.y = -.86;
    objectParts[1].position.y = -.38;
    objectParts[1].rotation.z = -.10;
    objectParts.forEach(part => {
      part.material.depthWrite = false;
      part.material.uniforms.uBuild.value = 1;
      part.visible = false;
      globe.add(part);
    });
    const glowMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      uniforms:{uGlow:{value:0},uTint:{value:new THREE.Vector3(.18,.65,1.)}},
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 vUv;uniform float uGlow;uniform vec3 uTint;void main(){float radius=length(vUv*2.-1.);float haze=exp(-radius*radius*4.)*(1.-smoothstep(.8,1.,radius));gl_FragColor=vec4(uTint,haze*uGlow*.65);}`});
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(2,2),glowMaterial);scene.add(glow);
    const radiationMaterial=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
      uniforms:{uOrigin:{value:new THREE.Vector2()},uDpr:{value:renderer.getPixelRatio()},uRadius:{value:0},uOpacity:{value:0}},
      vertexShader:`void main(){gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader:`uniform vec2 uOrigin;uniform float uDpr;uniform float uRadius;uniform float uOpacity;
        void main(){
          vec2 pixel=gl_FragCoord.xy/uDpr;
          vec2 delta=pixel-uOrigin;
          float distanceToCore=length(delta);
          float haze=exp(-distanceToCore*distanceToCore/max(1.,uRadius*uRadius*.36));
          float falloff=1.-smoothstep(uRadius*.5,max(1.,uRadius),distanceToCore);
          vec3 cyan=vec3(.12,.65,1.);vec3 violet=vec3(.52,.22,.83);
          vec3 tint=mix(cyan,violet,.5+.5*sin(atan(delta.y,delta.x)+.6));
          gl_FragColor=vec4(tint,haze*falloff*uOpacity*.32);
        }`,
    });
    const radiation=new THREE.Mesh(new THREE.PlaneGeometry(2,2),radiationMaterial);
    radiation.frustumCulled=false;radiation.renderOrder=-10;scene.add(radiation);
    const satellites = Array.from({length:qualities.length}, () => {
      const miniMaterial=new THREE.ShaderMaterial({
        transparent:true,
        depthWrite:false,
        depthTest:true,
        blending:THREE.AdditiveBlending,
        uniforms:{uTime:{value:0},uFocus:{value:0},uStrength:{value:1}},
        vertexShader:`varying vec2 vUv;
          void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uFocus;uniform float uStrength;
          void main(){
            vec2 p=vUv*2.-1.;float d=length(p);float angle=atan(p.y,p.x);
            float cycle=fract(uTime*.48);
            float ring=exp(-pow((d-(.12+cycle*.75))/.055,2.))*(1.-cycle);
            float echo=exp(-pow((d-(.12+fract(cycle+.5)*.75))/.075,2.))*.35;
            float core=exp(-d*d*70.);
            float tendril=pow(.5+.5*sin(angle*3.+d*14.-uTime*2.),5.)*exp(-d*5.);
            float edge=1.-smoothstep(.75,1.,d);
            float energy=(core+ring*.55+echo+tendril*.4)*edge;
            vec3 color=mix(vec3(.13,.8,1.),vec3(.8,.22,.9),.5+.5*sin(angle+uTime*.3));
            color=mix(color,vec3(.82,1.,1.),core*.75);
            gl_FragColor=vec4(color*(1.+uFocus*.4),clamp(energy*(.8+uFocus*.2)*uStrength,0.,1.));
          }`,
      });
      const mini=new THREE.Mesh(new THREE.PlaneGeometry(2,2),miniMaterial);
      scene.add(mini);
      return mini;
    });
    const teamIcons = teams.map((_, index) => createTeamIcon(index, material));
    scene.add(...teamIcons.map(icon => icon.group));
    const trails=qualities.map((_,index)=>{
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(96*3),3));
      geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(Array.from({length:48},(_,i)=>[i/47,0,i/47,1]).flat()),2));
      const indices=[];for(let i=0;i<47;i++)indices.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);
      geometry.setIndex(indices);
      const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
        uniforms:{uTint:{value:new THREE.Color(index%2?0xba79ff:0x61eaff)}},
        vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader:`varying vec2 vUv;uniform vec3 uTint;void main(){float filament=pow(1.-abs(vUv.y*2.-1.),2.);gl_FragColor=vec4(mix(uTint,vec3(.8,1.,1.),filament*.3),filament*pow(vUv.x,2.)*.6);}`});
      const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);return mesh;
    });
    const blastMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
      uniforms:{uOpacity:{value:0},uSpread:{value:0},uAge:{value:0},uViewport:{value:new THREE.Vector2()},uDpr:{value:renderer.getPixelRatio()}},
      vertexShader:`void main(){gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader:`uniform float uOpacity;uniform float uSpread;uniform float uAge;uniform vec2 uViewport;uniform float uDpr;
      void main(){vec2 p=(gl_FragCoord.xy/uDpr-uViewport*.5)/length(uViewport*.5);float d=length(p);float a=atan(p.y,p.x);
        float radius=.05+uSpread*1.4;float irregular=d+sin(a*3.+uAge)*.015+sin(a*7.-uAge*.4)*.008;
        float front=exp(-irregular*irregular/max(.015,radius*radius))*.6;float wake=exp(-d*d/max(.02,radius*radius))*.4;
        float ripple=.9+.1*sin(d*8.-uAge*1.4+sin(a*3.));vec3 tint=mix(vec3(.08,.5,1.),vec3(.62,.12,.72),.5+.5*sin(a+d*3.));
        float core=exp(-d*d/.018)*exp(-uAge*3.);
        float seed=exp(-d*d/.00018)*exp(-uAge*2.5);
        gl_FragColor=vec4(tint*(front+wake)*ripple+vec3(.6,.95,1.)*(core+seed*2.),(front*.22+wake*.24+core*.28+seed*.95)*uOpacity);}`});
    const blast=new THREE.Mesh(new THREE.PlaneGeometry(2,2),blastMaterial);blast.frustumCulled=false;blast.renderOrder=-9;scene.add(blast);
    const teamAuras = teams.map((_, index) => createTeamAura(index));
    scene.add(...teamAuras);
    const ribbons = [];
    for (let i = 0; i < 4; i++) {
      const ribbonMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uLayer: { value: i },
          uVisibility: { value: 0 },
          uTeamMode: { value: 0 },
          uImpact: { value: new THREE.Vector2() },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uRevealRadius: { value: 0 },
          uRevealFeather: { value: 160 },
        },
        vertexShader: `varying vec2 vUv;uniform float uTime;uniform float uLayer;void main(){vUv=uv;vec3 p=position;float phase=p.x*.48+uLayer*.9+uTime*.13;p.y+=sin(phase)*(.4+uLayer*.13)+sin(p.x*.19-uTime*.1)*.4;p.y-=1.0+uLayer*.12;p.z-=uLayer*.55;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
        fragmentShader: `varying vec2 vUv;uniform vec2 uImpact;uniform float uPixelRatio;uniform float uRevealRadius;uniform float uRevealFeather;uniform float uVisibility;uniform float uTeamMode;uniform float uTime;uniform float uLayer;void main(){float edge=pow(1.-vUv.y,9.);float body=sin(vUv.y*3.14159)*.14;float fade=smoothstep(0.,.12,vUv.x)*(1.-smoothstep(.88,1.,vUv.x));vec3 a=vec3(.06,.65,.95);vec3 b=vec3(.72,.12,.92);vec3 color=mix(a,b,.5+.5*sin(vUv.x*9.+uLayer+uTime*.08));vec2 screen=gl_FragCoord.xy/uPixelRatio/(uImpact*2.);float quiet=uImpact.x<350.?mix(1.,.16,smoothstep(.35,.7,screen.y)):mix(.2,1.,smoothstep(.28,.58,screen.x));quiet*=mix(1.,smoothstep(.38,.58,screen.y)*.6,uTeamMode);gl_FragColor=vec4(color*(.7+edge*.65),fade*(edge*.48+body)*(.9-uLayer*.13)*quiet*uVisibility*(1.-smoothstep(max(0.,uRevealRadius-uRevealFeather),max(.01,uRevealRadius),distance(gl_FragCoord.xy/uPixelRatio,uImpact))));}`,
      });
      const ribbon = new THREE.Mesh(
        new THREE.PlaneGeometry(34, 1.45, 180, 12),
        ribbonMaterial,
      );
      scene.add(ribbon);
      ribbons.push(ribbon);
    }
    const pointer = { x: 0, y: 0 };
    let inView = true;
    let sync = () => {};
    let frame,
      time = 0,
      last = 0;
    let lastSignature = "";
    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect =
        container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      lastSignature = "";
      sync();
    };
    const move = (e) => {
      if (e.pointerType === "touch") return;
      if (pauseRef.current) return;
      const f = motion.current;
      if (!f) return;
      pointer.x = THREE.MathUtils.clamp((e.clientX-f.x) / Math.max(f.radius*3,1), -1, 1);
      pointer.y = THREE.MathUtils.clamp((e.clientY-f.y) / Math.max(f.radius*3,1), -1, 1);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    const workflowColors=[new THREE.Vector3(.12,1.,.95),new THREE.Vector3(.64,.35,1.),new THREE.Vector3(1.,.15,.58),new THREE.Vector3(.32,.65,1.),new THREE.Vector3(.29,1.,.72)];
    const projectColors={enterprise:workflowColors[0],streaming:workflowColors[2],operations:workflowColors[1],hris:new THREE.Vector3(.3,1,.76)};
    const workflowMorph = { index: 0, age: 0, form: 0, finish: 0, liquidation: 0 };
    let actionIndex = -1, actionAge = 0;
    let aiMix = 0;
    const render = (now) => {
      frame = null;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!pauseRef.current && !document.hidden) time += dt;
      const f = motion.current;
      if (!f) { frame = requestAnimationFrame(render); return; }
      updateAvatar(f);
      container.style.zIndex=f.transitioning?'110':f.chapterTransit?'24':'';
      container.style.clipPath=`inset(${f.clipTop || 0}px 0 ${f.clipBottom || 0}px 0)`;
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * 8;
      const viewWidth = viewHeight * camera.aspect;
      globe.position.set((f.x / container.clientWidth - .5) * viewWidth,
        (.5 - f.y / container.clientHeight) * viewHeight, 0);
      radiation.visible=(f.radiationOpacity || 0)>.001;
      radiationMaterial.uniforms.uOrigin.value.set(f.x,container.clientHeight-f.y);
      radiationMaterial.uniforms.uRadius.value=f.radius*.3+(f.radiationSpread || 0)*Math.hypot(container.clientWidth,container.clientHeight);
      radiationMaterial.uniforms.uOpacity.value=f.radiationOpacity || 0;
      const flight=f.flight;
      const ambientSpeech=(f.dock || 0)*.16*(1-(flight?.amount ?? 0)*.8)*(1-(f.contactProgress || 0)*.7);
      const projectCharge = f.projectCharge ?? 0;
      glow.position.copy(globe.position);glow.position.z=-.5;
      glow.scale.setScalar(f.radius/container.clientHeight*viewHeight*(1.65 + 1.6 * projectCharge));
      blast.visible=(f.blast?.opacity || 0)>.001;
      blastMaterial.uniforms.uOpacity.value=f.blast?.opacity || 0;
      blastMaterial.uniforms.uSpread.value=f.blast?.spread || 0;
      blastMaterial.uniforms.uAge.value=f.blast?.age || 0;
      blastMaterial.uniforms.uViewport.value.set(container.clientWidth,container.clientHeight);
      trails.forEach((trail,i)=>{
        const history=f.qualityTrails?.[i];
        trail.visible=f.build<1 && !!history && f.satellites[i].visibility>0;
        if(!trail.visible)return;
        const positions=trail.geometry.attributes.position.array;
        history.forEach((point,j)=>{
          const next=history[Math.min(47,j+1)],previous=history[Math.max(0,j-1)];
          const dx=next.x-previous.x,dy=next.y-previous.y,len=Math.max(1,Math.hypot(dx,dy));
          const width=(.25+Math.pow(j/47,1.4)*4.5)*point.visibility;
          for(let side=0;side<2;side++){
            const sign=side===0?-1:1,offset=(j*2+side)*3;
            positions[offset]=globe.position.x+(point.x-dy/len*width*sign)/container.clientWidth*viewWidth;
            positions[offset+1]=globe.position.y-(point.y+dx/len*width*sign)/container.clientHeight*viewHeight;
            positions[offset+2]=point.z/container.clientHeight*viewHeight;
          }
        });trail.geometry.attributes.position.needsUpdate=true;
      });
      const chapter=f.chapter || 0;
      const workflow=f.workflow ?? {index:0,progress:0,pulse:0};
      const stageInfluence=(f.dock || 0)*(1-Math.min(1,chapter));
      aiMix=f.aiReady ? 1 : Math.max(0,Math.min(stageInfluence,aiMix-dt*3.5));
      const aiPulse=pauseRef.current?0:workflow.pulse*aiMix;
      if (f.aiReady) advanceWorkflowMorph(workflowMorph, workflow, dt * 1000, pauseRef.current);
      else if (aiMix===0 && (workflowMorph.processingAge || workflowMorph.age > 0 || workflowMorph.liquidation > 0)) {
        Object.assign(workflowMorph, { age: 0, form: 0, finish: 0, liquidation: 0, processingAge: 0 });
      }
      updateProcessing(workflowMorph.index, f.aiReady && !pauseRef.current &&
        workflowMorph.form === 0 && !workflowMorph.liquidation && workflowMorph.processingAge < PROCESSING_DURATION);
      const melting = workflowMorph.liquidation > 0;
      const melt = melting ? Math.min(1, workflowMorph.liquidation + (1 - aiMix)) : 0;
      objectMelt.value = melt;
      const formUniform = material.uniforms.uAiForms.value;
      formUniform.fill(0);
      if (!melting) formUniform[workflowMorph.index] = easeWorkflowMorph(workflowMorph.form) * aiMix;
      const finish = easeWorkflowMorph(workflowMorph.finish);
      const orbReveal = f.orbReveal ?? 1;
      const objectReveal = THREE.MathUtils.smoothstep(formUniform[workflowMorph.index], .42, .96) * orbReveal;
      material.uniforms.uObjectReveal.value = objectReveal;
      // On the way back the model keeps its full surface until it folds inside the orb.
      modelReveal.value = melting ? 1 : objectReveal;
      objectFinish.value = finish * THREE.MathUtils.smoothstep(aiMix, .93, 1);
      if (stageInfluence > .68 && !studioReady) prepareStudio();
      if (actionIndex !== workflowMorph.index || modelReveal.value === 0) {
        actionIndex = workflowMorph.index;
        actionAge = 0;
      }
      if (!pauseRef.current && (objectFinish.value > .9 || actionAge > 0)) {
        actionAge = Math.min(1700, actionAge + dt * 1000);
      }
      let bulbGlow = 0;
      finishedObjects.forEach((model, index) => {
        model.visible = index === actionIndex && modelReveal.value > 0 && orbReveal > 0 && melt < .99;
        if (model.visible) bulbGlow = model.animate(actionAge, objectFinish.value, pauseRef.current) ?? 0;
      });
      animateWorkflowIdle(objectStage, time, objectFinish.value, pauseRef.current);
      const glowAmount = orbReveal * Math.max(f.collisionGlow || 0, ambientSpeech, bulbGlow * .43, projectCharge * 1.7);
      glow.visible = glowAmount > .001;
      glowMaterial.uniforms.uGlow.value = glowAmount;
      glowMaterial.uniforms.uTint.value.set(.18 + .82 * bulbGlow, .65 + .24 * bulbGlow, 1 - .86 * bulbGlow);
      const tint=chapter>.5 && chapter<1.5 ? (projectColors[f.project] ?? projectColors.hris) : workflowColors[workflowMorph.index];
      material.uniforms.uMorph.value.set(f.lens || 0,f.loop || 0);
      material.uniforms.uWorkflowTint.value.lerp(tint,pauseRef.current?1:1-Math.exp(-dt*4));
      material.uniforms.uWorkflowStrength.value=aiMix*(.22+workflow.progress*.16+aiPulse*.22)+(f.lens || 0)*.42;
      objectParts.forEach((part, index) => {
        const visibility = THREE.MathUtils.smoothstep(formUniform[index], .22, .95);
        part.visible = visibility > .001 && objectReveal < 1;
        if (!part.visible) return;
        part.scale.setScalar(.45 + visibility * .55);
        const uniforms = part.material.uniforms;
        uniforms.uReveal.value = visibility * orbReveal;
        uniforms.uTime.value = time;
        uniforms.uWorkflowTint.value.copy(material.uniforms.uWorkflowTint.value);
        uniforms.uWorkflowStrength.value = material.uniforms.uWorkflowStrength.value;
        uniforms.uObjectReveal.value = objectReveal;
      });
      const settledFinish = finish * aiMix;
      const speech=(pauseRef.current?.16:speechEnvelope(time)*aiMix*(.85+workflow.progress*.25))*(1-.86*settledFinish);
      material.uniforms.uSpeech.value=speech;
      const fusion=f.fusion || 0;
      const impact=pauseRef.current?0:(f.impactBreath || 0);
      const breath = 1 + Math.sin(time * .9) * .025*(1-.8*settledFinish) + fusion*.045 + impact*.12 + aiPulse*.045;
      globe.scale.setScalar(f.radius / container.clientHeight * viewHeight / 1.5 * breath);
      const squash = f.avatarSquash ?? 0;
      const waking = f.avatarWake ?? 0;
      globe.scale.x*=(1-fusion*.05)*(1+.39*squash)*(1-.08*waking);
      globe.scale.y*=(1+fusion*.08)*(1-.7*squash)*(1+.15*waking);
      const coreAlpha = melting ? THREE.MathUtils.smoothstep(melt, .34, .96) : 1;
      const coreScale = melting ? .42 + .58 * THREE.MathUtils.smoothstep(melt, .26, .98) : 1;
      const coreRim = melting ? THREE.MathUtils.smoothstep(melt, .65, .94) : 1;
      liquidOrb.value.set(coreScale,coreRim);
      material.uniforms.uRimStrength.value=coreRim;
      sphere.scale.setScalar(coreScale);
      sphere.renderOrder = melting ? 1 : 0;
      sphere.frustumCulled = !flight;
      sphere.visible = orbReveal * coreAlpha > 0 && objectReveal < 1;
      satellites.forEach((mini,i)=>{
        const p=f.satellites?.[i];
        mini.visible=!!p && p.visibility>0;
        if(!p) return;
        mini.position.set(globe.position.x+p.x/container.clientWidth*viewWidth,
          globe.position.y-p.y/container.clientHeight*viewHeight,p.z/container.clientHeight*viewHeight);
        const selected=i===f.selected;
        mini.scale.setScalar((p.size ?? (selected?18:11))*p.visibility/container.clientHeight*viewHeight*1.3*(.95+.05*Math.sin(time*1.25+i)));
        // Camera-facing energy ripples still respect the main orb’s depth.
        mini.material.uniforms.uTime.value=time+i*.7;
        const desiredFocus=(selected?1:0)+(f.compression || 0)*.7;
        mini.material.uniforms.uFocus.value=pauseRef.current?desiredFocus:THREE.MathUtils.lerp(mini.material.uniforms.uFocus.value,desiredFocus,1-Math.exp(-dt*10));
        if(i>=qualities.length && !selected) mini.scale.multiplyScalar(.8);
        mini.material.uniforms.uStrength.value=i<qualities.length || selected ? 1 : .45;
      });
      teamIcons.forEach((icon,i)=>{
        const p=f.satellites?.[qualities.length+i];
        const selected=f.selected===qualities.length+i;
        icon.group.visible=!!p && p.visibility>.005;
        const aura = teamAuras[i];
        aura.visible = icon.group.visible;
        if(!icon.group.visible)return;
        const base=(container.clientWidth<=700?19.8:35)/container.clientHeight*viewHeight;
        const desired=selected?1.2:.92;
        icon.group.userData.emphasis=pauseRef.current?desired:THREE.MathUtils.lerp(icon.group.userData.emphasis ?? 1,desired,1-Math.exp(-dt*7));
        icon.group.scale.setScalar(base*p.visibility*(1-(p.pull || 0)*.45)*icon.group.userData.emphasis);
        icon.group.position.set(globe.position.x+p.x/container.clientWidth*viewWidth,
          globe.position.y-p.y/container.clientHeight*viewHeight,p.z/container.clientHeight*viewHeight);
        icon.group.rotation.set(.15,-.2,0);
        icon.animate(time,icon.group.userData.emphasis);
        const connection = aura.material.uniforms;
        connection.uCore.value.copy(globe.position);
        connection.uTeam.value.copy(icon.group.position);
        connection.uTime.value = time;
        connection.uWidth.value = (container.clientWidth <= 700 ? 9.6 : 14.4) * viewHeight / container.clientHeight;
        connection.uStrength.value = p.visibility * (.44 + (icon.group.userData.emphasis - .92) * 1.15);
      });
      const selectedPoint=f.satellites?.[f.selected];
      if(selectedPoint) material.uniforms.uTeamDirection.value.set(selectedPoint.x,-selectedPoint.y,Math.max(20,selectedPoint.z)).normalize();
      material.uniforms.uSpot.value=f.shimmer || 0;
      material.uniforms.uCollisionGlow.value=Math.max(f.collisionGlow || 0,aiPulse*.45,projectCharge * 2.1);
      camera.position.x = 0;
      camera.position.y = 0;
      ribbons.forEach((r) => {
        r.material.uniforms.uTime.value = time;
        r.material.uniforms.uVisibility.value = f.horizon;
        r.material.uniforms.uTeamMode.value = f.teamMode || 0;
        r.material.uniforms.uRevealFeather.value = f.revealFeather ?? 160;
        r.material.uniforms.uImpact.value.set(container.clientWidth*.5,container.clientHeight*.5);
        r.material.uniforms.uRevealRadius.value = f.revealRadius ?? Math.hypot(container.clientWidth,container.clientHeight)*3;
      });
      const formMix=Math.max(f.lens || 0,f.loop || 0,aiMix);
      globe.rotation.y = time*.045*(1-formMix) - aiMix*.24 + (pauseRef.current ? 0 : pointer.x*.12+Math.sin(time*.2)*.22*formMix);
      globe.rotation.x = .12 + (f.loop || 0)*.28 - aiMix*.12 + (pauseRef.current ? 0 : pointer.y*.08+Math.sin(time*.38)*.08*aiMix);
      globe.rotation.z = (f.lens || 0)*-.18+(f.loop || 0)*(.22+Math.sin(time*.18)*.12);

      if (melting) {
        globe.updateMatrix();
        orbView.multiplyMatrices(camera.matrixWorldInverse, globe.matrix);
        const origin = orbView.elements;
        liquidCore.value.set(origin[12], origin[13], origin[14], globe.scale.x * 1.5);
        liquidViewToOrb.value.setFromMatrix4(orbView.invert());
      }
      material.uniforms.uTime.value = time;
      material.uniforms.uFlight.value.set(flight?.progress ?? 0,flight?.amount ?? 0);
      if(flight) {
        const [a,b,c,d]=flight.curve;
        const worldX=x=>(x/container.clientWidth-.5)*viewWidth;
        const worldY=y=>(.5-y/container.clientHeight)*viewHeight;
        material.uniforms.uFlightX.value.set(worldX(a.x),worldX(b.x),worldX(c.x),worldX(d.x));
        material.uniforms.uFlightY.value.set(worldY(a.y),worldY(b.y),worldY(c.y),worldY(d.y));
      }
      material.uniforms.uBuild.value = f.build;
      material.uniforms.uFormation.value = f.formation ?? 1;
      material.uniforms.uFusion.value = fusion+impact*.35;
      material.uniforms.uReveal.value = orbReveal * coreAlpha;
      const signature = `${f.x.toFixed(2)},${f.y.toFixed(2)},${f.radius.toFixed(2)},${f.horizon.toFixed(2)},${f.orbReveal},${f.selected},${f.lens},${f.loop},${f.project},${workflow.index},${f.aiReady}`;
      if (canAnimate(pauseRef.current, document.hidden, inView) || signature !== lastSignature) {
        renderer.render(scene, camera);
        lastSignature = signature;
      }
      if (!document.hidden)
        frame = requestAnimationFrame(render);
    };
    sync = () => {
      cancelAnimationFrame(frame);
      frame = null;
      last = performance.now();
      if (!document.hidden && inView) frame = requestAnimationFrame(render);
    };
    syncRef.current = sync;
    const intersection = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    });
    intersection.observe(container);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      syncRef.current = null;
      intersection.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      const materials = new Set();
      scene.traverse(o => {
        o.geometry?.dispose();
        if (o.material) materials.add(o.material);
      });
      materials.forEach(material => {
        material.map?.dispose();
        material.dispose();
      });
      studioEnvironment?.dispose();
      resizeObserver.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div className="scene cinematic-scene" ref={host} aria-hidden="true">
    <div className="orb-avatar-face" ref={avatar} hidden><i/><i/></div>
  </div>;
}
