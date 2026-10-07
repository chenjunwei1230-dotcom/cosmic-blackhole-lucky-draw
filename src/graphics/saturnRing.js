import * as THREE from 'three';
import defaultEmployees from '../../employee.json' with { type: 'json' };

/**
 * SaturnRing / AccretionVortex - Embedded 3D Swirling Attendee Fleet
 * Badges spin DIRECTLY WITH the black hole accretion disk (R = 1.35 to 2.90),
 * swirling in harmony with the cosmic matter, NOT outside.
 */
export class SaturnRing {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.badges = [];
    this.diskTiltX = -Math.PI * 0.38; // Matches accretion disk plane

    this.group.rotation.x = this.diskTiltX;

    this.winnerBadge = null;
    this.winnerTargetPos = new THREE.Vector3(0, 0.2, 5.8);
    this.winnerCurrentPos = new THREE.Vector3();
    this.winnerProgress = 0.0;

    this.initAttendees();
  }

  initAttendees() {
    const list = (defaultEmployees && defaultEmployees.length > 0) ? defaultEmployees : [];
    const count = list.length;
    if (count === 0) return;

    // Distribute 100 attendees across 4 swirling tracks directly beside the ball in the accretion disk:
    // Track 0: R = 1.15, 14 badges (directly hugging the black hole ball)
    // Track 1: R = 1.65, 20 badges
    // Track 2: R = 2.15, 28 badges
    // Track 3: R = 2.70, 38 badges
    // Total = 14 + 20 + 28 + 38 = 100 badges
    const trackConfigs = [
      { radius: 1.15, count: 14, baseScale: 0.21, speed: 0.26 },
      { radius: 1.65, count: 20, baseScale: 0.23, speed: 0.21 },
      { radius: 2.15, count: 28, baseScale: 0.25, speed: 0.17 },
      { radius: 2.70, count: 38, baseScale: 0.28, speed: 0.14 }
    ];

    let empIndex = 0;
    for (let t = 0; t < trackConfigs.length; t++) {
      const cfg = trackConfigs[t];
      const angleStep = (Math.PI * 2) / cfg.count;
      // Stagger initial angle for each track to create organic spiral flow
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
    img.referrerPolicy = 'no-referrer';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      badgeData.isImageLoaded = true;
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

  _renderBadgeCanvas(badgeData, img) {
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
      ctx.strokeStyle = 'rgba(245, 208, 97, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(245, 208, 97, 0.55)';
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

    if (img && badgeData.isImageLoaded) {
      ctx.drawImage(img, centerX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
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

      // ── Winner Emergence Physics (Detach and fly to front screen) ──
      if (b === this.winnerBadge && (isSupernova || isReveal)) {
        this.winnerProgress = Math.min(this.winnerProgress + delta * 2.0, 1.0);
        const ease = 1 - Math.pow(1 - this.winnerProgress, 3); // cubic ease out

        // Animate from center forward directly to front screen view
        b.sprite.position.lerpVectors(this.winnerCurrentPos, this.winnerTargetPos, ease);
        const targetScale = b.baseScale * (1.0 + ease * 3.8); // expand into hero size
        b.sprite.scale.set(targetScale, targetScale * 1.06, 1.0);
        b.sprite.material.opacity = 1.0;
        continue;
      }

      // ── Normal Accretion Vortex Motion ──
      let targetRadiusRatio = 1.0;
      let spiralAngleOffset = 0.0;

      if (isCollapsing) {
        // Contract along smooth Archimedean spiral directly into event horizon
        targetRadiusRatio = 1.0 - Math.min(collapseProgress * 0.70, 0.75);
        spiralAngleOffset = collapseProgress * Math.PI * 3.0;
      } else if (isStopping) {
        targetRadiusRatio = 0.30;
        spiralAngleOffset = Math.PI * 3.0;
      } else if (isSupernova) {
        targetRadiusRatio = 0.25;
      } else if (isReveal) {
        targetRadiusRatio = 1.0;
      }

      // Smooth radius interpolation
      const targetRadius = b.baseRadius * targetRadiusRatio;
      b.currentRadius += (targetRadius - b.currentRadius) * Math.min(delta * 3.5, 0.3);

      // Swirl angle progresses at Keplerian speed WITH the accretion disk
      b.currentAngle += b.speed * speedMult * delta;

      const renderAngle = b.currentAngle + spiralAngleOffset;

      // Position in accretion disk frame
      const x = Math.cos(renderAngle) * b.currentRadius;
      const z = Math.sin(renderAngle) * b.currentRadius;
      // Subtle vertical wave during collapse, flat during idle
      const y = isCollapsing ? Math.sin(renderAngle * 2.0) * 0.06 : 0.0;

      b.sprite.position.set(x, y, z);

      // Scale modulation as it approaches singularity
      const scaleFactor = isCollapsing ? Math.max(b.currentRadius / b.baseRadius, 0.6) : 1.0;
      b.sprite.scale.set(b.baseScale * scaleFactor, b.baseScale * 1.06 * scaleFactor, 1.0);

      // In supernova / reveal, softly dim background candidates so winner shines
      if (isSupernova || isReveal) {
        b.sprite.material.opacity = THREE.MathUtils.lerp(b.sprite.material.opacity, 0.20, 0.08);
      } else {
        b.sprite.material.opacity = THREE.MathUtils.lerp(b.sprite.material.opacity, 1.0, 0.08);
      }
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
      this.winnerCurrentPos.copy(match.sprite.position);
      this.winnerProgress = 0.0;
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
