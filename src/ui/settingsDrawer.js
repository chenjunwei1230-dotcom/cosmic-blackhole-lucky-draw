// ─── Settings Drawer Component (Referenced from annual-gala-lucky-draw) ─────
export class SettingsDrawer {
  constructor({ prizeManager, roster, onSettingsChanged }) {
    this.prizeManager = prizeManager;
    this.roster = roster;
    this.onSettingsChanged = onSettingsChanged || (() => {});
    this.isOpen = false;
    this.activeTab = 'tiers'; // 'tiers' | 'branding' | 'roster'

    // Branding config with localStorage persistence
    this.branding = this._loadBranding();

    this._buildDOM();
    this._applyBrandingToDOM();
  }

  _loadBranding() {
    try {
      const saved = localStorage.getItem('cosmic_branding_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      brandTitle: 'CELESTIAL GALA',
      brandYear: '2026'
    };
  }

  _saveBranding() {
    try {
      localStorage.setItem('cosmic_branding_config', JSON.stringify(this.branding));
    } catch (e) {}
    this._applyBrandingToDOM();
    this.onSettingsChanged();
  }

  _applyBrandingToDOM() {
    const titleEl = document.querySelector('.brand-title');
    const yearEl = document.querySelector('.brand-year');
    if (titleEl) titleEl.textContent = this.branding.brandTitle;
    if (yearEl) yearEl.textContent = this.branding.brandYear;
  }

  _buildDOM() {
    // ── Floating Toggle Tab on Right Screen Edge (Positioned above LOG) ──
    this.toggleTab = document.createElement('button');
    this.toggleTab.className = 'settings-floating-tab';
    this.toggleTab.id = 'settings-tab-btn';
    this.toggleTab.title = 'Open Settings (S)';
    this.toggleTab.innerHTML = `
      <span class="tab-icon">⚙️</span>
      <span class="tab-text">SETTINGS</span>
    `;
    this.toggleTab.addEventListener('click', () => this.toggle());
    document.body.appendChild(this.toggleTab);

    // ── Drawer Container ──
    this.drawer = document.createElement('div');
    this.drawer.className = 'settings-drawer';
    this.drawer.id = 'settings-drawer';

    // Header
    const header = document.createElement('div');
    header.className = 'drawer-header';
    header.innerHTML = `
      <div class="drawer-title-group">
        <div class="drawer-title">SETTINGS &amp; CONFIGURATION</div>
        <div class="drawer-subtitle">PRIZE TIERS · BRANDING · CANDIDATES</div>
      </div>
      <button class="drawer-close-btn" id="settings-close" title="Close Settings (S / ESC)">✕</button>
    `;
    this.drawer.appendChild(header);

    // Tab Navigation Bar
    this.tabBar = document.createElement('div');
    this.tabBar.className = 'settings-tabs-bar';
    this.tabBar.innerHTML = `
      <button class="settings-tab-btn active" data-tab="tiers">
        <span>🏆 Prize Tiers &amp; Quotas</span>
      </button>
      <button class="settings-tab-btn" data-tab="branding">
        <span>✦ Gala Branding</span>
      </button>
      <button class="settings-tab-btn" data-tab="roster">
        <span>👥 Candidate Pool</span>
      </button>
    `;
    this.tabBar.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.tabBar.querySelectorAll('.settings-tab-btn').forEach(b => {
          b.classList.toggle('active', b === btn);
        });
        this.renderContent();
      });
    });
    this.drawer.appendChild(this.tabBar);

    // Content Body Area
    this.contentBody = document.createElement('div');
    this.contentBody.className = 'settings-content-body';
    this.drawer.appendChild(this.contentBody);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'drawer-footer';
    footer.innerHTML = `
      <button class="primary-btn apply-btn" id="settings-save-return">
        <span>✓ Save &amp; Return to Stage</span>
      </button>
    `;
    this.drawer.appendChild(footer);

    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'drawer-backdrop settings-backdrop';
    this.backdrop.addEventListener('click', () => this.close());
    document.body.appendChild(this.backdrop);

    document.body.appendChild(this.drawer);

    // Internal bindings
    header.querySelector('#settings-close').addEventListener('click', () => this.close());
    footer.querySelector('#settings-save-return').addEventListener('click', () => this.close());

    // Toast Container
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'cosmic-toast-container';
    document.body.appendChild(this.toastContainer);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `cosmic-toast toast-${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.drawer.classList.add('open');
    this.backdrop.classList.add('open');
    this.toggleTab.classList.add('active');
    this.renderContent();
  }

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('open');
    this.backdrop.classList.remove('open');
    this.toggleTab.classList.remove('active');
  }

  renderContent() {
    this.contentBody.innerHTML = '';

    if (this.activeTab === 'tiers') {
      this._renderTiersTab();
    } else if (this.activeTab === 'branding') {
      this._renderBrandingTab();
    } else if (this.activeTab === 'roster') {
      this._renderRosterTab();
    }
  }

  // ── Tab 1: Prize Tiers & Quotas (Matching annual-gala-lucky-draw) ──
  _renderTiersTab() {
    const tiers = this.prizeManager.getAllTiers();
    const currentTier = this.prizeManager.getCurrentTier();

    const list = document.createElement('div');
    list.className = 'settings-tiers-list';

    tiers.forEach((tier) => {
      const drawnCount = this.roster.getWinnersForTier(tier.key).length;
      const isFilled = drawnCount >= tier.quota;
      const isSelected = (currentTier.id === tier.id);

      const card = document.createElement('div');
      card.className = `tier-config-card ${isSelected ? 'selected' : ''}`;

      card.innerHTML = `
        <div class="tier-card-left">
          <label class="tier-radio-label" title="Select as current tier">
            <input type="radio" name="activeTier" ${isSelected ? 'checked' : ''} />
            <span class="radio-indicator"></span>
          </label>
        </div>

        <div class="tier-card-center">
          <div class="tier-card-row1">
            <span class="tier-icon-display">${tier.icon}</span>
            <input type="text" class="tier-name-input" value="${tier.name}" placeholder="Tier Name" />
            <div class="tier-quota-box">
              <label class="input-mini-label">Quota:</label>
              <input type="number" min="1" max="999" class="tier-quota-input" value="${tier.quota}" />
              <span class="quota-unit">Pax</span>
            </div>
            <span class="tier-progress-tag ${isFilled ? 'filled' : ''}">
              ${isFilled ? '● Full' : `Drawn ${drawnCount}/${tier.quota}`}
            </span>
          </div>

          <div class="tier-card-row2">
            <span class="field-desc-label">Prize:</span>
            <input type="text" class="tier-prize-input" value="${tier.prizeName || ''}" placeholder="e.g. MacBook Pro 16&quot;" />
          </div>
        </div>

        <div class="tier-card-right">
          <button class="tier-delete-btn" title="Delete Tier" ${tiers.length <= 1 ? 'disabled style="opacity:0.3"' : ''}>✕</button>
        </div>
      `;

      // Select tier
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
        this.prizeManager.setTierById(tier.id);
        this.showToast(`Switched active tier to: ${tier.name}`, 'info');
        this._renderTiersTab();
        this.onSettingsChanged();
      });

      card.querySelector('input[type="radio"]').addEventListener('change', () => {
        this.prizeManager.setTierById(tier.id);
        this.showToast(`Switched active tier to: ${tier.name}`, 'info');
        this._renderTiersTab();
        this.onSettingsChanged();
      });

      // Name change
      const nameInput = card.querySelector('.tier-name-input');
      nameInput.addEventListener('change', () => {
        const val = nameInput.value.trim() || tier.name;
        this.prizeManager.updateTier(tier.id, { name: val });
        this.showToast(`Updated tier name to: ${val}`, 'info');
        this.onSettingsChanged();
      });

      // Quota change
      const quotaInput = card.querySelector('.tier-quota-input');
      quotaInput.addEventListener('change', () => {
        const val = Math.max(1, parseInt(quotaInput.value, 10) || 1);
        quotaInput.value = val;
        this.prizeManager.updateTier(tier.id, { quota: val });
        this.showToast(`Updated [${tier.name}] quota to ${val} Pax`, 'info');
        this.onSettingsChanged();
      });

      // Prize description change
      const prizeInput = card.querySelector('.tier-prize-input');
      prizeInput.addEventListener('change', () => {
        const val = prizeInput.value.trim();
        this.prizeManager.updateTier(tier.id, { prizeName: val });
        this.onSettingsChanged();
      });

      // Delete tier
      const delBtn = card.querySelector('.tier-delete-btn');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tiers.length <= 1) {
          this.showToast('At least one prize tier must be maintained.', 'warning');
          return;
        }
        if (confirm(`Delete prize tier [${tier.name}]?`)) {
          this.prizeManager.removeTier(tier.id);
          this.showToast(`Removed tier: ${tier.name}`, 'info');
          this._renderTiersTab();
          this.onSettingsChanged();
        }
      });

      list.appendChild(card);
    });

    // Add Tier Action
    const addBar = document.createElement('div');
    addBar.className = 'tier-add-bar';
    addBar.innerHTML = `
      <button class="ghost-btn add-tier-btn" id="btn-add-tier">
        <span>➕ Add New Prize Tier</span>
      </button>
      <button class="ghost-btn reset-tiers-btn" id="btn-reset-tiers" title="Reset tiers to system defaults">
        <span>↺ Reset Defaults</span>
      </button>
    `;

    addBar.querySelector('#btn-add-tier').addEventListener('click', () => {
      const newTier = this.prizeManager.addTier();
      this.showToast(`Added new prize tier: ${newTier.name}`, 'success');
      this._renderTiersTab();
      this.onSettingsChanged();
    });

    addBar.querySelector('#btn-reset-tiers').addEventListener('click', () => {
      if (confirm('Reset all prize tiers to default configuration?')) {
        this.prizeManager.resetToDefaults();
        this.showToast('Reset prize tiers to defaults.', 'info');
        this._renderTiersTab();
        this.onSettingsChanged();
      }
    });

    this.contentBody.appendChild(list);
    this.contentBody.appendChild(addBar);
  }

  // ── Tab 2: Gala Branding & Event Info ──────────────────────────
  _renderBrandingTab() {
    const form = document.createElement('div');
    form.className = 'settings-form-container';

    form.innerHTML = `
      <div class="settings-intro-box">
        <span class="intro-spark">✦</span>
        <span>Configure stage branding titles displayed on top navigation bar and official awards modal.</span>
      </div>

      <div class="settings-field-group">
        <label class="field-label">Event Brand Title</label>
        <input type="text" id="cfg-brand-title" class="field-input" value="${this.branding.brandTitle}" placeholder="e.g. CELESTIAL GALA" />
        <span class="field-hint">Main logo text on the top floating navigation pill.</span>
      </div>

      <div class="settings-field-group">
        <label class="field-label">Gala Edition / Year</label>
        <input type="text" id="cfg-brand-year" class="field-input" value="${this.branding.brandYear}" placeholder="e.g. 2026" />
        <span class="field-hint">Edition tag placed beside the brand title.</span>
      </div>

      <div class="settings-action-row">
        <button class="ghost-btn" id="btn-reset-branding">
          <span>↺ Reset to Default Branding</span>
        </button>
      </div>
    `;

    const titleIn = form.querySelector('#cfg-brand-title');
    titleIn.addEventListener('input', () => {
      this.branding.brandTitle = titleIn.value.trim() || 'CELESTIAL GALA';
      this._saveBranding();
    });

    const yearIn = form.querySelector('#cfg-brand-year');
    yearIn.addEventListener('input', () => {
      this.branding.brandYear = yearIn.value.trim() || '2026';
      this._saveBranding();
    });

    form.querySelector('#btn-reset-branding').addEventListener('click', () => {
      this.branding = { brandTitle: 'CELESTIAL GALA', brandYear: '2026' };
      this._saveBranding();
      this.showToast('Reset branding titles to defaults.', 'info');
      this._renderBrandingTab();
    });

    this.contentBody.appendChild(form);
  }

  // ── Tab 3: Candidate Pool & Roster ─────────────────────────────
  _renderRosterTab() {
    const totalCount = this.roster.getPoolSize();
    const availableCount = this.roster.getAvailableCount();
    const winnersCount = this.roster.getWinnerCount();

    const container = document.createElement('div');
    container.className = 'settings-roster-container';

    container.innerHTML = `
      <div class="roster-stats-overview">
        <div class="stat-box">
          <span class="stat-num">${totalCount}</span>
          <span class="stat-label">TOTAL POOL</span>
        </div>
        <div class="stat-box highlight">
          <span class="stat-num">${availableCount}</span>
          <span class="stat-label">ELIGIBLE NOW</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">${winnersCount}</span>
          <span class="stat-label">WINNERS DRAWN</span>
        </div>
      </div>

      <div class="settings-field-group" style="margin-top: 1.5rem;">
        <label class="field-label">Import Roster (JSON / CSV)</label>
        <p class="field-hint" style="margin-bottom: 0.8rem;">Upload an attendee list with ID, Name, Department, and Avatar photo.</p>
        <button class="glass-btn primary-action-btn" id="btn-settings-import">
          <span>📥 Upload Attendee Roster (.json / .csv)</span>
        </button>
      </div>

      <div class="settings-field-group" style="margin-top: 1.8rem;">
        <label class="field-label">Reset Winner Records</label>
        <p class="field-hint" style="margin-bottom: 0.8rem;">Clear all drawn winners and return everyone back to the draw pool.</p>
        <button class="glass-btn glass-btn-muted" id="btn-settings-reset-winners">
          <span>🗑️ Reset Winners &amp; Restore Pool</span>
        </button>
      </div>
    `;

    container.querySelector('#btn-settings-import').addEventListener('click', () => {
      const fileInput = document.getElementById('roster-import');
      if (fileInput) fileInput.click();
    });

    container.querySelector('#btn-settings-reset-winners').addEventListener('click', () => {
      const btnReset = document.getElementById('btn-reset');
      if (btnReset) btnReset.click();
      setTimeout(() => this._renderRosterTab(), 300);
    });

    this.contentBody.appendChild(container);
  }
}
