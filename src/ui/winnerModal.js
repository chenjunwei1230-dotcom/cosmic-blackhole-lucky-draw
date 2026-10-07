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
    this._buildDOM();
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
    });
  }

  // ── Single Hero 3D Card ──────────────────────────────────────
  async _renderSingleHeroCard(winner, prizeTier) {
    const tier = prizeTier || winner.prize || {
      name: '幸运大奖',
      enName: 'LUCKY PRIZE',
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
    badge.innerHTML = `<span class="badge-icon">${tier.icon || '🌟'}</span> <span class="badge-title">${tier.name} · ${tier.enName || ''}</span>`;
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
      name: '幸运大奖',
      enName: 'LUCKY DRAW',
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
        <span class="batch-tier-name">${tier.name} (${tier.enName || ''})</span>
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
