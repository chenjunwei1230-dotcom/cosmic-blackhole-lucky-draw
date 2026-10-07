import { resolveAvatarUrl } from './winnerModal.js';

export class CandidateRoller {
  constructor({ roster }) {
    this.roster = roster;
    this.container = null;
    this.timer = null;
    this.isRunning = false;
    this.isStopping = false;
    this.currentInterval = 50;
    this.stopSteps = 0;
    this.targetWinner = null;
    this.pool = [];
    this.currentIndex = 0;

    this._buildDOM();
  }

  _buildDOM() {
    this.container = document.createElement('div');
    this.container.className = 'candidate-roller-container';
    this.container.id = 'candidate-roller';
    this.container.innerHTML = `
      <div class="roller-card">
        <!-- Ambient Backlight -->
        <div class="roller-ambient-glow"></div>

        <!-- Header -->
        <div class="roller-header">
          <div class="roller-indicator">
            <span class="indicator-dot"></span>
            <span class="indicator-text" id="roller-status-text">ORBITAL SELECTION ACTIVE</span>
          </div>
          <div class="roller-tier-tag" id="roller-tier-tag">🌟 特等奖</div>
        </div>

        <!-- Center Avatar Presentation -->
        <div class="roller-avatar-zone">
          <div class="roller-avatar-halo"></div>
          <div class="roller-avatar-frame" id="roller-avatar-frame">
            <img id="roller-avatar-img" class="roller-avatar-img" referrerpolicy="no-referrer" alt="" style="display: none;" />
            <span id="roller-avatar-text" class="roller-avatar-initial">?</span>
          </div>
        </div>

        <!-- Candidate Name & Typography -->
        <div class="roller-name-zone">
          <div class="roller-name" id="roller-name">CALCULATING...</div>
          <div class="roller-meta">
            <span class="roller-dept" id="roller-dept">SURVEY CORPS</span>
            <span class="roller-divider">·</span>
            <span class="roller-id" id="roller-id">ID: AOT001</span>
          </div>
        </div>

        <!-- Subtle Resonance Bar -->
        <div class="roller-resonance-track">
          <div class="roller-resonance-fill"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Cache elements
    this.elStatusText = this.container.querySelector('#roller-status-text');
    this.elTierTag    = this.container.querySelector('#roller-tier-tag');
    this.elAvatarImg  = this.container.querySelector('#roller-avatar-img');
    this.elAvatarTxt  = this.container.querySelector('#roller-avatar-text');
    this.elName       = this.container.querySelector('#roller-name');
    this.elDept       = this.container.querySelector('#roller-dept');
    this.elId         = this.container.querySelector('#roller-id');
    this.elCard       = this.container.querySelector('.roller-card');
  }

  /**
   * Start high-speed rolling
   */
  start(prizeTier = null, batchCount = 1) {
    this.pool = this.roster.getAvailablePool();
    if (this.pool.length === 0) return;

    this.isRunning = true;
    this.isStopping = false;
    this.currentInterval = 45;
    this.stopSteps = 0;
    this.targetWinner = null;

    if (prizeTier) {
      this.elTierTag.textContent = `${prizeTier.icon || '🌟'} ${prizeTier.name}${batchCount > 1 ? ` (x${batchCount})` : ''}`;
    }

    this.elStatusText.textContent = batchCount > 1
      ? `QUANTUM MULTI-STREAM SCAN [x${batchCount}]`
      : 'QUANTUM SINGULARITY SAMPLING';

    this.container.classList.remove('stopping', 'hiding');
    this.container.classList.add('active');

    this._scheduleNextTick();
  }

  /**
   * Begin deceleration towards target winner(s)
   */
  stop(targetWinners = []) {
    if (!this.isRunning) return;

    this.isStopping = true;
    this.targetWinner = Array.isArray(targetWinners) && targetWinners.length > 0 ? targetWinners[0] : null;
    this.stopSteps = 0;
    this.currentInterval = 65;

    this.container.classList.add('stopping');
    this.elStatusText.textContent = 'SINGULARITY COLLAPSING · TARGET LOCKING...';
  }

  /**
   * Hide the roller abruptly or smoothly
   */
  hide(instant = false) {
    this.isRunning = false;
    this.isStopping = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (instant) {
      this.container.classList.remove('active', 'stopping', 'hiding');
    } else {
      this.container.classList.add('hiding');
      setTimeout(() => {
        this.container.classList.remove('active', 'stopping', 'hiding');
      }, 350);
    }
  }

  _scheduleNextTick() {
    if (!this.isRunning) return;

    this.timer = setTimeout(() => {
      this._tick();
    }, this.currentInterval);
  }

  _tick() {
    if (!this.isRunning || this.pool.length === 0) return;

    // Pick a candidate
    let candidate;
    if (this.isStopping && this.stopSteps >= 6 && this.targetWinner) {
      candidate = this.targetWinner;
    } else {
      const randIdx = Math.floor(Math.random() * this.pool.length);
      candidate = this.pool[randIdx];
    }

    this._displayCandidate(candidate);

    if (this.isStopping) {
      this.stopSteps++;
      // Deceleration curve: 65 -> 95 -> 140 -> 210 -> 310 -> 450 -> lock
      this.currentInterval = Math.round(this.currentInterval * 1.45);
      if (this.stopSteps >= 8) {
        // Locked on candidate!
        return;
      }
    }

    this._scheduleNextTick();
  }

  _displayCandidate(candidate) {
    if (!candidate) return;

    this.elName.textContent = candidate.name || 'UNKNOWN';
    this.elDept.textContent = candidate.department || 'GENERAL';
    const empId = candidate.employeeId || `EMP${String(candidate.id).padStart(3, '0')}`;
    this.elId.textContent = `ID: ${empId}`;

    // Avatar display
    let avatarUrl = candidate.avatar;
    if (!avatarUrl || avatarUrl.startsWith('http')) {
      avatarUrl = `/avatars/${empId}.png`;
    }

    if (avatarUrl) {
      this.elAvatarImg.src = avatarUrl;
      this.elAvatarImg.style.display = 'block';
      this.elAvatarTxt.style.display = 'none';

      // Fallback if image fails to load
      this.elAvatarImg.onerror = () => {
        // Try .jpg if .png failed
        if (avatarUrl.endsWith('.png')) {
          this.elAvatarImg.src = avatarUrl.replace('.png', '.jpg');
          return;
        }
        this.elAvatarImg.style.display = 'none';
        this.elAvatarTxt.style.display = 'block';
        this.elAvatarTxt.textContent = candidate.name ? candidate.name.charAt(0) : '?';
      };
    } else {
      this.elAvatarImg.style.display = 'none';
      this.elAvatarTxt.style.display = 'block';
      this.elAvatarTxt.textContent = candidate.name ? candidate.name.charAt(0) : '?';
    }

    // Micro jitter/glitch pulse on card for intensity
    this.elCard.classList.remove('pulse-glitch');
    void this.elCard.offsetWidth; // trigger reflow
    this.elCard.classList.add('pulse-glitch');
  }
}
