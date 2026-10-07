// ─── Winner History Drawer & CSV Export ────────────────────────
export class HistoryDrawer {
  constructor({ roster, onVoidWinner }) {
    this.roster = roster;
    this.onVoidWinner = onVoidWinner || (() => {});
    this.isOpen = false;
    this.selectedTierFilter = 'ALL';

    this._buildDOM();
  }

  _buildDOM() {
    // ── Floating Toggle Tab on Right Screen Edge ──
    this.toggleTab = document.createElement('button');
    this.toggleTab.className = 'history-floating-tab';
    this.toggleTab.id = 'history-tab-btn';
    this.toggleTab.title = 'Toggle Winner History (H)';
    this.toggleTab.innerHTML = `
      <span class="tab-icon">📜</span>
      <span class="tab-text">LOG / 名录</span>
      <span class="tab-badge" id="history-badge">0</span>
    `;
    this.toggleTab.addEventListener('click', () => this.toggle());
    document.body.appendChild(this.toggleTab);

    // ── Drawer Container ──
    this.drawer = document.createElement('div');
    this.drawer.className = 'history-drawer';
    this.drawer.id = 'history-drawer';

    // Header
    const header = document.createElement('div');
    header.className = 'drawer-header';
    header.innerHTML = `
      <div class="drawer-title-group">
        <div class="drawer-title">CHRONO ARCHIVE / 获奖星谱</div>
        <div class="drawer-subtitle">QUANTUM SINGULARITY REPOSITORY</div>
      </div>
      <button class="drawer-close-btn" id="drawer-close" title="Close (H / ESC)">✕</button>
    `;
    this.drawer.appendChild(header);

    // Filter bar
    this.filterBar = document.createElement('div');
    this.filterBar.className = 'drawer-filters';
    this.drawer.appendChild(this.filterBar);

    // Winner list scrollable area
    this.listContainer = document.createElement('div');
    this.listContainer.className = 'drawer-list';
    this.drawer.appendChild(this.listContainer);

    // Footer with Export CSV
    const footer = document.createElement('div');
    footer.className = 'drawer-footer';
    footer.innerHTML = `
      <div class="drawer-summary" id="drawer-summary">TOTAL: 0 WINNERS</div>
      <button class="export-csv-btn" id="btn-export-csv">
        <span class="btn-icon">📥</span> EXPORT WINNERS (CSV)
      </button>
    `;
    this.drawer.appendChild(footer);

    // Drawer Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'drawer-backdrop';
    this.backdrop.addEventListener('click', () => this.close());
    document.body.appendChild(this.backdrop);

    document.body.appendChild(this.drawer);

    // Bind internal events
    header.querySelector('#drawer-close').addEventListener('click', () => this.close());
    footer.querySelector('#btn-export-csv').addEventListener('click', () => this.exportCSV());
  }

  // ── Toggle / Open / Close ────────────────────────────────────
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.drawer.classList.add('open');
    this.backdrop.classList.add('open');
    this.toggleTab.classList.add('active');
    this.render();
  }

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('open');
    this.backdrop.classList.remove('open');
    this.toggleTab.classList.remove('active');
  }

  updateBadge() {
    const badge = document.getElementById('history-badge');
    if (badge) {
      const count = this.roster.getWinnerCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  // ── Render Winner List & Filters ─────────────────────────────
  render() {
    this.updateBadge();
    const winners = this.roster.getAllWinners();

    // Summary
    const summaryEl = this.drawer.querySelector('#drawer-summary');
    if (summaryEl) summaryEl.textContent = `TOTAL: ${winners.length} WINNERS RECORDED`;

    // Filter Buttons
    this.filterBar.innerHTML = '';
    const tiers = ['ALL', '特等奖', '一等奖', '二等奖', '三等奖', '幸运奖'];
    tiers.forEach(tier => {
      const btn = document.createElement('button');
      btn.className = `filter-chip ${this.selectedTierFilter === tier ? 'active' : ''}`;
      btn.textContent = tier;
      btn.addEventListener('click', () => {
        this.selectedTierFilter = tier;
        this.render();
      });
      this.filterBar.appendChild(btn);
    });

    // Filtered winners (chronologically reversed so newest are on top)
    let filtered = [...winners].reverse();
    if (this.selectedTierFilter !== 'ALL') {
      filtered = filtered.filter(w => (w.prize && w.prize.name === this.selectedTierFilter));
    }

    this.listContainer.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'drawer-empty';
      empty.innerHTML = `
        <div class="empty-icon">🪐</div>
        <div class="empty-text">NO WINNERS RECORDED YET</div>
        <div class="empty-sub">Collapsing singularity will record winners here.</div>
      `;
      this.listContainer.appendChild(empty);
      return;
    }

    filtered.forEach((winner, idx) => {
      const row = document.createElement('div');
      row.className = 'history-row';

      const tier = winner.prize || { name: '标准奖', icon: '🎁', color: '#ffd700' };
      const timeStr = winner.drawnAt ? new Date(winner.drawnAt).toLocaleTimeString('zh-CN', { hour12: false }) : '--:--:--';
      const empId = winner.employeeId || `EMP${String(winner.id).padStart(3, '0')}`;

      row.innerHTML = `
        <div class="row-left">
          <span class="row-tier-tag" style="border-color:${tier.color || '#ffd700'}; color:${tier.color || '#ffd700'}">
            ${tier.icon || '★'} ${tier.name}
          </span>
          <div class="row-info">
            <span class="row-name">${winner.name}</span>
            <span class="row-meta">${empId} · ${winner.department}</span>
          </div>
        </div>
        <div class="row-right">
          <span class="row-time">${timeStr}</span>
          <button class="row-void-btn" title="Void winner & return to pool">作废 / VOID</button>
        </div>
      `;

      // Void action handler
      const voidBtn = row.querySelector('.row-void-btn');
      voidBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`确认作废中奖者 [${winner.name} (${empId})] 并返回抽奖池？`)) {
          this.roster.voidWinner(winner.id || winner.employeeId);
          this.onVoidWinner(winner);
          this.render();
        }
      });

      this.listContainer.appendChild(row);
    });
  }

  // ── CSV Export ───────────────────────────────────────────────
  exportCSV() {
    const winners = this.roster.getAllWinners();
    if (winners.length === 0) {
      alert('当前暂无中奖记录，无法导出！');
      return;
    }

    const headers = ['Prize', 'EmployeeID', 'Name', 'Department', 'DrawTime'];
    const rows = winners.map(w => {
      const prizeName = w.prize ? `${w.prize.name} (${w.prize.enName || ''})` : 'Lucky Draw';
      const empId = w.employeeId || `EMP${String(w.id).padStart(3, '0')}`;
      const name = `"${(w.name || '').replace(/"/g, '""')}"`;
      const dept = `"${(w.department || '').replace(/"/g, '""')}"`;
      const time = w.drawnAt ? new Date(w.drawnAt).toLocaleString('zh-CN') : '';
      return [prizeName, empId, name, dept, time].join(',');
    });

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Chinese characters properly without garbling
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    a.href = url;
    a.download = `Cosmic_Gala_Winners_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
