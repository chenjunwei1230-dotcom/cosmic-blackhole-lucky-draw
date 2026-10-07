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
    this.supernova = new SupernovaEffect(this.scene);
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
    this.camera.position.set(0, 0.15, 8.8);

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
    // 1. 黑洞纯黑视界奇点 (renderOrder 设高确保遮挡后方吸积盘)
    const coreGeo = new THREE.SphereGeometry(0.74, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true });
    this.blackHoleCore = new THREE.Mesh(coreGeo, coreMat);
    this.blackHoleCore.renderOrder = 10;
    this.blackHoleCore.frustumCulled = false;
    this.scene.add(this.blackHoleCore);

    // 2. 双色吸积盘
    const diskGeo = new THREE.PlaneGeometry(6.6, 6.6);
    this.diskMaterial = new THREE.ShaderMaterial({
      vertexShader: AccretionDiskShader.vertexShader,
      fragmentShader: AccretionDiskShader.fragmentShader,
      uniforms: {
        uTime: { value: 0.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.accretionDisk = new THREE.Mesh(diskGeo, this.diskMaterial);
    this.accretionDisk.rotation.x = -Math.PI * 0.38;
    this.accretionDisk.frustumCulled = false;
    this.scene.add(this.accretionDisk);
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

    this.diskMaterial.uniforms.uTime.value = elapsedTime;

    // 远景微弱旋转
    if (this.starfield) {
      this.starfield.rotation.z += delta * 0.002;
    }

    // 吸积盘加速旋转
    const spinFactor = 1.0 + this.collapseProgress * 3.5;
    this.accretionDisk.rotation.z += delta * 0.16 * spinFactor;

    // 3D 候选人土星环运动
    if (this.saturnRing) {
      this.saturnRing.update(delta, this.currentState, this.collapseProgress);
    }

    // Supernova effect update + dynamic bloom boost
    this.supernova.update(delta);
    const boost = this.supernova.getBloomBoost();
    this.bloomPass.strength = this.baseBloomStrength + boost * 0.9;

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
