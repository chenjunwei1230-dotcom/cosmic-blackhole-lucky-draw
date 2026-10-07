import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { AccretionDiskShader } from './shaders.js';
import { SupernovaEffect } from './supernova.js';
import { SaturnRing } from './saturnRing.js';
import { States } from '../core/fsm.js';

export class CosmicScene {
  constructor(container) {
    this.container = container;
    this.collapseProgress = 0.0;
    this.currentState = States.IDLE;
    this.baseBloomStrength = 0.35;

    this.init();
    this.setupPostProcessing();
    this.buildBlackHole();
    this.buildDistantStarfield();
    this.saturnRing = new SaturnRing(this.scene);
    this.supernova = new SupernovaEffect(this.scene, this.camera);
    this.bindEvents();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020206);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    // Camera angle: 12.0° elevation matching user's Saturn photo
    this.camera.position.set(0, 1.45, 6.8);
    this.camera.lookAt(0, 0, 0);

    // Realistic cosmic lighting for Saturn's globe & rings
    this.ambientLight = new THREE.AmbientLight(0xfff5e6, 0.7);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaea, 1.8);
    this.sunLight.position.set(4, 5, 8);
    this.scene.add(this.sunLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x020206, 1.0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
  }

  setupPostProcessing() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.composer = new EffectComposer(this.renderer);
    
    // 基础渲染通道 - 深空背景
    const renderPass = new RenderPass(this.scene, this.camera);
    renderPass.clearColor = new THREE.Color(0x020206);
    renderPass.clearAlpha = 1.0;
    this.composer.addPass(renderPass);

    // 精细辉光通道：阈值 0.85，强度 0.35，光晕扩散 0.45
    const bloomResolution = new THREE.Vector2(Math.floor(width * 0.5), Math.floor(height * 0.5));
    this.bloomPass = new UnrealBloomPass(bloomResolution, 0.35, 0.45, 0.85);
    this.composer.addPass(this.bloomPass);

    // 颜色校正通道
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  buildBlackHole() {
    this.blackHoleGroup = new THREE.Group();
    // Subtle natural inclination matching Saturn's flat ring angle
    this.blackHoleGroup.rotation.z = -0.04;
    this.scene.add(this.blackHoleGroup);

    // 1. Black Hole Singularity Event Horizon (pure void-black sphere)
    const coreGeo = new THREE.SphereGeometry(1.12, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true });
    this.blackHoleCore = new THREE.Mesh(coreGeo, coreMat);
    this.blackHoleCore.renderOrder = 10;
    this.blackHoleGroup.add(this.blackHoleCore);

    // 2. Relativistic Photon Ring Inner Rim (blazing white-gold rim around horizon)
    const photonGeo = new THREE.RingGeometry(1.12, 1.25, 180, 1);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xfff0c8,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.photonRing = new THREE.Mesh(photonGeo, photonMat);
    this.photonRing.rotation.x = -Math.PI / 2;
    this.blackHoleGroup.add(this.photonRing);

    // 3. Relativistic Accretion Disk (horizontal X-Z plane, matching Saturn ring tilt)
    const innerRadius = 1.22;
    const outerRadius = 4.35;
    const diskGeo = new THREE.RingGeometry(innerRadius, outerRadius, 180, 1);

    this.diskMaterial = new THREE.ShaderMaterial({
      vertexShader: AccretionDiskShader.vertexShader,
      fragmentShader: AccretionDiskShader.fragmentShader,
      uniforms: {
        uInnerRadius: { value: innerRadius },
        uOuterRadius: { value: outerRadius },
        uTime: { value: 0.0 },
        uCollapseProgress: { value: 0.0 }
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true
    });

    this.accretionDisk = new THREE.Mesh(diskGeo, this.diskMaterial);
    // Lie horizontally in X-Z plane
    this.accretionDisk.rotation.x = -Math.PI / 2;
    this.blackHoleGroup.add(this.accretionDisk);
  }


  buildDistantStarfield() {
    const starCount = 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const cyanStar = new THREE.Color(0x60c0f0);
    const goldStar = new THREE.Color(0xf0d080);
    const whiteStar = new THREE.Color(0xcccccc);

    for (let i = 0; i < starCount; i++) {
      // 恒星严格在负 Z 深空背景
      positions[i * 3]     = (Math.random() - 0.5) * 75.0;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50.0;
      positions[i * 3 + 2] = -18.0 - Math.random() * 45.0;

      const randCol = Math.random();
      const col = randCol > 0.65 ? goldStar : randCol > 0.35 ? cyanStar : whiteStar;
      const brightness = 0.2 + Math.random() * 0.4;

      colors[i * 3]     = col.r * brightness;
      colors[i * 3 + 1] = col.g * brightness;
      colors[i * 3 + 2] = col.b * brightness;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(geo, starMaterial);
    this.starfield.frustumCulled = false;
    this.scene.add(this.starfield);
  }

  updateState(state) {
    this.currentState = state;
    if (state === States.IDLE && this.saturnRing) {
      this.saturnRing.reset();
    }
  }

  setWinnerFocus(winnerId) {
    if (this.saturnRing) {
      this.saturnRing.setWinnerFocus(winnerId);
    }
  }

  triggerSupernova() {
    this.supernova.trigger();
  }

  render() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.currentState === States.COLLAPSING || this.currentState === States.STOPPING) {
      this.collapseProgress = Math.min(this.collapseProgress + delta * 0.45, 1.0);
    } else if (this.currentState === States.IDLE) {
      this.collapseProgress = Math.max(this.collapseProgress - delta * 0.8, 0.0);
    }

    if (this.diskMaterial && this.diskMaterial.uniforms) {
      this.diskMaterial.uniforms.uTime.value = elapsedTime;
      this.diskMaterial.uniforms.uCollapseProgress.value = this.collapseProgress;
    }

    // 远景微弱旋转
    if (this.starfield) {
      this.starfield.rotation.z += delta * 0.002;
    }

    // Accretion disk spin
    if (this.accretionDisk) {
      const spinFactor = 1.0 + this.collapseProgress * 3.5;
      this.accretionDisk.rotation.z += delta * 0.02 * spinFactor;
    }

    // 3D 候选人土星环运动
    if (this.saturnRing) {
      this.saturnRing.update(delta, this.currentState, this.collapseProgress);
    }

    // Supernova fireworks update + refined bloom
    this.supernova.update(delta);
    const boost = this.supernova.getBloomBoost();
    this.bloomPass.strength = this.baseBloomStrength + boost * 0.25;

    // 后处理渲染
    this.composer.render();
    requestAnimationFrame(() => this.render());
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.composer.setSize(width, height);
      this.bloomPass.setSize(Math.floor(width * 0.5), Math.floor(height * 0.5));
    });
  }
}
