import * as THREE from 'three';

/**
 * SupernovaEffect - Bespoke Luxury Relativistic Black Hole Detonation
 * Adheres strictly to frontend-design principles:
 * - Anti-generic: Relativistic astrophysics, no cheap cartoon circles or generic tropes.
 * - Layered physical VFX: Equatorial relativistic shockwave, polar plasma jets,
 *   needle-sharp diamond-gold embers with quadratic drag, and camera visceral micro-recoil.
 */
export class SupernovaEffect {
  constructor(scene, camera = null) {
    this.scene = scene;
    this.camera = camera;
    this.active = false;
    this.progress = 0;
    this.duration = 1.6; // seconds

    this.group = new THREE.Group();
    // Subtle axial inclination matching the accretion disk
    this.group.rotation.z = -0.04;
    this.scene.add(this.group);

    this.cameraBasePos = new THREE.Vector3();
    if (this.camera) {
      this.cameraBasePos.copy(this.camera.position);
    }

    this._buildRelativisticShockwave();
    this._buildPolarPlasmaJets();
    this._buildStellarSparkEmbers();
  }

  setCamera(camera) {
    this.camera = camera;
    if (camera) {
      this.cameraBasePos.copy(camera.position);
    }
  }

  // ── 1. Relativistic Equatorial Shockwave Ring ─────────────────
  _buildRelativisticShockwave() {
    // Thin flat ring expanding along X-Z accretion plane
    const geo = new THREE.RingGeometry(0.8, 1.15, 128, 1);
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
          // Normalized distance across the wavefront
          float crest = smoothstep(0.8, 0.98, r) * (1.0 - smoothstep(0.98, 1.15, r));

          // Easing dissipation
          float fade = 1.0 - smoothstep(0.15, 0.95, uProgress);

          // Luxury palette: electric diamond-white crest into warm champagne-gold rim
          vec3 diamondWhite = vec3(1.6, 1.5, 1.3);
          vec3 champagneGold = vec3(1.2, 0.92, 0.45);
          vec3 color = mix(champagneGold, diamondWhite, pow(crest, 2.0));

          float alpha = crest * fade * 0.92;
          if (alpha <= 0.005) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.shockwave = new THREE.Mesh(geo, mat);
    this.shockwave.rotation.x = -Math.PI / 2; // Lie in X-Z accretion plane
    this.shockwave.frustumCulled = false;
    this.shockwave.visible = false;
    this.group.add(this.shockwave);
  }

  // ── 2. Relativistic Polar Plasma Jets ──────────────────────────
  _buildPolarPlasmaJets() {
    // Twin vertical collimated jets expanding along +Y and -Y
    const jetGeo = new THREE.CylinderGeometry(0.04, 0.35, 4.5, 32, 1, true);
    const jetMat = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vY;
        void main() {
          vUv = uv;
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        varying vec2 vUv;
        varying float vY;

        void main() {
          float p = uProgress;
          float fade = 1.0 - smoothstep(0.1, 0.8, p);
          float heightFactor = smoothstep(0.0, 1.0, 1.0 - abs(vY) / 2.25);
          float rim = pow(sin(vUv.x * 3.14159), 2.0);

          vec3 jetColor = mix(vec3(1.4, 1.1, 0.6), vec3(0.6, 0.4, 0.9), p);
          float alpha = heightFactor * rim * fade * 0.75;
          if (alpha <= 0.005) discard;
          gl_FragColor = vec4(jetColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // North Pole Jet
    this.northJet = new THREE.Mesh(jetGeo, jetMat);
    this.northJet.position.y = 2.25;
    this.northJet.frustumCulled = false;
    this.northJet.visible = false;
    this.group.add(this.northJet);

    // South Pole Jet
    this.southJet = new THREE.Mesh(jetGeo, jetMat);
    this.southJet.position.y = -2.25;
    this.southJet.rotation.z = Math.PI;
    this.southJet.frustumCulled = false;
    this.southJet.visible = false;
    this.group.add(this.southJet);
  }

  // ── 3. Needle-Sharp Stellar Sparks (Physical Drag) ─────────────
  _buildStellarSparkEmbers() {
    const count = 420;
    const geo = new THREE.BufferGeometry();
    const positions  = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors     = new Float32Array(count * 3);
    const sizes      = new Float32Array(count);
    const lifetimes  = new Float32Array(count);

    const diamondWhite = new THREE.Color(0xfff8ee).multiplyScalar(1.5);
    const luxuryGold   = new THREE.Color(0xf5d061).multiplyScalar(1.3);
    const amber        = new THREE.Color(0xe09b30).multiplyScalar(1.1);

    for (let i = 0; i < count; i++) {
      // Disk-biased relativistic ejection: 75% near equatorial plane, 25% isotropic
      const isEquatorial = Math.random() < 0.75;
      const angle = Math.random() * Math.PI * 2;
      const elevation = isEquatorial ? (Math.random() - 0.5) * 0.25 : (Math.random() - 0.5) * 1.8;
      const speed = 2.2 + Math.random() * 5.8;

      velocities[i * 3]     = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = elevation * speed;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;

      positions[i * 3]     = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      sizes[i]     = 1.5 + Math.random() * 3.0;
      lifetimes[i] = 0.35 + Math.random() * 0.65;

      const pick = Math.random();
      const col = pick > 0.6 ? diamondWhite : pick > 0.25 ? luxuryGold : amber;
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

          // Quadratic interstellar drag (rapid initial burst then graceful float)
          float dragFactor = 1.0 - exp(-t * 3.8);
          vec3 pos = aVelocity * dragFactor * 2.2;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;

          float viewDist = max(-mvPos.z, 0.5);
          gl_PointSize = clamp(aSize * (240.0 / viewDist) * (1.0 - t * 0.6), 0.0, 48.0);

          vAlpha = 1.0 - smoothstep(aLife * 0.4, aLife, t);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          // Crisp starlight diamond spark profile
          float spark = pow(1.0 - d * 2.0, 2.2);
          gl_FragColor = vec4(vColor, vAlpha * spark);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparks = new THREE.Points(geo, mat);
    this.sparks.frustumCulled = false;
    this.sparks.visible = false;
    this.group.add(this.sparks);
  }

  // ── Public API ───────────────────────────────────────────────
  trigger() {
    this.active = true;
    this.progress = 0;

    this.shockwave.visible = true;
    this.shockwave.scale.set(1, 1, 1);

    this.northJet.visible = true;
    this.southJet.visible = true;
    this.northJet.scale.set(1, 1, 1);
    this.southJet.scale.set(1, 1, 1);

    this.sparks.visible = true;

    if (this.camera && this.cameraBasePos.lengthSq() > 0) {
      this.camera.position.copy(this.cameraBasePos);
    }
  }

  update(delta) {
    if (!this.active) return;

    this.progress += delta / this.duration;
    const p = Math.min(this.progress, 1.0);

    // 1. Relativistic Shockwave Expansion: explosive cubic-bezier ease-out
    const shockEase = 1.0 - Math.pow(1.0 - p, 3.2);
    const ringScale = 1.0 + shockEase * 9.5;
    this.shockwave.scale.set(ringScale, ringScale, 1.0);
    this.shockwave.material.uniforms.uProgress.value = p;

    // 2. Polar Jets: shoot upward & downward then dissipate
    const jetEase = 1.0 - Math.pow(1.0 - Math.min(p * 1.5, 1.0), 2.5);
    const jetScaleY = 1.0 + jetEase * 3.8;
    this.northJet.scale.set(1.0 + p * 0.5, jetScaleY, 1.0 + p * 0.5);
    this.southJet.scale.set(1.0 + p * 0.5, jetScaleY, 1.0 + p * 0.5);
    this.northJet.material.uniforms.uProgress.value = p;

    // 3. Stellar sparks
    this.sparks.material.uniforms.uProgress.value = p;

    // 4. Visceral Camera Micro-Recoil (First 200ms)
    if (this.camera && p < 0.20) {
      const shakeDecay = 1.0 - p / 0.20;
      const freq = p * 50.0;
      const shakeY = Math.sin(freq) * 0.04 * shakeDecay;
      const shakeZ = Math.cos(freq * 1.4) * 0.02 * shakeDecay;
      this.camera.position.set(
        this.cameraBasePos.x,
        this.cameraBasePos.y + shakeY,
        this.cameraBasePos.z + shakeZ
      );
    } else if (this.camera && p >= 0.20 && p < 0.30) {
      this.camera.position.lerp(this.cameraBasePos, 0.25);
    }

    if (p >= 1.0) {
      this.reset();
    }
  }

  getBloomBoost() {
    if (!this.active) return 0;
    // Crisp optical flare: peaks at 0.08 then rapidly returns to pristine contrast
    return this.progress < 0.10
      ? (this.progress / 0.10) * 0.35
      : Math.max(0, 0.35 * (1.0 - (this.progress - 0.10) / 0.35));
  }

  reset() {
    this.active = false;
    this.progress = 0;
    this.shockwave.visible = false;
    this.northJet.visible = false;
    this.southJet.visible = false;
    this.sparks.visible = false;

    if (this.camera && this.cameraBasePos.lengthSq() > 0) {
      this.camera.position.copy(this.cameraBasePos);
    }
  }
}
