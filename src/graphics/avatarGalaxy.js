import * as THREE from 'three';
import defaultEmployees from '../../employee.json' with { type: 'json' };

export class AvatarGalaxy {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.cards = [];
    this.orbitRadiusMin = 3.2;
    this.orbitRadiusMax = 8.0;
    this.diskTiltX = -Math.PI * 0.38; // Matches accretion disk orientation

    this.group.rotation.x = this.diskTiltX;

    this.winnerCard = null;
    this.winnerTargetPos = new THREE.Vector3(0, 0.3, 7.2);
    this.winnerCurrentPos = new THREE.Vector3();
    this.winnerProgress = 0.0;

    this.initAttendees();
  }

  initAttendees() {
    const list = (defaultEmployees && defaultEmployees.length > 0) ? defaultEmployees : [];
    const count = list.length;
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const emp = list[i];
      const card = this._createCardMesh(emp, i, count);
      this.cards.push(card);
      this.group.add(card.sprite);
    }
  }

  _createCardMesh(emp, index, total) {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 320;
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
    // Base dimensions in 3D world units (refined scale so black hole has breathing space)
    sprite.scale.set(0.64, 0.73, 1.0);

    // Orbital positioning across 5 layered concentric galactic rings
    const ringIndex = index % 5;
    const radiusBase = this.orbitRadiusMin + (ringIndex / 4.0) * (this.orbitRadiusMax - this.orbitRadiusMin);
    const radius = radiusBase + (Math.random() - 0.5) * 0.35;
    const angle = (index / total) * Math.PI * 2 + (ringIndex * 0.45);
    const speed = (0.24 / Math.sqrt(radius)) * (0.88 + (index % 5) * 0.06);
    const verticalOffset = (Math.sin(index * 1.5) * 0.18) * (1.0 - ringIndex * 0.12);

    const cardData = {
      emp,
      sprite,
      texture,
      canvas,
      ctx,
      baseRadius: radius,
      currentRadius: radius,
      angle: angle,
      speed: speed,
      verticalOffset: verticalOffset,
      baseScale: 0.64,
      isImageLoaded: false,
      isWinner: false
    };

    // Initial render with procedural badge
    this._renderCanvas(cardData, null);

    // Asynchronously load real attendee photo
    const avatarUrl = emp.avatar ? emp.avatar.replace(/^\./, '') : `/avatars/${emp.id}.png`;
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cardData.isImageLoaded = true;
      this._renderCanvas(cardData, img);
    };
    img.onerror = () => {
      if (avatarUrl.endsWith('.png')) {
        img.src = avatarUrl.replace('.png', '.jpg');
      }
    };
    img.src = avatarUrl;

    return cardData;
  }

  _renderCanvas(cardData, img) {
    const { canvas, ctx, emp, texture } = cardData;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const cardW = 256;
    const cardH = 296;
    const cardX = (w - cardW) / 2;
    const cardY = (h - cardH) / 2;
    const r = 22;

    // ── 1. Luxury Obsidian Frosted Glass Body ──
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, r);
    ctx.closePath();

    // Deep void obsidian gradient
    const grad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
    grad.addColorStop(0, 'rgba(16, 20, 32, 0.90)');
    grad.addColorStop(1, 'rgba(8, 10, 18, 0.96)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Refined Champagne Gold Rim
    ctx.strokeStyle = cardData.isWinner ? 'rgba(255, 225, 120, 0.95)' : 'rgba(245, 208, 97, 0.38)';
    ctx.lineWidth = cardData.isWinner ? 3.5 : 2.0;
    ctx.stroke();

    // Soft top bevel highlight
    ctx.beginPath();
    ctx.moveTo(cardX + r, cardY);
    ctx.lineTo(cardX + cardW - r, cardY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // ── 2. Circular Avatar Frame ──
    const avatarX = w / 2;
    const avatarY = cardY + 80;
    const avatarRadius = 56;

    // Outer decorative champagne ring with soft glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = cardData.isWinner ? 'rgba(255, 225, 120, 0.9)' : 'rgba(245, 208, 97, 0.55)';
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (img && cardData.isImageLoaded) {
      ctx.drawImage(img, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    } else {
      // Procedural Initial Fallback
      const initialGrad = ctx.createLinearGradient(avatarX - avatarRadius, avatarY - avatarRadius, avatarX + avatarRadius, avatarY + avatarRadius);
      initialGrad.addColorStop(0, '#f5d061');
      initialGrad.addColorStop(1, '#c29b38');
      ctx.fillStyle = initialGrad;
      ctx.fill();

      ctx.fillStyle = '#060a14';
      ctx.font = 'bold 46px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emp.name ? emp.name.charAt(0) : '?', avatarX, avatarY + 2);
    }
    ctx.restore();

    // ── 3. Typographic Hierarchy ──
    // Candidate Name
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Segoe UI", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;

    let displayName = emp.name || 'Candidate';
    if (displayName.length > 15) {
      displayName = displayName.slice(0, 14) + '…';
    }
    ctx.fillText(displayName, w / 2, cardY + 174);

    // Department Tag
    ctx.fillStyle = '#f5d061';
    ctx.font = '600 12.5px "Segoe UI", sans-serif';
    let displayDept = (emp.department || 'SURVEY CORPS').toUpperCase();
    if (displayDept.length > 18) displayDept = displayDept.slice(0, 17) + '…';
    ctx.fillText(displayDept, w / 2, cardY + 206);

    // Refined ID Pill Badge
    const empId = emp.employeeId || emp.id;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 44, cardY + 232, 88, 22, 11);
    ctx.fill();

    ctx.fillStyle = '#9cb0c9';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(empId, w / 2, cardY + 244);
    ctx.restore();

    texture.needsUpdate = true;
  }

  update(delta, state, collapseProgress = 0.0) {
    if (!this.cards || this.cards.length === 0) return;

    const isCollapsing = (state === 'COLLAPSING');
    const isStopping   = (state === 'STOPPING');
    const isSupernova  = (state === 'SUPERNOVA');
    const isReveal     = (state === 'REVEAL');

    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i];

      // If this card is the designated winner during REVEAL
      if (c === this.winnerCard && (isSupernova || isReveal)) {
        this.winnerProgress = Math.min(this.winnerProgress + delta * 1.8, 1.0);
        const ease = 1 - Math.pow(1 - this.winnerProgress, 3); // cubic ease out

        // Animate out from disk forward into camera view
        c.sprite.position.lerpVectors(this.winnerCurrentPos, this.winnerTargetPos, ease);
        const targetScale = c.baseScale * (1.0 + ease * 0.9);
        c.sprite.scale.set(targetScale, targetScale * 1.14, 1.0);
        c.sprite.material.opacity = 1.0;
        continue;
      }

      // Dynamic speed ramp for regular galaxy cards
      let speedMult = 1.0;
      let targetRadiusRatio = 1.0;

      if (isCollapsing) {
        speedMult = 1.0 + collapseProgress * 5.5;
        // Inward vortex spiral towards event horizon
        targetRadiusRatio = 1.0 - Math.min(collapseProgress * 0.65, 0.70);
      } else if (isStopping) {
        speedMult = 1.6;
        targetRadiusRatio = 0.35;
      } else if (isSupernova) {
        speedMult = 0.4;
        targetRadiusRatio = 0.28;
      } else if (isReveal) {
        speedMult = 0.25;
        targetRadiusRatio = 0.95;
      }

      // Smooth radius interpolation
      const targetRadius = c.baseRadius * targetRadiusRatio;
      c.currentRadius += (targetRadius - c.currentRadius) * Math.min(delta * 3.2, 0.28);

      // Orbital progression
      c.angle += c.speed * speedMult * delta;

      // Position in local accretion plane
      const x = Math.cos(c.angle) * c.currentRadius;
      const z = Math.sin(c.angle) * c.currentRadius;
      const y = c.verticalOffset + Math.sin(c.angle * 2.0 + i) * 0.07 * (isCollapsing ? 0.3 : 1.0);

      c.sprite.position.set(x, y, z);

      // Distance-based scale modulation
      const distFromCenter = c.currentRadius;
      const scaleFactor = THREE.MathUtils.clamp(distFromCenter / 4.8, 0.72, 1.2);
      c.sprite.scale.set(c.baseScale * scaleFactor, c.baseScale * 1.14 * scaleFactor, 1.0);

      // Atmospheric opacity modulation
      if (isSupernova || isReveal) {
        // Softly dim other cards so focus is on winner
        c.sprite.material.opacity = THREE.MathUtils.lerp(c.sprite.material.opacity, 0.18, 0.08);
      } else {
        c.sprite.material.opacity = THREE.MathUtils.lerp(c.sprite.material.opacity, 1.0, 0.08);
      }
    }
  }

  setWinnerFocus(winnerId) {
    if (!winnerId) {
      if (this.winnerCard) {
        this.winnerCard.isWinner = false;
        this._renderCanvas(this.winnerCard, null);
        this.winnerCard = null;
      }
      this.winnerProgress = 0.0;
      return;
    }

    const match = this.cards.find(c => c.emp.id === winnerId || c.emp.employeeId === winnerId);
    if (match) {
      this.winnerCard = match;
      match.isWinner = true;
      this.winnerCurrentPos.copy(match.sprite.position);
      this.winnerProgress = 0.0;
      this._renderCanvas(match, null);
    }
  }

  reset() {
    this.setWinnerFocus(null);
    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i];
      c.currentRadius = c.baseRadius;
      c.sprite.material.opacity = 1.0;
    }
  }
}

