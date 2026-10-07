import * as THREE from 'three';
import defaultEmployees from '../../employee.json' with { type: 'json' };

/**
 * SaturnRing / FaceOnAvatarVortex
 * Face-on (0° Tilt) Frontal Celestial Wheel of Attendee Photos
 * Badges spin directly in the X-Y plane around the black hole ball,
 * facing the camera directly in a mesmerizing circular cosmic vortex.
 */
export class SaturnRing {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.badges = [];
    // Subtle natural Saturn axial tilt
    this.group.rotation.z = -0.04;

    this.winnerBadge = null;
    this.winnerTargetPos = new THREE.Vector3(0, 0.35, 4.2);
    this.winnerCurrentPos = new THREE.Vector3();
    this.winnerProgress = 0.0;

    this.initAttendees();
  }

  initAttendees() {
    const list = (defaultEmployees && defaultEmployees.length > 0) ? defaultEmployees : [];
    const count = list.length;
    if (count === 0) return;

    // Distribute 100 attendees across 4 concentric circular tracks of the Saturn Ring (R = 1.80 to 3.75)
    // Track 0: R = 1.80, 14 badges (Inner B Ring)
    // Track 1: R = 2.40, 22 badges (Middle B Ring)
    // Track 2: R = 3.10, 28 badges (A Ring inner, past Cassini division)
    // Track 3: R = 3.75, 36 badges (A Ring outer)
    // Total = 14 + 22 + 28 + 36 = 100 badges
    const trackConfigs = [
      { radius: 1.80, count: 14, baseScale: 0.32, speed: 0.22 },
      { radius: 2.40, count: 22, baseScale: 0.36, speed: 0.18 },
      { radius: 3.10, count: 28, baseScale: 0.40, speed: 0.14 },
      { radius: 3.75, count: 36, baseScale: 0.44, speed: 0.11 }
    ];

    let empIndex = 0;
    for (let t = 0; t < trackConfigs.length; t++) {
      const cfg = trackConfigs[t];
      const angleStep = (Math.PI * 2) / cfg.count;
      const trackOffset = (t * Math.PI) / 4;

      for (let i = 0; i < cfg.count && empIndex < count; i++) {
        const emp = list[empIndex];
        const baseAngle = i * angleStep + trackOffset;
        const badge = this._createBadgeSprite(emp, cfg.radius, baseAngle, cfg.baseScale, cfg.speed, empIndex);
        this.badges.push(badge);
        this.group.add(badge.sprite);
        empIndex++;
      }
    }
  }

  _createBadgeSprite(emp, baseRadius, baseAngle, baseScale, speed, index) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(baseScale, baseScale * 1.06, 1.0);

    const badgeData = {
      emp,
      index,
      sprite,
      texture,
      canvas,
      ctx,
      baseRadius,
      currentRadius: baseRadius,
      baseAngle,
      currentAngle: baseAngle,
      baseScale,
      speed,
      isImageLoaded: false,
      isWinner: false
    };

    // Render initial procedural badge
    this._renderBadgeCanvas(badgeData, null);

    // Asynchronously load attendee photo from local avatars
    const avatarUrl = emp.avatar ? emp.avatar.replace(/^\./, '') : `/avatars/${emp.id}.png`;
    const img = new Image();
    badgeData.img = null;
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      badgeData.isImageLoaded = true;
      badgeData.img = img;
      this._renderBadgeCanvas(badgeData, img);
    };
    img.onerror = () => {
      if (avatarUrl.endsWith('.png')) {
        img.src = avatarUrl.replace('.png', '.jpg');
      }
    };
    img.src = avatarUrl;

    return badgeData;
  }

  _renderBadgeCanvas(badgeData, img = null) {
    const activeImg = img || badgeData.img;
    const { canvas, ctx, emp, texture } = badgeData;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const centerX = w / 2; // 128
    const avatarY = 94;
    const avatarR = 74;

    // ── 1. Circular Avatar Glow & Halo ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarR + 5, 0, Math.PI * 2);

    if (badgeData.isWinner) {
      ctx.strokeStyle = 'rgba(255, 235, 140, 0.95)';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.95)';
      ctx.shadowBlur = 20;
    } else {
      ctx.strokeStyle = 'rgba(245, 208, 97, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(245, 208, 97, 0.6)';
      ctx.shadowBlur = 12;
    }
    ctx.stroke();
    ctx.restore();

    // ── 2. Avatar Photo Clipping ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (activeImg && (badgeData.isImageLoaded || activeImg.complete)) {
      ctx.drawImage(activeImg, centerX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
    } else {
      // Procedural Initial Fallback
      const grad = ctx.createLinearGradient(centerX - avatarR, avatarY - avatarR, centerX + avatarR, avatarY + avatarR);
      grad.addColorStop(0, '#f5d061');
      grad.addColorStop(1, '#a67c1e');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.fillStyle = '#060a14';
      ctx.font = 'bold 56px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emp.name ? emp.name.charAt(0) : '?', centerX, avatarY + 2);
    }
    ctx.restore();

    // ── 3. Subtle Inner Bevel Ring ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ── 4. Minimalist Name Pill Badge Below ──
    ctx.save();
    let displayName = emp.name || 'Candidate';
    if (displayName.length > 14) {
      displayName = displayName.slice(0, 13) + '…';
    }

    ctx.font = 'bold 22px "Segoe UI", -apple-system, sans-serif';
    const textWidth = ctx.measureText(displayName).width;
    const pillW = Math.max(textWidth + 26, 120);
    const pillH = 34;
    const pillX = centerX - pillW / 2;
    const pillY = 192;

    // Obsidian frosted pill
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(8, 12, 22, 0.92)';
    ctx.fill();

    ctx.strokeStyle = badgeData.isWinner ? 'rgba(255, 230, 140, 0.9)' : 'rgba(245, 208, 97, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Name text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(displayName, centerX, pillY + pillH / 2 + 1);

    // Mini Department Tag
    ctx.fillStyle = '#f5d061';
    ctx.font = '600 12px "Segoe UI", sans-serif';
    ctx.shadowBlur = 0;
    let dept = (emp.department || 'SURVEY CORPS').toUpperCase();
    if (dept.length > 16) dept = dept.slice(0, 15) + '…';
    ctx.fillText(dept, centerX, pillY + pillH + 16);
    ctx.restore();

    texture.needsUpdate = true;
  }

  update(delta, state, collapseProgress = 0.0) {
    if (!this.badges || this.badges.length === 0) return;

    const isCollapsing = (state === 'COLLAPSING');
    const isStopping   = (state === 'STOPPING');
    const isSupernova  = (state === 'SUPERNOVA');
    const isReveal     = (state === 'REVEAL');

    // Dynamic speed multiplier
    let speedMult = 1.0;
    if (isCollapsing) {
      speedMult = 1.0 + collapseProgress * 6.5;
    } else if (isStopping) {
      speedMult = 2.0;
    } else if (isSupernova) {
      speedMult = 0.5;
    } else if (isReveal) {
      speedMult = 0.3;
    }

    for (let i = 0; i < this.badges.length; i++) {
      const b = this.badges[i];

      // ── Winner Emergence Physics (Detonate explosion first, then emerge from singularity) ──
      if (b === this.winnerBadge && (isSupernova || isReveal)) {
        if (isSupernova) {
          this.winnerExplosionDelay = (this.winnerExplosionDelay || 0) + delta;
          if (this.winnerExplosionDelay < 0.55) {
            b.sprite.position.set(0, 0, 0);
            b.sprite.scale.set(0.01, 0.01, 1.0);
            b.sprite.material.opacity = 0.0;
            continue;
          }
        }

        this.winnerProgress = Math.min(this.winnerProgress + delta * 1.5, 1.0);
        // Cinematic cubic-bezier expansion ease out
        const ease = 1 - Math.pow(1 - this.winnerProgress, 3.2);

        // Animate from singularity (0, 0, 0) forward to front screen view (0, 0.2, 4.2)
        b.sprite.position.lerpVectors(this.winnerCurrentPos, this.winnerTargetPos, ease);
        const targetScale = b.baseScale * (0.1 + ease * 1.5);
        b.sprite.scale.set(targetScale, targetScale * 1.06, 1.0);
        b.sprite.material.opacity = Math.min(this.winnerProgress * 3.0, 1.0);
        continue;
      }

      // ── Candidates Vortex Suction Physics into Black Hole ──
      let targetRadius = b.baseRadius;
      let targetOpacity = 1.0;
      let targetScaleMult = 1.0;
      let spiralSpin = 0.0;

      if (isCollapsing || isStopping) {
        // Logarithmic gravitational plunge into the singularity
        const suctionProgress = Math.min(collapseProgress, 1.0);
        const plunge = Math.pow(suctionProgress, 1.5);
        targetRadius = b.baseRadius * (1.0 - plunge * 0.98);

        // Relativistic orbital acceleration (spin increases as radius drops)
        spiralSpin = Math.pow(suctionProgress, 1.8) * Math.PI * 10.0;

        // Gravitational tidal fade as it crosses event horizon (r <= 1.15)
        if (targetRadius <= 1.15) {
          const depth = Math.max(0.0, (targetRadius - 0.1) / 1.05);
          targetScaleMult = Math.pow(depth, 1.3);
          targetOpacity = Math.pow(depth, 1.6);
        }

        if (suctionProgress >= 0.92) {
          targetOpacity = 0.0;
          targetScaleMult = 0.0;
        }
      } else if (isSupernova) {
        // Swallowed inside singularity during supernova burst
        targetOpacity = 0.0;
        targetScaleMult = 0.0;
        targetRadius = 0.05;
      } else if (isReveal) {
        // After winner is crowned, ambient background attendees softly restore faint presence
        targetOpacity = 0.20;
        targetScaleMult = 1.0;
        targetRadius = b.baseRadius;
      }

      // Smooth radius and angular integration
      b.currentRadius += (targetRadius - b.currentRadius) * Math.min(delta * 4.5, 0.4);
      b.currentAngle += b.speed * speedMult * delta;

      const renderAngle = b.currentAngle + spiralSpin;

      // 3D Saturn Ring orbital coordinates (X-Z plane)
      const x = Math.cos(renderAngle) * b.currentRadius;
      const y = 0.0;
      const z = Math.sin(renderAngle) * b.currentRadius;

      b.sprite.position.set(x, y, z);
      b.sprite.scale.set(b.baseScale * targetScaleMult, b.baseScale * 1.06 * targetScaleMult, 1.0);
      b.sprite.material.opacity = THREE.MathUtils.lerp(b.sprite.material.opacity, targetOpacity, 0.12);
    }
  }

  setWinnerFocus(winnerId) {
    if (!winnerId) {
      if (this.winnerBadge) {
        this.winnerBadge.isWinner = false;
        this._renderBadgeCanvas(this.winnerBadge, null);
        this.winnerBadge = null;
      }
      this.winnerProgress = 0.0;
      return;
    }

    const match = this.badges.find(b => b.emp.id === winnerId || b.emp.employeeId === winnerId);
    if (match) {
      this.winnerBadge = match;
      match.isWinner = true;
      // Winner starts at singularity center (0, 0, 0)!
      this.winnerCurrentPos.set(0, 0, 0);
      this.winnerProgress = 0.0;
      this.winnerExplosionDelay = 0.0;
      match.sprite.position.set(0, 0, 0);
      match.sprite.scale.set(0.01, 0.01, 1.0);
      match.sprite.material.opacity = 0.0;
      this._renderBadgeCanvas(match, null);
    }
  }

  reset() {
    this.setWinnerFocus(null);
    for (let i = 0; i < this.badges.length; i++) {
      const b = this.badges[i];
      b.currentRadius = b.baseRadius;
      b.sprite.material.opacity = 1.0;
      b.sprite.scale.set(b.baseScale, b.baseScale * 1.06, 1.0);
    }
  }
}
