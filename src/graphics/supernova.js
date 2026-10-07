import * as THREE from 'three';

/**
 * Megumin Explosion Magic System (惠惠爆裂魔法系统)
 * Authentic KonoSuba anime sakuga pyrotechnics:
 * 1. Concentric Crimson Magic Circle (红莲魔法阵): Nested runic rings & octagram spin & charge during vortex
 * 2. Anamorphic Anime Cross Star Flare (十字极光斩): Blinding 4-pointed cross star flare on detonation frame
 * 3. Billowing Cellular Anime Fireball (红莲爆裂火球): High-contrast dark volcanic smoke & searing crimson/gold flame cells
 * 4. Crackling Crimson Lightning Arcs (爆裂赤雷电弧): 28 jagged anime electric arcs flashing across the blast
 * 5. Dual Ground Shockwave Rings (双重赤焰冲击波): High-velocity planar blastwaves along accretion plane
 * 6. 1600+ Anime Fiery Sparks & Updraft Plume (升腾火柱与千颗余烬): Thermal convective lift embers
 * 7. Heavy Visceral Anime Screen Recoil (经典动漫冲击震颤)
 */
export class SupernovaEffect {
  constructor(scene, camera = null) {
    this.scene = scene;
    this.camera = camera;
    this.active = false;
    this.progress = 0;
    this.duration = 2.4; // Full dramatic anime explosion duration

    this.group = new THREE.Group();
    // Subtle tilt to align with accretion disk
    this.group.rotation.z = -0.04;
    this.scene.add(this.group);

    this.cameraBasePos = new THREE.Vector3();
    if (this.camera) {
      this.cameraBasePos.copy(this.camera.position);
    }

    this._buildMagicCircle();
    this._buildAnimeCrossFlare();
    this._buildExpandingFireball();
    this._buildCrimsonLightningArcs();
    this._buildPlanarShockwaves();
    this._buildFierySparksPlume();
  }

  setCamera(camera) {
    this.camera = camera;
    if (camera) {
      this.cameraBasePos.copy(camera.position);
    }
  }

  // ── 1. Megumin Concentric Crimson Magic Circle ────────────────
  _buildMagicCircle() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const cx = 512, cy = 512;

    ctx.clearRect(0, 0, 1024, 1024);

    const drawRing = (r, width, color, shadowColor, blur = 18) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = blur;
      ctx.stroke();
      ctx.restore();
    };

    // Outer bounding ring
    drawRing(480, 5, '#ff1a4b', '#ff0033', 25);
    drawRing(455, 2.5, '#ffd000', '#ff8800', 15);

    // 24 Runic tick marks along outer ring
    ctx.save();
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      const x1 = cx + Math.cos(angle) * 455;
      const y1 = cy + Math.sin(angle) * 455;
      const x2 = cx + Math.cos(angle) * 480;
      const y2 = cy + Math.sin(angle) * 480;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();

    // Secondary concentric ring
    drawRing(390, 4, '#ff2a55', '#ff1144', 20);

    // 8-Pointed Star (Octagram) connecting points at r = 385
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 20;
    const starR = 385;
    for (let offset = 0; offset < 2; offset++) {
      ctx.beginPath();
      for (let i = 0; i <= 4; i++) {
        const angle = ((i * 2 + offset) * Math.PI) / 4;
        const x = cx + Math.cos(angle) * starR;
        const y = cy + Math.sin(angle) * starR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    // Intermediate runic ring
    drawRing(270, 3, '#ff1e56', '#ff0044', 15);

    // Inner rotating hexagon
    ctx.save();
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = cx + Math.cos(angle) * 220;
      const y = cy + Math.sin(angle) * 220;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Central core runic rings
    drawRing(140, 4, '#ffd700', '#ff8800', 25);
    drawRing(75, 3, '#ff1a4b', '#ff0033', 20);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(8.5, 8.5);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.magicCircle = new THREE.Mesh(geo, mat);
    this.magicCircle.rotation.x = -Math.PI / 2; // Lie flat in X-Z plane
    this.magicCircle.position.y = -0.05; // Just below event horizon
    this.magicCircle.frustumCulled = false;
    this.group.add(this.magicCircle);
  }

  // ── 2. Iconic Anime Anamorphic Cross Star Flare ───────────────
  _buildAnimeCrossFlare() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256, cy = 256;

    ctx.clearRect(0, 0, 512, 512);

    // Sharp horizontal anamorphic flare
    const hGrad = ctx.createLinearGradient(0, cy, 512, cy);
    hGrad.addColorStop(0.0, 'rgba(255, 0, 60, 0.0)');
    hGrad.addColorStop(0.35, 'rgba(255, 30, 90, 0.7)');
    hGrad.addColorStop(0.48, 'rgba(255, 220, 200, 0.95)');
    hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    hGrad.addColorStop(0.52, 'rgba(255, 220, 200, 0.95)');
    hGrad.addColorStop(0.65, 'rgba(255, 30, 90, 0.7)');
    hGrad.addColorStop(1.0, 'rgba(255, 0, 60, 0.0)');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, cy - 12, 512, 24);

    // Vertical beam
    const vGrad = ctx.createLinearGradient(cx, 0, cx, 512);
    vGrad.addColorStop(0.0, 'rgba(255, 0, 60, 0.0)');
    vGrad.addColorStop(0.38, 'rgba(255, 30, 90, 0.6)');
    vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    vGrad.addColorStop(0.62, 'rgba(255, 30, 90, 0.6)');
    vGrad.addColorStop(1.0, 'rgba(255, 0, 60, 0.0)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(cx - 10, 0, 20, 512);

    // 4-Pointed Star diamond rays
    ctx.save();
    ctx.fillStyle = 'rgba(255, 230, 150, 0.85)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 120);
    ctx.quadraticCurveTo(cx, cy, cx + 120, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + 120);
    ctx.quadraticCurveTo(cx, cy, cx - 120, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - 120);
    ctx.fill();
    ctx.restore();

    // Central blinding spherical glow
    const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65);
    cGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    cGrad.addColorStop(0.25, 'rgba(255, 235, 120, 0.95)');
    cGrad.addColorStop(0.6, 'rgba(255, 30, 70, 0.6)');
    cGrad.addColorStop(1.0, 'rgba(255, 0, 50, 0.0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(18.0, 18.0);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.crossFlare = new THREE.Mesh(geo, mat);
    this.crossFlare.position.set(0, 0, 0.5);
    this.crossFlare.frustumCulled = false;
    this.crossFlare.visible = false;
    this.group.add(this.crossFlare);
  }

  // ── 3. Expanding Cellular Anime Fireball & Smoke ───────────────
  _buildExpandingFireball() {
    const geo = new THREE.SphereGeometry(1.0, 64, 48);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 }
      },
      vertexShader: `
        uniform float uProgress;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPos;
        varying float vNoise;

        // Simple 3D noise for billowing deformation
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise3d(vec3 x) {
          vec3 p = floor(x);
          vec3 w = fract(x);
          vec3 u = w * w * (3.0 - 2.0 * w);
          float n = p.x + p.y * 157.0 + 113.0 * p.z;
          return mix(
            mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), u.x),
                mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), u.x), u.y),
            mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), u.x),
                mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), u.x), u.y), u.z);
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;

          // Cauliflower cloud billowing displacement
          float p = uProgress;
          vec3 nPos = position * 2.5 + vec3(0.0, -uTime * 1.5, 0.0);
          float billow = noise3d(nPos) * 0.35 + noise3d(nPos * 2.2) * 0.15;
          vNoise = billow;

          vec3 displaced = position + normal * (billow * smoothstep(0.05, 0.5, p) * 0.6);
          // Vertical thermal expansion (mushroom updraft)
          displaced.y *= (1.0 + p * 0.35);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPos;
        varying float vNoise;

        void main() {
          float p = uProgress;
          float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);

          // Megumin Iconic Anime Explosion Palette:
          // Searing Crimson Fire + Obsidian Volcanic Smoke + Fiery Gold Highlights
          vec3 whiteHot   = vec3(1.0, 0.98, 0.92);
          vec3 blazingGold = vec3(1.0, 0.82, 0.15);
          vec3 pureCrimson = vec3(0.96, 0.03, 0.18);
          vec3 darkMagma   = vec3(0.45, 0.02, 0.08);
          vec3 obsidianSmoke = vec3(0.05, 0.01, 0.018);

          vec3 col = pureCrimson;
          if (p < 0.08) {
            col = mix(whiteHot, blazingGold, p / 0.08);
          } else if (p < 0.35) {
            float t = (p - 0.08) / 0.27;
            col = mix(blazingGold, pureCrimson, t);
            if (vNoise > 0.3) col = mix(col, obsidianSmoke, 0.7);
          } else {
            float t = (p - 0.35) / 0.65;
            col = mix(pureCrimson, darkMagma, t);
            // Dynamic anime cel smoke billows
            if (vNoise > 0.20) {
              col = mix(col, obsidianSmoke, smoothstep(0.20, 0.45, vNoise) * 0.95);
            }
          }

          // Fiery anime cel-shaded edge rim
          float rimGlow = smoothstep(0.4, 0.85, rim);
          col += blazingGold * (rimGlow * (1.0 - p * 0.7) * 0.85);

          // Dissolution fadeout
          float fade = 1.0 - smoothstep(0.25, 0.95, p);
          float alpha = clamp((0.95 + vNoise * 0.15) * fade, 0.0, 1.0);

          if (alpha <= 0.01) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false
    });

    this.fireball = new THREE.Mesh(geo, mat);
    this.fireball.frustumCulled = false;
    this.fireball.visible = false;
    this.group.add(this.fireball);
  }

  // ── 4. Crackling Crimson Lightning Arcs (爆裂赤雷) ────────────
  _buildCrimsonLightningArcs() {
    const arcCount = 28;
    const segsPerArc = 9;
    const totalVerts = arcCount * segsPerArc * 2;

    const positions = new Float32Array(totalVerts * 3);
    const opacities = new Float32Array(totalVerts);

    this.lightningArcs = [];
    for (let i = 0; i < arcCount; i++) {
      // Radial direction with slight upward bias
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.2) * Math.PI * 0.6;
      const length = 2.5 + Math.random() * 3.5;

      const dir = new THREE.Vector3(
        Math.cos(phi) * Math.cos(theta),
        Math.sin(phi) + 0.15,
        Math.cos(phi) * Math.sin(theta)
      ).normalize();

      this.lightningArcs.push({ dir, length, seed: Math.random() * 100 });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0xff1155,
      linewidth: 2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.lightningMesh = new THREE.LineSegments(geo, mat);
    this.lightningMesh.frustumCulled = false;
    this.lightningMesh.visible = false;
    this.group.add(this.lightningMesh);
  }

  _updateLightning(progress) {
    if (!this.lightningMesh || progress > 0.65) {
      if (this.lightningMesh) this.lightningMesh.visible = false;
      return;
    }

    this.lightningMesh.visible = true;
    const positions = this.lightningMesh.geometry.attributes.position.array;
    let ptr = 0;

    const flashIntensity = progress < 0.25
      ? (progress / 0.25)
      : Math.pow(1.0 - (progress - 0.25) / 0.40, 2.0);

    this.lightningMesh.material.opacity = flashIntensity * 0.95;

    for (let i = 0; i < this.lightningArcs.length; i++) {
      const arc = this.lightningArcs[i];
      let curr = new THREE.Vector3(0, 0, 0);
      const segLen = (arc.length * (0.4 + progress * 1.2)) / 8;

      for (let s = 0; s < 8; s++) {
        const next = curr.clone().addScaledVector(arc.dir, segLen);
        // Jagged anime electric jitter
        next.x += (Math.random() - 0.5) * 0.45;
        next.y += (Math.random() - 0.5) * 0.45;
        next.z += (Math.random() - 0.5) * 0.45;

        positions[ptr++] = curr.x;
        positions[ptr++] = curr.y;
        positions[ptr++] = curr.z;
        positions[ptr++] = next.x;
        positions[ptr++] = next.y;
        positions[ptr++] = next.z;

        curr = next;
      }
    }

    this.lightningMesh.geometry.attributes.position.needsUpdate = true;
  }

  // ── 5. Dual Planar Shockwave Blastwaves ────────────────────────
  _buildPlanarShockwaves() {
    // Primary razor-thin crimson shockwave
    const ringGeo1 = new THREE.RingGeometry(0.8, 1.2, 128, 1);
    const ringMat1 = new THREE.ShaderMaterial({
      uniforms: { uProgress: { value: 0 } },
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
          float crest = smoothstep(0.8, 0.98, r) * (1.0 - smoothstep(0.98, 1.2, r));
          float fade = 1.0 - smoothstep(0.08, 0.92, uProgress);

          vec3 whiteHot = vec3(1.0, 0.95, 0.85);
          vec3 crimson  = vec3(1.0, 0.08, 0.28);
          vec3 color = mix(crimson, whiteHot, pow(crest, 2.8));

          float alpha = crest * fade * 0.95;
          if (alpha <= 0.005) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.shockwave1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.shockwave1.rotation.x = -Math.PI / 2;
    this.shockwave1.frustumCulled = false;
    this.shockwave1.visible = false;
    this.group.add(this.shockwave1);

    // Secondary trailing golden fire blastwave
    const ringGeo2 = new THREE.RingGeometry(0.5, 0.95, 96, 1);
    const ringMat2 = new THREE.ShaderMaterial({
      uniforms: { uProgress: { value: 0 } },
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
          float wave = smoothstep(0.5, 0.75, r) * (1.0 - smoothstep(0.85, 0.95, r));
          float fade = 1.0 - smoothstep(0.15, 0.85, uProgress);
          vec3 fireGold = vec3(1.0, 0.75, 0.15);
          float alpha = wave * fade * 0.85;
          if (alpha <= 0.005) discard;
          gl_FragColor = vec4(fireGold, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.shockwave2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.shockwave2.rotation.x = -Math.PI / 2;
    this.shockwave2.frustumCulled = false;
    this.shockwave2.visible = false;
    this.group.add(this.shockwave2);
  }

  // ── 6. 1600+ Anime Fiery Sparks & Updraft Firestorm ───────────
  _buildFierySparksPlume() {
    const count = 1600;
    const geo = new THREE.BufferGeometry();
    const positions   = new Float32Array(count * 3);
    const velocities  = new Float32Array(count * 3);
    const colors      = new Float32Array(count * 3);
    const sizes       = new Float32Array(count);
    const decays      = new Float32Array(count);
    const twinkles    = new Float32Array(count);

    // Konosuba Megumin explosion colors:
    const crimsonHot = new THREE.Color(0xff1144);
    const amberGold  = new THREE.Color(0xffaa00);
    const whiteStar  = new THREE.Color(0xfff8ee);
    const magenta    = new THREE.Color(0xff0088);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      // 65% Explosive upward fire column (mushroom/updraft plume)
      const isPlume = Math.random() < 0.65;
      const speed = 4.0 + Math.random() * 8.5;

      const vx = Math.sin(phi) * Math.cos(theta) * (isPlume ? speed * 0.7 : speed);
      const vy = isPlume ? (Math.abs(Math.cos(phi)) * 1.5 + 0.5) * speed : Math.cos(phi) * speed * 0.6;
      const vz = Math.sin(phi) * Math.sin(theta) * (isPlume ? speed * 0.7 : speed);

      velocities[i * 3]     = vx;
      velocities[i * 3 + 1] = vy;
      velocities[i * 3 + 2] = vz;

      positions[i * 3]     = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const p = Math.random();
      let col = crimsonHot;
      if (p > 0.85) col = whiteStar;
      else if (p > 0.45) col = amberGold;
      else if (p > 0.30) col = magenta;

      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i]    = 2.4 + Math.random() * 3.8;
      decays[i]   = 1.3 + Math.random() * 1.1;
      twinkles[i] = 18.0 + Math.random() * 40.0;
    }

    geo.setAttribute('position',  new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute('aColor',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',     new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aDecay',    new THREE.BufferAttribute(decays, 1));
    geo.setAttribute('aTwinkle',  new THREE.BufferAttribute(twinkles, 1));

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

          // Drag and updraft buoyancy
          float drag = (1.0 - exp(-t * 2.6)) / 2.6;
          vec3 pos = aVelocity * drag;

          // Thermal updraft for fire sparks (+Y lift!)
          pos.y += t * t * 0.45;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;

          float viewDist = max(-mvPos.z, 0.5);
          float life = clamp(1.0 - (t / aDecay), 0.0, 1.0);
          float twinkle = 0.8 + 0.2 * sin(t * aTwinkle);

          vAlpha = pow(life, 1.4) * twinkle;
          gl_PointSize = clamp(aSize * (260.0 / viewDist) * life, 0.0, 48.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;

          // Anime diamond fire ember profile
          float core = pow(1.0 - d * 2.0, 2.5);
          float halo = pow(1.0 - d * 2.0, 1.1);
          float s = core * 0.85 + halo * 0.15;

          gl_FragColor = vec4(vColor, vAlpha * s);
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
  setCollapseProgress(progress) {
    if (this.magicCircle) {
      if (progress > 0.05) {
        this.magicCircle.material.opacity = Math.min(progress * 1.2, 0.95);
        this.magicCircle.rotation.z += 0.02 + progress * 0.08;
        const scale = 1.0 + progress * 0.3;
        this.magicCircle.scale.set(scale, scale, 1.0);
      } else if (!this.active) {
        this.magicCircle.material.opacity = 0;
      }
    }
  }

  trigger() {
    this.active = true;
    this.progress = 0;

    // Trigger Cross Star Flare
    this.crossFlare.visible = true;
    this.crossFlare.scale.set(1, 1, 1);
    this.crossFlare.material.opacity = 1.0;

    // Trigger Fireball
    this.fireball.visible = true;
    this.fireball.position.set(0, 0, 0);
    this.fireball.scale.set(0.1, 0.1, 0.1);

    // Trigger Lightning
    if (this.lightningMesh) {
      this.lightningMesh.visible = true;
    }

    // Trigger Shockwaves
    this.shockwave1.visible = true;
    this.shockwave1.scale.set(1, 1, 1);
    this.shockwave2.visible = true;
    this.shockwave2.scale.set(1, 1, 1);

    // Trigger Sparks Plume
    this.sparks.visible = true;

    // Magic circle detonation flash
    if (this.magicCircle) {
      this.magicCircle.material.opacity = 1.0;
    }

    if (this.camera && this.cameraBasePos.lengthSq() > 0) {
      this.camera.position.copy(this.cameraBasePos);
    }
  }

  update(delta) {
    if (!this.active) {
      return;
    }

    this.progress += delta;
    const t = this.progress;
    const normP = Math.min(t / this.duration, 1.0);

    // 1. Anime Cross Flare: Piercing initial flash that dissipates in 380ms
    if (t < 0.38) {
      const flareRatio = t / 0.38;
      const flareEase = 1.0 - flareRatio;
      const scaleX = 1.0 + Math.pow(flareRatio, 0.35) * 9.0;
      const scaleY = 1.0 + Math.pow(flareRatio, 0.35) * 7.0;
      this.crossFlare.scale.set(scaleX, scaleY, 1.0);
      this.crossFlare.material.opacity = Math.pow(flareEase, 1.5);
    } else {
      this.crossFlare.visible = false;
    }

    // 2. Expanding Relativistic Fireball
    if (normP < 0.72) {
      const fbEase = 1.0 - Math.pow(1.0 - normP / 0.72, 3.0);
      const fbScale = 0.15 + fbEase * 1.85;
      this.fireball.scale.set(fbScale, fbScale * 1.25, fbScale);
      this.fireball.position.y = fbEase * 0.65; // Upward thermal rise
      this.fireball.material.uniforms.uProgress.value = normP / 0.72;
      this.fireball.material.uniforms.uTime.value = t;
    } else {
      this.fireball.visible = false;
    }

    // 3. Crimson Lightning Arcs
    this._updateLightning(normP);

    // 4. Shockwave 1: High speed razor-thin crimson wave
    const s1Ease = 1.0 - Math.pow(1.0 - normP, 3.2);
    const s1Scale = 1.0 + s1Ease * 12.0;
    this.shockwave1.scale.set(s1Scale, s1Scale, 1.0);
    this.shockwave1.material.uniforms.uProgress.value = normP;

    // 5. Shockwave 2: Trailing golden wave
    const s2Progress = Math.max(0.0, normP - 0.08) / 0.92;
    const s2Ease = 1.0 - Math.pow(1.0 - s2Progress, 2.8);
    const s2Scale = 1.0 + s2Ease * 9.5;
    this.shockwave2.scale.set(s2Scale, s2Scale, 1.0);
    this.shockwave2.material.uniforms.uProgress.value = s2Progress;

    // 6. Sparks & Fire Plume
    this.sparks.material.uniforms.uTime.value = t;

    // 7. Magic Circle: Shatters & dissolves as shockwave expands
    if (this.magicCircle) {
      this.magicCircle.rotation.z += 0.08;
      this.magicCircle.material.opacity = Math.max(0.0, 1.0 - normP * 2.2);
    }

    // 8. Heavy Anime Screen Recoil (KonoSuba Impact Shake)
    if (this.camera && t < 0.28) {
      const decay = 1.0 - t / 0.28;
      const freq = t * 65.0;
      const shakeY = (Math.sin(freq) * 0.08 + (Math.random() - 0.5) * 0.04) * decay;
      const shakeX = (Math.cos(freq * 1.3) * 0.05 + (Math.random() - 0.5) * 0.03) * decay;
      this.camera.position.set(
        this.cameraBasePos.x + shakeX,
        this.cameraBasePos.y + shakeY,
        this.cameraBasePos.z
      );
    } else if (this.camera && t >= 0.28 && t < 0.40) {
      this.camera.position.lerp(this.cameraBasePos, 0.25);
    }

    if (normP >= 1.0) {
      this.reset();
    }
  }

  getBloomBoost() {
    if (!this.active) return 0;
    // Dramatic anime trigger flash: peaks at 0.06s then sharp exponential falloff
    return this.progress < 0.08
      ? (this.progress / 0.08) * 0.45
      : Math.max(0, 0.45 * Math.exp(-(this.progress - 0.08) * 5.0));
  }

  reset() {
    this.active = false;
    this.progress = 0;
    this.crossFlare.visible = false;
    this.fireball.visible = false;
    this.fireball.position.set(0, 0, 0);
    if (this.lightningMesh) this.lightningMesh.visible = false;
    this.shockwave1.visible = false;
    this.shockwave2.visible = false;
    this.sparks.visible = false;
    if (this.magicCircle) {
      this.magicCircle.material.opacity = 0;
    }

    if (this.camera && this.cameraBasePos.lengthSq() > 0) {
      this.camera.position.copy(this.cameraBasePos);
    }
  }
}
