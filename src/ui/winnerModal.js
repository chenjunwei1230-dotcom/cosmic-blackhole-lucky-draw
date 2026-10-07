// ─── Avatar Resolution Helper ──────────────────────────────────
export function resolveAvatarUrl(winner) {
  return new Promise((resolve) => {
    if (!winner) return resolve(null);
    const candidates = [];
    const empId = winner.employeeId || (winner.id ? `EMP${String(winner.id).padStart(3, '0')}` : null);
    if (empId) {
      candidates.push(`/avatars/${empId}.png`, `/avatars/${empId}.jpg`);
    }
    if (winner.id) {
      candidates.push(`/avatars/${winner.id}.png`, `/avatars/${winner.id}.jpg`);
    }
    if (winner.avatar) candidates.push(winner.avatar);

    let i = 0;
    function tryNext() {
      if (i >= candidates.length) {
        resolve(null);
        return;
      }
      const testUrl = candidates[i++];
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve(testUrl);
        } else {
          tryNext();
        }
      };
      img.onerror = () => tryNext();
      img.src = testUrl;
    }
    tryNext();
  });
}

// ─── 3D Holographic Winner Modal & Batch Grid ──────────────────
export class WinnerModal {
  constructor() {
    this.overlay = null;
    this.flashEl = null;
    this.contentContainer = null;
    this.onDismiss = null;
    this._buildDOM();
  }

  setOnDismiss(cb) {
    this.onDismiss = cb;
  }

  _buildDOM() {
    // ── Screen flash overlay (Supernova) ──
    this.flashEl = document.createElement('div');
    this.flashEl.className = 'screen-flash';
    document.body.appendChild(this.flashEl);

    // ── Main Winner Overlay ──
    this.overlay = document.createElement('div');
    this.overlay.className = 'winner-overlay';
    this.overlay.id = 'winner-overlay';

    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'winner-content-container';
    this.overlay.appendChild(this.contentContainer);

    // ── Celebratory Confetti Canvas ──
    this.confettiCanvas = document.createElement('canvas');
    this.confettiCanvas.className = 'winner-confetti-canvas';
    this.confettiCtx = this.confettiCanvas.getContext('2d');
    this.overlay.appendChild(this.confettiCanvas);
    this.confettiParticles = [];
    this.confettiAnimId = null;

    // Click anywhere on overlay to dismiss
    this.overlay.style.cursor = 'pointer';
    this.overlay.addEventListener('click', () => {
      if (this.onDismiss) {
        this.onDismiss();
      }
    });

    document.body.appendChild(this.overlay);
  }

  // ── Show Winners (Single or Batch) ───────────────────────────
  async show(winnersInput, prizeTier = null) {
    const winners = Array.isArray(winnersInput) ? winnersInput : [winnersInput];
    if (winners.length === 0) return;

    this.contentContainer.innerHTML = '';

    if (winners.length === 1) {
      await this._renderSingleHeroCard(winners[0], prizeTier);
    } else {
      await this._renderBatchGrid(winners, prizeTier);
    }

    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
      this._startCelebratoryConfetti();
    });
  }

  // ── Celebratory Golden Confetti & Stardust Shower ────────────
  _startCelebratoryConfetti() {
    this._stopCelebratoryConfetti();
    const w = (this.confettiCanvas.width = window.innerWidth);
    const h = (this.confettiCanvas.height = window.innerHeight);

    const colors = [
      '#ffe885', '#ffd700', '#f5d061', '#e6b800', 
      '#ffffff', '#fff3cc', '#e2c56a', '#c084fc'
    ];

    this.confettiParticles = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      this.confettiParticles.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.45,
        y: h * 0.45 + (Math.random() - 0.5) * h * 0.2,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        tilt: Math.random() * Math.PI,
        vTilt: Math.random() * 0.12 + 0.05,
        opacity: 1.0,
        shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'diamond' : 'circle'),
        life: 0,
        maxLife: Math.random() * 140 + 180
      });
    }

    const animate = () => {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
      const gravity = 0.16;
      const drag = 0.985;
      let aliveCount = 0;

      for (let i = 0; i < this.confettiParticles.length; i++) {
        const p = this.confettiParticles[i];
        p.life++;
        if (p.life > p.maxLife) {
          p.opacity -= 0.015;
        }
        if (p.opacity <= 0) continue;
        aliveCount++;

        p.vx *= drag;
        p.vy = (p.vy + gravity) * drag;
        p.x += p.vx + Math.sin(p.life * 0.06) * 0.9;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.tilt += p.vTilt;

        const alpha = Math.max(0, p.opacity);
        this.confettiCtx.save();
        this.confettiCtx.translate(p.x, p.y);
        this.confettiCtx.rotate(p.rotation);
        this.confettiCtx.scale(1, Math.cos(p.tilt));

        this.confettiCtx.globalAlpha = alpha;
        this.confettiCtx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'diamond') {
          this.confettiCtx.beginPath();
          this.confettiCtx.moveTo(0, -p.size / 2);
          this.confettiCtx.lineTo(p.size / 2, 0);
          this.confettiCtx.lineTo(0, p.size / 2);
          this.confettiCtx.lineTo(-p.size / 2, 0);
          this.confettiCtx.closePath();
          this.confettiCtx.fill();
        } else {
          this.confettiCtx.beginPath();
          this.confettiCtx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          this.confettiCtx.fill();
        }
        this.confettiCtx.restore();
      }

      if (aliveCount > 0) {
        this.confettiAnimId = requestAnimationFrame(animate);
      } else {
        this._stopCelebratoryConfetti();
      }
    };

    this.confettiAnimId = requestAnimationFrame(animate);
  }

  _stopCelebratoryConfetti() {
    if (this.confettiAnimId) {
      cancelAnimationFrame(this.confettiAnimId);
      this.confettiAnimId = null;
    }
    if (this.confettiCtx && this.confettiCanvas) {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }
    this.confettiParticles = [];
  }

  // ── Single Hero 3D Card ──────────────────────────────────────
  async _renderSingleHeroCard(winner, prizeTier) {
    const tier = prizeTier || winner.prize || {
      name: 'Grand Prize',
      enName: 'Grand Prize',
      icon: '🌟',
      color: '#ffd700'
    };

    const card = document.createElement('div');
    card.className = 'winner-card single-hero-card';

    // Luxury ambient backlight aura
    const aura = document.createElement('div');
    aura.className = 'winner-card-aura';
    card.appendChild(aura);

    // Glowing Prize Tier Badge
    const badge = document.createElement('div');
    badge.className = 'winner-tier-badge';
    badge.innerHTML = `<span class="badge-icon">${tier.icon || '🌟'}</span> <span class="badge-title">${tier.name}</span>`;
    card.appendChild(badge);

    // Avatar Container
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'winner-avatar-wrapper';

    const avatarRing = document.createElement('div');
    avatarRing.className = 'avatar-ring';
    avatarWrapper.appendChild(avatarRing);

    const avatarCore = document.createElement('div');
    avatarCore.className = 'winner-avatar';

    // Resolve avatar photo or fallback initials
    const photoUrl = await resolveAvatarUrl(winner);
    if (photoUrl) {
      avatarCore.classList.add('has-photo');
      const img = document.createElement('img');
      img.referrerPolicy = 'no-referrer';
      img.src = photoUrl;
      img.alt = winner.name;
      img.className = 'avatar-img';
      avatarCore.appendChild(img);
    } else {
      avatarCore.textContent = winner.name ? winner.name.charAt(0) : '?';
    }

    avatarWrapper.appendChild(avatarCore);
    card.appendChild(avatarWrapper);

    // Winner Name
    const nameEl = document.createElement('div');
    nameEl.className = 'winner-name';
    nameEl.textContent = winner.name;
    card.appendChild(nameEl);

    // Dept & ID meta
    const deptEl = document.createElement('div');
    deptEl.className = 'winner-dept';
    const empId = winner.employeeId || `EMP${String(winner.id).padStart(3, '0')}`;
    deptEl.innerHTML = `<span class="dept-text">${winner.department}</span> <span class="id-tag">${empId}</span>`;
    card.appendChild(deptEl);

    // Bottom luxury footer
    const footerEl = document.createElement('div');
    footerEl.className = 'winner-number';
    footerEl.textContent = `✦ CELESTIAL GALA 2026 OFFICIAL DRAW ✦`;
    card.appendChild(footerEl);

    this.contentContainer.appendChild(card);
  }

  // ── Multi-Card Batch Draw Grid ───────────────────────────────
  async _renderBatchGrid(winners, prizeTier) {
    const tier = prizeTier || (winners[0] && winners[0].prize) || {
      name: 'Lucky Prize',
      enName: 'Lucky Draw',
      icon: '🎁',
      color: '#ffd700'
    };

    const container = document.createElement('div');
    container.className = 'batch-draw-container';

    // Header bar
    const header = document.createElement('div');
    header.className = 'batch-header';
    header.innerHTML = `
      <div class="batch-title">
        <span class="batch-icon">${tier.icon || '🎁'}</span>
        <span class="batch-tier-name">${tier.name}</span>
        <span class="batch-count-pill">${winners.length} WINNERS</span>
      </div>
      <div class="batch-subtitle">CELESTIAL HARMONIC DRAW CONFIRMED</div>
    `;
    container.appendChild(header);

    // Responsive Grid
    const grid = document.createElement('div');
    grid.className = `batch-grid batch-grid-${winners.length <= 5 ? '5' : '10'}`;

    // Resolve avatars in parallel
    const photoUrls = await Promise.all(winners.map(w => resolveAvatarUrl(w)));

    winners.forEach((winner, index) => {
      const card = document.createElement('div');
      card.className = 'batch-card';
      card.style.animationDelay = `${index * 0.07}s`;

      // Sequential badge
      const numBadge = document.createElement('div');
      numBadge.className = 'batch-card-seq';
      numBadge.textContent = `#${String(index + 1).padStart(2, '0')}`;
      card.appendChild(numBadge);

      // Mini Avatar
      const avatarBox = document.createElement('div');
      avatarBox.className = 'batch-avatar-box';
      const photoUrl = photoUrls[index];

      if (photoUrl) {
        avatarBox.classList.add('has-photo');
        const img = document.createElement('img');
        img.referrerPolicy = 'no-referrer';
        img.src = photoUrl;
        img.alt = winner.name;
        img.className = 'batch-avatar-img';
        avatarBox.appendChild(img);
      } else {
        avatarBox.textContent = winner.name ? winner.name.charAt(0) : '?';
      }
      card.appendChild(avatarBox);

      // Name
      const name = document.createElement('div');
      name.className = 'batch-winner-name';
      name.textContent = winner.name;
      card.appendChild(name);

      // Employee ID
      const empId = winner.employeeId || `EMP${String(winner.id).padStart(3, '0')}`;
      const idTag = document.createElement('div');
      idTag.className = 'batch-emp-id';
      idTag.textContent = empId;
      card.appendChild(idTag);

      // Department
      const dept = document.createElement('div');
      dept.className = 'batch-winner-dept';
      dept.textContent = winner.department;
      card.appendChild(dept);

      grid.appendChild(card);
    });

    container.appendChild(grid);
    this.contentContainer.appendChild(container);
  }

  // ── Hide ─────────────────────────────────────────────────────
  hide() {
    this.overlay.classList.remove('active');
    this._stopCelebratoryConfetti();
    setTimeout(() => {
      if (!this.overlay.classList.contains('active')) {
        this.contentContainer.innerHTML = '';
      }
    }, 400);
  }

  // ── Supernova Screen Flash ───────────────────────────────────
  triggerFlash() {
    this.flashEl.classList.add('flash-active');
    setTimeout(() => this.flashEl.classList.remove('flash-active'), 350);
  }
}
