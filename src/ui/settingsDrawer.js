// ─── Settings Drawer Component (Referenced from annual-gala-lucky-draw) ─────
export class SettingsDrawer {
  constructor({ prizeManager, roster, onSettingsChanged, onVoidWinner }) {
    this.prizeManager = prizeManager;
    this.roster = roster;
    this.onSettingsChanged = onSettingsChanged || (() => {});
    this.onVoidWinner = onVoidWinner || (() => {});
    this.isOpen = false;
    this.activeTab = 'roster'; // default to 'roster' so candidates are immediately visible!
    this.searchQuery = '';
    this.candidateFilter = 'all'; // 'all' | 'eligible' | 'winners'
    this.showBulkText = false;

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
    // ── Floating Toggle Tab on Right Screen Edge ──
    this.toggleTab = document.createElement('button');
    this.toggleTab.className = 'settings-floating-tab';
    this.toggleTab.id = 'settings-tab-btn';
    this.toggleTab.title = 'Open Settings & Roster (S / R)';
    this.toggleTab.innerHTML = `
      <span class="tab-icon">👥</span>
      <span class="tab-text">ROSTER &amp; CONFIG</span>
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
        <div class="drawer-title" id="drawer-main-title">CANDIDATE ROSTER &amp; SETTINGS</div>
        <div class="drawer-subtitle">100 ATTENDEES · 4 PRIZE TIERS · GALA CONTROL</div>
      </div>
      <button class="drawer-close-btn" id="settings-close" title="Close (S / ESC)">✕</button>
    `;
    this.drawer.appendChild(header);

    // Tab Navigation Bar (4 tabs matching annual-gala-lucky-draw)
    this.tabBar = document.createElement('div');
    this.tabBar.className = 'settings-tabs-bar';
    this.tabBar.innerHTML = `
      <button class="settings-tab-btn active" data-tab="roster">
        <span>👥 Candidate Roster</span>
      </button>
      <button class="settings-tab-btn" data-tab="winners">
        <span>🏆 Winners History</span>
      </button>
      <button class="settings-tab-btn" data-tab="tiers">
        <span>⚙️ Prize Tiers</span>
      </button>
      <button class="settings-tab-btn" data-tab="branding">
        <span>✦ Gala Branding</span>
      </button>
      <button class="settings-tab-btn" data-tab="hotkeys">
        <span>⌨️ Hotkeys</span>
      </button>
    `;
    this.tabBar.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
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
        <span>✓ Return to Stage Display</span>
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

  switchTab(tabName) {
    this.activeTab = tabName;
    if (this.tabBar) {
      this.tabBar.querySelectorAll('.settings-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabName);
      });
    }
    this.renderContent();
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

  toggle(tabName = null) {
    if (this.isOpen) {
      if (tabName && this.activeTab !== tabName) {
        this.switchTab(tabName);
      } else {
        this.close();
      }
    } else {
      this.open(tabName);
    }
  }

  open(tabName = null) {
    if (tabName) {
      this.switchTab(tabName);
    }
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

    if (this.activeTab === 'roster') {
      this._renderRosterTab();
    } else if (this.activeTab === 'winners') {
      this._renderWinnersTab();
    } else if (this.activeTab === 'tiers') {
      this._renderTiersTab();
    } else if (this.activeTab === 'branding') {
      this._renderBrandingTab();
    } else if (this.activeTab === 'hotkeys') {
      this._renderHotkeysTab();
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // TAB 1: 👥 CANDIDATE ROSTER (FULL VISUAL LIST & TOOLS)
  // ══════════════════════════════════════════════════════════════════
  _renderRosterTab() {
    const totalCount = this.roster.getPoolSize();
    const availableCount = this.roster.getAvailableCount();
    const winnersCount = this.roster.getWinnerCount();
    const winnersSet = new Set(this.roster.winners.map(w => String(w.id || w.employeeId)));

    const container = document.createElement('div');
    container.className = 'settings-roster-tab-view';

    // 1. Overview Stats Row
    const statsRow = document.createElement('div');
    statsRow.className = 'roster-stats-overview';
    statsRow.innerHTML = `
      <div class="stat-box">
        <span class="stat-num">${totalCount}</span>
        <span class="stat-label">TOTAL ROSTER</span>
      </div>
      <div class="stat-box highlight">
        <span class="stat-num">${availableCount}</span>
        <span class="stat-label">ELIGIBLE NOW</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">${winnersCount}</span>
        <span class="stat-label">WINNERS DRAWN</span>
      </div>
    `;
    container.appendChild(statsRow);

    // 2. Action Toolbar
    const toolBar = document.createElement('div');
    toolBar.className = 'roster-toolbar';
    toolBar.innerHTML = `
      <button class="tool-btn" id="tool-import" title="Upload Excel, CSV, or JSON attendee list">
        <span>📥 Import File</span>
      </button>
      <button class="tool-btn" id="tool-bulk-text" title="Paste names from Excel / Google Sheets">
        <span>📝 Bulk Text</span>
      </button>
      <button class="tool-btn" id="tool-shuffle" title="Shuffle candidate order randomly">
        <span>🔀 Shuffle</span>
      </button>
      <button class="tool-btn" id="tool-export" title="Export candidate roster as CSV">
        <span>📤 Export CSV</span>
      </button>
      <button class="tool-btn tool-btn-danger" id="tool-reset" title="Reset all winner states & return everyone to pool">
        <span>↺ Reset Winners</span>
      </button>
    `;
    container.appendChild(toolBar);

    // 3. Collapsible Bulk Text Box
    const bulkBox = document.createElement('div');
    bulkBox.className = `bulk-names-panel ${this.showBulkText ? 'open' : ''}`;
    bulkBox.innerHTML = `
      <div class="bulk-header">
        <span class="bulk-title">PASTE BULK NAMES (ONE PER LINE)</span>
        <span class="bulk-hint">From Excel / Spreadsheet</span>
      </div>
      <textarea class="bulk-textarea" id="bulk-names-area" rows="4" placeholder="Eren Yeager&#10;Mikasa Ackerman&#10;Armin Arlert&#10;Levi Ackerman..."></textarea>
      <div class="bulk-actions">
        <button class="ghost-btn" id="btn-apply-bulk"><span>✦ Apply &amp; Replace Pool</span></button>
        <button class="ghost-btn ghost-btn-muted" id="btn-cancel-bulk"><span>Cancel</span></button>
      </div>
    `;
    container.appendChild(bulkBox);

    // 4. Search & Filter Bar
    const filterRow = document.createElement('div');
    filterRow.className = 'roster-filter-row';
    filterRow.innerHTML = `
      <div class="roster-search-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" class="roster-search-input" id="roster-search" placeholder="Search candidate by name, ID, or department..." value="${this.searchQuery}" />
        ${this.searchQuery ? '<button class="search-clear-btn" id="search-clear">✕</button>' : ''}
      </div>
      <div class="roster-filter-chips">
        <button class="filter-chip ${this.candidateFilter === 'all' ? 'active' : ''}" data-filter="all">All (${totalCount})</button>
        <button class="filter-chip ${this.candidateFilter === 'eligible' ? 'active' : ''}" data-filter="eligible">Eligible (${availableCount})</button>
        <button class="filter-chip ${this.candidateFilter === 'winners' ? 'active' : ''}" data-filter="winners">Winners (${winnersCount})</button>
      </div>
    `;
    container.appendChild(filterRow);

    // 5. Scrollable Candidate Card List
    const listWrapper = document.createElement('div');
    listWrapper.className = 'candidate-cards-scroll';

    // Filter candidates
    const q = this.searchQuery.toLowerCase().trim();
    const filtered = this.roster.pool.filter(cand => {
      const idStr = String(cand.employeeId || cand.id || '');
      const nameStr = String(cand.name || '');
      const deptStr = String(cand.department || '');
      const isWinner = winnersSet.has(String(cand.id)) || winnersSet.has(String(cand.employeeId));

      // Filter chip
      if (this.candidateFilter === 'eligible' && isWinner) return false;
      if (this.candidateFilter === 'winners' && !isWinner) return false;

      // Search query
      if (q) {
        return nameStr.toLowerCase().includes(q) ||
               idStr.toLowerCase().includes(q) ||
               deptStr.toLowerCase().includes(q);
      }
      return true;
    });

    if (filtered.length === 0) {
      listWrapper.innerHTML = `
        <div class="roster-empty-state">
          <span class="empty-icon">🔍</span>
          <p>No candidates match your search "${this.searchQuery}".</p>
        </div>
      `;
    } else {
      filtered.forEach((cand, index) => {
        const isWinner = winnersSet.has(String(cand.id)) || winnersSet.has(String(cand.employeeId));
        const winnerRecord = isWinner ? this.roster.winners.find(w => String(w.id || w.employeeId) === String(cand.id || cand.employeeId)) : null;
        const prizeName = winnerRecord && winnerRecord.prize ? winnerRecord.prize.name : 'Winner';

        const card = document.createElement('div');
        card.className = `candidate-card-item ${isWinner ? 'is-winner' : ''}`;

        const initials = (cand.name || 'EMP').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

        card.innerHTML = `
          <div class="cand-seq-badge">#${index + 1}</div>
          <div class="cand-photo-thumb">
            ${cand.avatar ? `<img src="${cand.avatar}" alt="${cand.name}" class="cand-thumb-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />` : ''}
            <div class="cand-thumb-fallback" style="${cand.avatar ? 'display:none;' : ''}">${initials}</div>
          </div>

          <div class="cand-details-col">
            <div class="cand-title-line">
              <span class="cand-name-text">${cand.name}</span>
              <span class="cand-id-tag">${cand.employeeId || cand.id}</span>
            </div>
            <div class="cand-meta-line">
              <span class="cand-dept-tag">${cand.department || 'General'}</span>
              ${isWinner 
                ? `<span class="cand-status-badge badge-won">🏆 ${prizeName}</span>` 
                : `<span class="cand-status-badge badge-eligible">✦ Eligible</span>`}
            </div>
          </div>

          <div class="cand-actions-col">
            ${isWinner ? `
              <button class="cand-undo-win-btn" title="Revoke win & return to pool">↺ Undo</button>
            ` : `
              <button class="cand-remove-btn" title="Remove from pool">✕</button>
            `}
          </div>
        `;

        // Undo winner
        if (isWinner) {
          const undoBtn = card.querySelector('.cand-undo-win-btn');
          if (undoBtn) {
            undoBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.roster.voidWinner(cand.id || cand.employeeId);
              this.showToast(`Returned ${cand.name} back to eligible pool!`, 'info');
              this._renderRosterTab();
              this.onSettingsChanged();
            });
          }
        } else {
          const removeBtn = card.querySelector('.cand-remove-btn');
          if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const pIdx = this.roster.pool.findIndex(p => String(p.id) === String(cand.id) || String(p.employeeId) === String(cand.employeeId));
              if (pIdx !== -1) {
                this.roster.pool.splice(pIdx, 1);
                this.roster._saveCustomPool();
                this.showToast(`Removed ${cand.name} from roster.`, 'info');
                this._renderRosterTab();
                this.onSettingsChanged();
              }
            });
          }
        }

        listWrapper.appendChild(card);
      });
    }

    container.appendChild(listWrapper);

    // ── Bind Event Listeners ──
    // Search
    const searchIn = filterRow.querySelector('#roster-search');
    searchIn.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this._renderRosterTab();
      // Keep input focused
      setTimeout(() => {
        const inp = this.contentBody.querySelector('#roster-search');
        if (inp) {
          inp.focus();
          inp.setSelectionRange(inp.value.length, inp.value.length);
        }
      }, 10);
    });

    const searchClear = filterRow.querySelector('#search-clear');
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        this.searchQuery = '';
        this._renderRosterTab();
      });
    }

    // Filter Chips
    filterRow.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.candidateFilter = chip.dataset.filter;
        this._renderRosterTab();
      });
    });

    // Toolbar: Import
    toolBar.querySelector('#tool-import').addEventListener('click', () => {
      const fileInput = document.getElementById('roster-import');
      if (fileInput) fileInput.click();
    });

    // Toolbar: Bulk Text Toggle
    toolBar.querySelector('#tool-bulk-text').addEventListener('click', () => {
      this.showBulkText = !this.showBulkText;
      this._renderRosterTab();
    });

    // Bulk Box: Cancel
    bulkBox.querySelector('#btn-cancel-bulk').addEventListener('click', () => {
      this.showBulkText = false;
      this._renderRosterTab();
    });

    // Bulk Box: Apply
    bulkBox.querySelector('#btn-apply-bulk').addEventListener('click', () => {
      const txt = bulkBox.querySelector('#bulk-names-area').value.trim();
      if (!txt) {
        this.showToast('Please enter candidate names.', 'warn');
        return;
      }
      const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const newPool = lines.map((line, idx) => {
        const parts = line.split(/[\t,]/);
        const name = parts[0].trim();
        const dept = parts[1] ? parts[1].trim() : 'General';
        const empId = `EMP${String(idx + 1).padStart(3, '0')}`;
        return {
          id: idx + 1,
          employeeId: empId,
          name: name,
          department: dept,
          avatar: null
        };
      });

      this.roster.pool = newPool;
      this.roster.winners = [];
      this.roster._saveCustomPool();
      this.roster._saveWinners();

      this.showBulkText = false;
      this.showToast(`Loaded ${newPool.length} candidates from bulk text!`, 'success');
      this._renderRosterTab();
      this.onSettingsChanged();
    });

    // Toolbar: Shuffle
    toolBar.querySelector('#tool-shuffle').addEventListener('click', () => {
      // Fisher-Yates shuffle
      for (let i = this.roster.pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.roster.pool[i], this.roster.pool[j]] = [this.roster.pool[j], this.roster.pool[i]];
      }
      this.roster._saveCustomPool();
      this.showToast('Shuffled candidate roster order randomly!', 'info');
      this._renderRosterTab();
      this.onSettingsChanged();
    });

    // Toolbar: Export CSV
    toolBar.querySelector('#tool-export').addEventListener('click', () => {
      this._exportRosterCSV();
    });

    // Toolbar: Reset Winners
    toolBar.querySelector('#tool-reset').addEventListener('click', () => {
      if (confirm('Reset all winner records and restore all candidates to the pool?')) {
        this.roster.resetWinners();
        this.showToast('Reset all winners. Entire roster is eligible!', 'success');
        this._renderRosterTab();
        this.onSettingsChanged();
      }
    });

    this.contentBody.appendChild(container);
  }

  // ══════════════════════════════════════════════════════════════════
  // TAB 2: 🏆 WINNERS HISTORY (OFFICIAL RECORD & ACTIONS)
  // ══════════════════════════════════════════════════════════════════
  _renderWinnersTab() {
    const winners = this.roster.getAllWinners();

    const container = document.createElement('div');
    container.className = 'settings-winners-tab-view';

    // Toolbar
    const toolBar = document.createElement('div');
    toolBar.className = 'roster-toolbar';
    toolBar.innerHTML = `
      <div class="winners-count-tag">
        <span>🏆 Total Drawn: <strong>${winners.length}</strong></span>
      </div>
      <div style="display:flex; gap:0.4rem;">
        <button class="tool-btn" id="btn-export-winners" ${winners.length === 0 ? 'disabled style="opacity:0.4"' : ''}>
          <span>📥 Export CSV</span>
        </button>
        <button class="tool-btn tool-btn-danger" id="btn-clear-winners" ${winners.length === 0 ? 'disabled style="opacity:0.4"' : ''}>
          <span>🗑️ Clear History</span>
        </button>
      </div>
    `;
    container.appendChild(toolBar);

    if (winners.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'roster-empty-state';
      emptyBox.innerHTML = `
        <span class="empty-icon">🌟</span>
        <h3 style="color:var(--accent-gold);margin-bottom:0.5rem;">No Winners Drawn Yet</h3>
        <p>Press [SPACE] or click the stage on the main screen to launch a draw!</p>
      `;
      container.appendChild(emptyBox);
    } else {
      const scrollArea = document.createElement('div');
      scrollArea.className = 'candidate-cards-scroll';

      // Reverse chronological order
      [...winners].reverse().forEach((w, rIdx) => {
        const orderNum = winners.length - rIdx;
        const timeStr = w.drawnAt ? new Date(w.drawnAt).toLocaleTimeString() : 'Recent';
        const initials = (w.name || 'WIN').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

        const item = document.createElement('div');
        item.className = 'winner-history-item';
        item.innerHTML = `
          <div class="winner-rank-num">#${orderNum}</div>
          <div class="cand-photo-thumb">
            ${w.avatar ? `<img src="${w.avatar}" alt="${w.name}" class="cand-thumb-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />` : ''}
            <div class="cand-thumb-fallback" style="${w.avatar ? 'display:none;' : ''}">${initials}</div>
          </div>
          <div class="cand-details-col">
            <div class="cand-title-line">
              <span class="cand-name-text">${w.name}</span>
              <span class="cand-status-badge badge-won">${w.prize?.name || 'Winner'}</span>
            </div>
            <div class="cand-meta-line">
              <span class="cand-dept-tag">${w.department}</span>
              <span class="cand-id-tag">${w.employeeId || w.id}</span>
              <span class="cand-time-tag">⏱ ${timeStr}</span>
            </div>
          </div>
          <div class="cand-actions-col">
            <button class="cand-undo-win-btn" title="Revoke and return candidate to pool">↺ Undo</button>
          </div>
        `;

        item.querySelector('.cand-undo-win-btn').addEventListener('click', () => {
          this.roster.voidWinner(w.id || w.employeeId);
          this.showToast(`Returned ${w.name} to candidate pool!`, 'info');
          this._renderWinnersTab();
          this.onSettingsChanged();
        });

        scrollArea.appendChild(item);
      });

      container.appendChild(scrollArea);
    }

    // Export CSV
    toolBar.querySelector('#btn-export-winners').addEventListener('click', () => {
      this._exportWinnersCSV();
    });

    // Clear History
    toolBar.querySelector('#btn-clear-winners').addEventListener('click', () => {
      if (confirm('Clear all winners history and return everyone to eligible pool?')) {
        this.roster.resetWinners();
        this.showToast('Cleared all winner history.', 'info');
        this._renderWinnersTab();
        this.onSettingsChanged();
      }
    });

    this.contentBody.appendChild(container);
  }

  // ══════════════════════════════════════════════════════════════════
  // TAB 3: ⚙️ PRIZE TIERS & QUOTAS
  // ══════════════════════════════════════════════════════════════════
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
        const val = parseInt(quotaInput.value, 10) || tier.quota;
        this.prizeManager.updateTier(tier.id, { quota: Math.max(1, val) });
        this.showToast(`Updated ${tier.name} quota to: ${val} Pax`, 'info');
        this._renderTiersTab();
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
        if (tiers.length <= 1) return;
        if (confirm(`Delete prize tier "${tier.name}"?`)) {
          this.prizeManager.removeTier(tier.id);
          this.showToast(`Deleted tier: ${tier.name}`, 'info');
          this._renderTiersTab();
          this.onSettingsChanged();
        }
      });

      list.appendChild(card);
    });

    const addBar = document.createElement('div');
    addBar.className = 'settings-action-row';
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

  // ══════════════════════════════════════════════════════════════════
  // TAB 4: ✦ GALA BRANDING
  // ══════════════════════════════════════════════════════════════════
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

  // ══════════════════════════════════════════════════════════════════
  // TAB 5: ⌨️ STAGE DIRECTOR HOTKEYS CHEATSHEET
  // ══════════════════════════════════════════════════════════════════
  _renderHotkeysTab() {
    const container = document.createElement('div');
    container.className = 'settings-hotkeys-tab-view';

    const hotkeys = [
      { key: 'SPACE / ENTER', action: 'Launch & Detonate Draw', desc: 'Trigger gravitational vortex, swallow attendees & ignite supernova reveal' },
      { key: '1  2  3  4  5', action: 'Quick Prize Tier Switch', desc: 'Instantly select Grand Prize [1], 1st Prize [2], 2nd Prize [3], etc.' },
      { key: 'B', action: 'Toggle Batch Count', desc: 'Cycle batch draw count between x1 (Single Hero), x5, and x10 attendees' },
      { key: 'R', action: 'Candidate Roster', desc: 'Open 100-attendee candidate roster with photos, search, and CSV import' },
      { key: 'W', action: 'Winners History', desc: 'View official winners records, undo/return winners to pool, and export CSV' },
      { key: 'S', action: 'Prize & Gala Settings', desc: 'Configure prize quotas, descriptions, event title and year' },
      { key: 'M', action: 'Toggle Audio FX', desc: 'Instantly mute or unmute audio synthesis for stage AV technician' },
      { key: 'C', action: 'Clean Stage Mode', desc: 'Hide all HUD control pills for pure 100% immersive cinematic backdrop' },
      { key: 'F', action: 'Fullscreen Mode', desc: 'Toggle stage fullscreen for 4K projector or LED video wall display' },
      { key: 'ESC', action: 'Dismiss / Close', desc: 'Close winner modal, dismiss settings drawer, or close active dropdown' }
    ];

    container.innerHTML = `
      <div class="settings-intro-box">
        <span class="intro-spark">⌨️</span>
        <span>Stage Director Hotkeys — Full keyboard control matrix for live event broadcasting and stage AV directors.</span>
      </div>

      <div class="hotkeys-grid">
        ${hotkeys.map(h => `
          <div class="hotkey-card">
            <div class="hotkey-key-badge">${h.key}</div>
            <div class="hotkey-details">
              <div class="hotkey-action">${h.action}</div>
              <div class="hotkey-desc">${h.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.contentBody.appendChild(container);
  }

  // ── CSV Export Helpers ──
  _exportRosterCSV() {
    const rows = [['ID', 'Name', 'Department', 'Status']];
    const winnersSet = new Set(this.roster.winners.map(w => String(w.id || w.employeeId)));

    this.roster.pool.forEach(c => {
      const isW = winnersSet.has(String(c.id)) || winnersSet.has(String(c.employeeId));
      rows.push([
        c.employeeId || c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${(c.department || '').replace(/"/g, '""')}"`,
        isW ? 'Winner' : 'Eligible'
      ]);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic_gala_roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported candidate roster CSV!', 'success');
  }

  _exportWinnersCSV() {
    const winners = this.roster.getAllWinners();
    if (winners.length === 0) return;

    const rows = [['Rank', 'ID', 'Name', 'Department', 'Prize Tier', 'Drawn At']];
    winners.forEach((w, idx) => {
      rows.push([
        idx + 1,
        w.employeeId || w.id,
        `"${w.name.replace(/"/g, '""')}"`,
        `"${(w.department || '').replace(/"/g, '""')}"`,
        `"${(w.prize?.name || 'Winner').replace(/"/g, '""')}"`,
        `"${w.drawnAt || ''}"`
      ]);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic_gala_winners_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported winners history CSV!', 'success');
  }
}
