import * as THREE from 'three';

/**
 * Interstellar Nebula & Cosmic Dust System (深空星云与银河尘埃系统)
 * Scheme 1:
 * 1. Procedural Dynamic Deep Nebula Shader (流动深空星云光幔: Deep Indigo + Cosmic Violet + Warm Amber Veil)
 * 2. 3500+ Tiered Twinkling Starfield with Multi-spectral Colors (多色温闪烁恒星)
 */
export class CosmicBackdrop {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'cosmic-backdrop';
    this.scene.add(this.group);

    this._buildNebulaSky();
    this._buildTwinklingStarfield();
  }

  // ── 1. Procedural Dynamic Deep Nebula Shader ───────────────────
  _buildNebulaSky() {
    // Large background plane positioned far behind all objects (Z = -38)
    const geo = new THREE.PlaneGeometry(160, 110, 32, 32);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uCollapseProgress: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uCollapseProgress;
        varying vec2 vUv;
        varying vec3 vPos;

        // Smooth 2D noise functions for organic nebular dust
        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = rot * p * 2.0 + vec2(100.0);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = (vUv - 0.5) * 2.0; // [-1, 1]
          float t = uTime * 0.012;

          // Deep Celestial Base: Deep Midnight Indigo (#05091a) & Cosmic Dark Violet (#0b0616)
          vec3 baseIndigo = vec3(0.020, 0.035, 0.095);
          vec3 basePurple = vec3(0.042, 0.022, 0.075);
          vec3 bg = mix(baseIndigo, basePurple, smoothstep(-1.0, 1.0, uv.y));

          // Flowing galactic dust coordinates
          vec2 dustCoord1 = uv * 1.25 + vec2(t * 0.5, t * 0.35);
          vec2 dustCoord2 = uv * 2.0 - vec2(t * 0.7, -t * 0.25) + vec2(2.5, 1.8);

          float n1 = fbm(dustCoord1);
          float n2 = fbm(dustCoord2);

          // Nebula filaments
          float cloud1 = smoothstep(0.36, 0.72, n1);
          float cloud2 = smoothstep(0.40, 0.76, n2);

          // Scheme 1 Color Palette:
          // Cosmic Violet, Deep Celestial Cyan/Blue, Warm Champagne Gold Dust
          vec3 cosmicViolet = vec3(0.16, 0.05, 0.26);  // Ethereal violet
          vec3 cosmicCyan   = vec3(0.04, 0.14, 0.24);  // Deep celestial cyan
          vec3 warmAmber    = vec3(0.22, 0.13, 0.05);  // Warm stellar dust

          vec3 nebulaCol = mix(bg, cosmicViolet, cloud1 * 0.60);
          nebulaCol = mix(nebulaCol, cosmicCyan, cloud2 * 0.50);

          // Subtle central stellar glow highlight
          float centerDist = length(uv * vec2(0.75, 1.0));
          float coreHalo = exp(-centerDist * 1.6) * 0.15;
          nebulaCol += warmAmber * coreHalo;

          // React slightly to singularity collapse
          nebulaCol += cosmicViolet * (uCollapseProgress * 0.10);

          // Subtle vignette at the far edges
          float vignette = 1.0 - smoothstep(0.7, 1.5, centerDist);
          nebulaCol *= clamp(0.70 + vignette * 0.30, 0.0, 1.0);

          gl_FragColor = vec4(nebulaCol, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: true
    });

    this.nebulaMesh = new THREE.Mesh(geo, mat);
    this.nebulaMesh.position.set(0, 0, -38.0);
    this.nebulaMesh.frustumCulled = false;
    this.group.add(this.nebulaMesh);
  }

  // ── 2. 3500+ Tiered Twinkling Starfield ────────────────────────
  _buildTwinklingStarfield() {
    const count = 3500;
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    const phases    = new Float32Array(count);
    const freqs     = new Float32Array(count);

    // Multi-spectral astronomical star colors:
    const colBlueWhite = new THREE.Color(0xa8c8ff);
    const colPureWhite = new THREE.Color(0xffffff);
    const colWarmGold  = new THREE.Color(0xffdf99);
    const colOrange    = new THREE.Color(0xffb077);

    for (let i = 0; i < count; i++) {
      // Distribute in a spherical sector behind the black hole (Z from -16 to -45)
      const x = (Math.random() - 0.5) * 92.0;
      const y = (Math.random() - 0.5) * 60.0;
      const z = -16.0 - Math.random() * 26.0;

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const randType = Math.random();
      let starCol = colPureWhite;
      if (randType > 0.70) starCol = colBlueWhite;
      else if (randType > 0.40) starCol = colWarmGold;
      else if (randType > 0.25) starCol = colOrange;

      const brightness = 0.35 + Math.random() * 0.65;
      colors[i * 3]     = starCol.r * brightness;
      colors[i * 3 + 1] = starCol.g * brightness;
      colors[i * 3 + 2] = starCol.b * brightness;

      // Varied size: mostly fine pinpricks, few bright focal stars
      sizes[i]  = Math.random() > 0.94 ? 2.2 + Math.random() * 1.2 : 0.8 + Math.random() * 1.0;
      phases[i] = Math.random() * Math.PI * 2;
      freqs[i]  = 1.5 + Math.random() * 4.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aFreq',    new THREE.BufferAttribute(freqs, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 }
      },
      vertexShader: `
        uniform float uTime;
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aPhase;
        attribute float aFreq;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPos;

          // Gentle sine-wave twinkle
          float twinkle = 0.75 + 0.25 * sin(uTime * aFreq + aPhase);
          vAlpha = twinkle;

          float dist = max(-mvPos.z, 1.0);
          gl_PointSize = clamp(aSize * (75.0 / dist), 0.8, 3.8);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Soft stellar circular glow profile
          float core = pow(1.0 - dist * 2.0, 2.0);
          gl_FragColor = vec4(vColor, vAlpha * core);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(geo, mat);
    this.starfield.frustumCulled = false;
    this.group.add(this.starfield);
  }

  update(delta, elapsedTime, collapseProgress = 0.0) {
    // 1. Animate Nebula
    if (this.nebulaMesh && this.nebulaMesh.material.uniforms) {
      this.nebulaMesh.material.uniforms.uTime.value = elapsedTime;
      this.nebulaMesh.material.uniforms.uCollapseProgress.value = collapseProgress;
    }

    // 2. Animate Starfield Twinkle & Slow Pan
    if (this.starfield && this.starfield.material.uniforms) {
      this.starfield.material.uniforms.uTime.value = elapsedTime;
      this.starfield.rotation.z += delta * 0.0015;
    }
  }
}
