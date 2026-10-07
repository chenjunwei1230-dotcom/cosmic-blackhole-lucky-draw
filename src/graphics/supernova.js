import * as THREE from 'three';

/**
 * SupernovaEffect - Grand Celebration Fireworks System (盛典礼花绽放系统)
 * Inspired by top Three.js fireworks simulations:
 * - Spherical pyrotechnic starburst with gravity-driven weeping willow arcs (金柳流瀑)
 * - Individual particle physics: drag deceleration, gravitational curvature, and high-frequency sparkle flicker
 * - Festive color palette: Imperial Gold, Champagne White, Radiant Amber, and Diamond Starlight
 * - Elegant starlight shockwave ring that harmonizes with the fireworks
 */
export class SupernovaEffect {
  constructor(scene, camera = null) {
    this.scene = scene;
    this.camera = camera;
    this.active = false;
    this.progress = 0;
    this.duration = 2.2; // Fireworks blossom & graceful gravity fall duration

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.cameraBasePos = new THREE.Vector3();
    if (this.camera) {
      this.cameraBasePos.copy(this.camera.position);
    }

    this._buildFireworkStars();
    this._buildGlitterSparks();
    this._buildCelebrationRing();
  }

  setCamera(camera) {
    this.camera = camera;
    if (camera) {
      this.cameraBasePos.copy(camera.position);
    }
  }

  // ── 1. Primary Firework Star Shell (1400 Golden Willow Stars) ──
  _buildFireworkStars() {
    const count = 1400;
    const geo = new THREE.BufferGeometry();
    const positions   = new Float32Array(count * 3);
    const velocities  = new Float32Array(count * 3);
    const colors      = new Float32Array(count * 3);
    const sizes       = new Float32Array(count);
    const decays      = new Float32Array(count);
    const twinkles    = new Float32Array(count);

    // Celebratory pyrotechnic color palette
    const gold        = new THREE.Color(0xffd055);
    const champagne   = new THREE.Color(0xfff5dd);
    const amber       = new THREE.Color(0xff9922);
    const diamondCyan = new THREE.Color(0xb8f0ff);
    const rubySpark   = new THREE.Color(0xff5577);

    for (let i = 0; i < count; i++) {
      // Spherical shell explosion distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Slight upward lift (firework shell physics)
      const speed = 3.2 + Math.random() * 5.8;

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = (Math.cos(phi) * 0.9 + 0.35) * speed;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      velocities[i * 3]     = vx;
      velocities[i * 3 + 1] = vy;
      velocities[i * 3 + 2] = vz;

      positions[i * 3]     = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Color choice: 60% Gold, 20% Champagne, 10% Amber, 5% Cyan, 5% Ruby
      const p = Math.random();
      let col = gold;
      if (p > 0.95) col = rubySpark;
      else if (p > 0.90) col = diamondCyan;
      else if (p > 0.70) col = champagne;
      else if (p > 0.60) col = amber;

      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i]    = 2.2 + Math.random() * 2.8;
      decays[i]   = 1.4 + Math.random() * 0.8; // Life duration per star
      twinkles[i] = 20.0 + Math.random() * 45.0; // Glitter frequency
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aDecay', new THREE.BufferAttribute(decays, 1));
    geo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        attribute vec3 aVelocity;
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aDecay;
        attribute float aTwinkle;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;
          float t = uTime;

          // Drag integral: velocity diminishes gracefully
          float drag = (1.0 - exp(-t * 2.2)) / 2.2;
          vec3 pos = aVelocity * drag;

          // Gravity arc: stars curve downward like weeping willows
          pos.y -= 0.5 * 2.8 * t * t;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;

          float viewDist = max(-mvPos.z, 0.5);

          // Life ratio
          float life = clamp(1.0 - (t / aDecay), 0.0, 1.0);

          // Authentic gunpowder sparkle & twinkle
          float twinkle = 0.7 + 0.3 * sin(t * aTwinkle);
          vAlpha = pow(life, 1.4) * twinkle;

          gl_PointSize = clamp(aSize * (230.0 / viewDist) * life, 0.0, 48.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float d = length(coord);
          if (d > 0.5) discard;

          // Real firework star profile: dense incandescent core with burning ember halo
          float core = pow(1.0 - d * 2.0, 3.0);
          float halo = pow(1.0 - d * 2.0, 1.3);
          float intensity = core * 0.75 + halo * 0.25;

          gl_FragColor = vec4(vColor, vAlpha * intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(geo, mat);
    this.stars.frustumCulled = false;
    this.stars.visible = false;
    this.group.add(this.stars);
  }

  // ── 2. Secondary Chrysanthemum Glitter Sparks (400 Micro Sparks)
  _buildGlitterSparks() {
    const count = 450;
    const geo = new THREE.BufferGeometry();
    const positions  = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors     = new Float32Array(count * 3);
    const sizes      = new Float32Array(count);
    const delays     = new Float32Array(count);

    const goldSpark  = new THREE.Color(0xffe288);
    const whiteSpark = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.5 + Math.random() * 4.2;

      velocities[i * 3]     = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = (Math.cos(phi) * 0.8 + 0.2) * speed;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      positions[i * 3]     = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const col = Math.random() > 0.4 ? goldSpark : whiteSpark;
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i]  = 1.2 + Math.random() * 2.0;
      delays[i] = Math.random() * 0.35; // Staggered crackle bursts
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        attribute vec3 aVelocity;
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aDelay;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;
          float t = max(0.0, uTime - aDelay);

          float drag = (1.0 - exp(-t * 3.0)) / 3.0;
          vec3 pos = aVelocity * drag;
          pos.y -= 0.5 * 3.2 * t * t;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;

          float viewDist = max(-mvPos.z, 0.5);
          float life = clamp(1.0 - (t / 1.5), 0.0, 1.0);
          float glitter = 0.5 + 0.5 * sin(t * 55.0);

          vAlpha = (t <= 0.0) ? 0.0 : pow(life, 2.0) * glitter;
          gl_PointSize = clamp(aSize * (200.0 / viewDist) * life, 0.0, 36.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float s = pow(1.0 - d * 2.0, 2.2);
          gl_FragColor = vec4(vColor, vAlpha * s);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.glitter = new THREE.Points(geo, mat);
    this.glitter.frustumCulled = false;
    this.glitter.visible = false;
    this.group.add(this.glitter);
  }

  // ── 3. Subtle Celebration Starlight Ring (Stage Pyrotechnics) ───
  _buildCelebrationRing() {
    const geo = new THREE.RingGeometry(0.5, 0.85, 96, 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 }
      },
      vertexShader: `
        varying vec2 vPos;
        void main() {
          vPos = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        varying vec2 vPos;
        void main() {
          float r = length(vPos);
          float ring = smoothstep(0.5, 0.65, r) * (1.0 - smoothstep(0.70, 0.85, r));
          float fade = 1.0 - smoothstep(0.05, 0.65, uProgress);
          vec3 gold = vec3(1.2, 0.95, 0.45);
          gl_FragColor = vec4(gold, ring * fade * 0.75);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.ring = new THREE.Mesh(geo, mat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.frustumCulled = false;
    this.ring.visible = false;
    this.group.add(this.ring);
  }

  // ── Public API ───────────────────────────────────────────────
  trigger() {
    this.active = true;
    this.progress = 0;

    this.stars.visible = true;
    this.glitter.visible = true;
    this.ring.visible = true;
    this.ring.scale.set(1, 1, 1);

    if (this.camera && this.cameraBasePos.lengthSq() > 0) {
      this.camera.position.copy(this.cameraBasePos);
    }
  }

  update(delta) {
    if (!this.active) return;

    this.progress += delta;
    const t = this.progress;
    const normP = Math.min(t / this.duration, 1.0);

    // Update fireworks physics timers
    this.stars.material.uniforms.uTime.value = t;
    this.glitter.material.uniforms.uTime.value = t;

    // Celebration ring expansion
    const ringScale = 1.0 + Math.pow(normP, 0.4) * 11.0;
    this.ring.scale.set(ringScale, ringScale, 1.0);
    this.ring.material.uniforms.uProgress.value = normP;

    // Subtle tactile pop shake on initial firework burst (first 120ms)
    if (this.camera && t < 0.12) {
      const decay = 1.0 - t / 0.12;
      const shakeY = Math.sin(t * 70.0) * 0.03 * decay;
      this.camera.position.set(
        this.cameraBasePos.x,
        this.cameraBasePos.y + shakeY,
        this.cameraBasePos.z
      );
    } else if (this.camera && t >= 0.12 && t < 0.20) {
      this.camera.position.lerp(this.cameraBasePos, 0.3);
    }

    if (normP >= 1.0) {
      this.reset();
    }
  }

  getBloomBoost() {
    if (!this.active) return 0;
    // Crisp initial pop flash peaking at 0.05s then gracefully settles
    return this.progress < 0.08
      ? (this.progress / 0.08) * 0.25
      : Math.max(0, 0.25 * (1.0 - (this.progress - 0.08) / 0.45));
  }

  reset() {
    this.active = false;
    this.progress = 0;
    this.stars.visible = false;
    this.glitter.visible = false;
    this.ring.visible = false;

    if (this.camera && this.cameraBasePos.lengthSq() > 0) {
      this.camera.position.copy(this.cameraBasePos);
    }
  }
}
