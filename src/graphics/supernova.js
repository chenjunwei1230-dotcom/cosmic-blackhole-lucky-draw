import * as THREE from 'three';

// ─── Supernova Visual Effect ──────────────────────────────────
export class SupernovaEffect {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.progress = 0;
    this.duration = 1.8; // seconds

    this._buildShockwaveRing();
    this._buildBurstParticles();
    this._buildCoreFlash();
  }

  // ── Shockwave Ring ───────────────────────────────────────────
  _buildShockwaveRing() {
    const geo = new THREE.TorusGeometry(0.6, 0.12, 16, 96);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uProgress: { value: 0 } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fade = 1.0 - smoothstep(0.15, 0.85, uProgress);
          float rim = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.5);
          vec3 gold = vec3(1.6, 1.3, 0.4);
          vec3 white = vec3(1.8, 1.8, 1.6);
          vec3 color = mix(white, gold, smoothstep(0.0, 0.4, uProgress));
          float alpha = (0.7 + rim * 0.3) * fade;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.shockwave = new THREE.Mesh(geo, mat);
    this.shockwave.rotation.x = -Math.PI * 0.38;
    this.shockwave.frustumCulled = false;
    this.shockwave.visible = false;
    this.scene.add(this.shockwave);
  }

  // ── Burst Particles ──────────────────────────────────────────
  _buildBurstParticles() {
    const count = 1000;
    const geo = new THREE.BufferGeometry();
    const positions  = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors     = new Float32Array(count * 3);
    const sizes      = new Float32Array(count);
    const lifetimes  = new Float32Array(count);

    const gold   = new THREE.Color(0xf5d061).multiplyScalar(1.6);
    const orange = new THREE.Color(0xe5a93b).multiplyScalar(1.4);
    const white  = new THREE.Color(0xfff8ee).multiplyScalar(1.5);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const speed = 0.8 + Math.random() * 4.5;

      velocities[i * 3]     = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed * 0.55;
      velocities[i * 3 + 2] = Math.cos(phi) * speed * 0.35;

      sizes[i]     = 1.2 + Math.random() * 3.5;
      lifetimes[i] = 0.25 + Math.random() * 0.75;

      const pick = Math.random();
      const col = pick > 0.55 ? gold : pick > 0.25 ? orange : white;
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position',  new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute('aColor',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',     new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aLife',     new THREE.BufferAttribute(lifetimes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uProgress: { value: 0 } },
      vertexShader: `
        uniform float uProgress;
        attribute vec3 aVelocity;
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aLife;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;
          float t = uProgress;
          vec3 pos = aVelocity * t * 6.0;
          pos *= 1.0 - t * t * 0.25;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;
          float viewDist = max(-mvPos.z, 0.5);
          gl_PointSize = clamp(aSize * (200.0 / viewDist) * (1.0 - t * 0.55), 0.0, 60.0);

          vAlpha = 1.0 - smoothstep(aLife * 0.35, aLife, uProgress);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float s = pow(1.0 - smoothstep(0.0, 0.5, d), 1.6);
          gl_FragColor = vec4(vColor, vAlpha * s);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.burst = new THREE.Points(geo, mat);
    this.burst.frustumCulled = false;
    this.burst.visible = false;
    this.scene.add(this.burst);
  }

  // ── Core Flash Sphere ────────────────────────────────────────
  _buildCoreFlash() {
    const geo = new THREE.SphereGeometry(0.5, 24, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.coreFlash = new THREE.Mesh(geo, mat);
    this.coreFlash.frustumCulled = false;
    this.coreFlash.visible = false;
    this.scene.add(this.coreFlash);
  }

  // ── Public API ───────────────────────────────────────────────
  trigger() {
    this.active = true;
    this.progress = 0;
    this.shockwave.visible = true;
    this.shockwave.scale.set(1, 1, 1);
    this.burst.visible = true;
    this.coreFlash.visible = true;
    this.coreFlash.material.opacity = 1;
    this.coreFlash.scale.set(1, 1, 1);
  }

  update(delta) {
    if (!this.active) return;

    this.progress += delta / this.duration;
    const p = Math.min(this.progress, 1.0);

    // Shockwave ring: expand outward
    const ringScale = 1.0 + p * 12.0;
    this.shockwave.scale.set(ringScale, ringScale, ringScale);
    this.shockwave.material.uniforms.uProgress.value = p;

    // Burst particles
    this.burst.material.uniforms.uProgress.value = p;

    // Core flash: bright spike then fade
    const flashIntensity = p < 0.15
      ? p / 0.15
      : Math.max(0, 1.0 - (p - 0.15) / 0.4);
    this.coreFlash.material.opacity = flashIntensity;
    this.coreFlash.scale.setScalar(1 + p * 3);

    if (p >= 1.0) {
      this.active = false;
      this.shockwave.visible = false;
      this.burst.visible = false;
      this.coreFlash.visible = false;
    }
  }

  /** Returns 0→1 intensity for bloom boost */
  getBloomBoost() {
    if (!this.active) return 0;
    return this.progress < 0.3
      ? this.progress / 0.3
      : Math.max(0, 1.0 - (this.progress - 0.3) / 0.7);
  }

  reset() {
    this.active = false;
    this.progress = 0;
    this.shockwave.visible = false;
    this.burst.visible = false;
    this.coreFlash.visible = false;
  }
}
