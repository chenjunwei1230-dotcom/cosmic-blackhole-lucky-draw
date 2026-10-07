// ─── Prize Tier Definitions and State Manager ─────────────────
export const DEFAULT_PRIZE_TIERS = [
  {
    id: 1,
    key: 'grand',
    name: 'Grand Prize',
    prizeName: 'MacBook Pro 16" M4 Max',
    icon: '🌟',
    quota: 1,
    defaultBatch: 1,
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.6)'
  },
  {
    id: 2,
    key: 'first',
    name: '1st Prize',
    prizeName: 'iPhone 16 Pro Max 512GB',
    icon: '🥇',
    quota: 3,
    defaultBatch: 1,
    color: '#ffc837',
    glowColor: 'rgba(255, 200, 55, 0.55)'
  },
  {
    id: 3,
    key: 'second',
    name: '2nd Prize',
    prizeName: 'iPad Pro 13" + Apple Pencil',
    icon: '🥈',
    quota: 5,
    defaultBatch: 5,
    color: '#e0e7ff',
    glowColor: 'rgba(224, 231, 255, 0.5)'
  },
  {
    id: 4,
    key: 'third',
    name: '3rd Prize',
    prizeName: 'Sony WH-1000XM5 Headphones',
    icon: '🥉',
    quota: 10,
    defaultBatch: 5,
    color: '#ff9a44',
    glowColor: 'rgba(255, 154, 68, 0.55)'
  },
  {
    id: 5,
    key: 'lucky',
    name: 'Lucky Prize',
    prizeName: 'Gala Deluxe Hamper / $100 Voucher',
    icon: '🎁',
    quota: 20,
    defaultBatch: 10,
    color: '#00f2fe',
    glowColor: 'rgba(0, 242, 254, 0.55)'
  }
];

export const PRIZE_TIERS = DEFAULT_PRIZE_TIERS;

export class PrizeManager {
  constructor(onChange = null) {
    this.onChange = onChange;
    this.tiers = this.loadFromStorage();
    this.currentTierIndex = 0;
    this.drawCount = 1;
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('cosmic_prizes_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load prize config from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PRIZE_TIERS));
  }

  saveToStorage() {
    try {
      localStorage.setItem('cosmic_prizes_config', JSON.stringify(this.tiers));
    } catch (e) {
      console.warn('Failed to save prize config:', e);
    }
    if (this.onChange) this.onChange();
  }

  getCurrentTier() {
    if (this.currentTierIndex >= this.tiers.length) {
      this.currentTierIndex = 0;
    }
    return this.tiers[this.currentTierIndex] || this.tiers[0];
  }

  getAllTiers() {
    return this.tiers;
  }

  setTierById(id) {
    const idx = this.tiers.findIndex(t => t.id === Number(id));
    if (idx !== -1) {
      this.currentTierIndex = idx;
      if (this.onChange) this.onChange();
      return this.getCurrentTier();
    }
    return null;
  }

  setTierByIndex(idx) {
    if (idx >= 0 && idx < this.tiers.length) {
      this.currentTierIndex = idx;
      if (this.onChange) this.onChange();
      return this.getCurrentTier();
    }
    return null;
  }

  updateTier(id, updates) {
    const target = this.tiers.find(t => t.id === Number(id));
    if (target) {
      Object.assign(target, updates);
      this.saveToStorage();
      return target;
    }
    return null;
  }

  addTier(tierData = {}) {
    const newId = this.tiers.length > 0 ? Math.max(...this.tiers.map(t => Number(t.id) || 0)) + 1 : 1;
    const icons = ['🌟', '🥇', '🥈', '🥉', '🎁', '💎', '🏆', '🎉'];
    const colors = ['#ffd700', '#ff9a44', '#00f2fe', '#e0e7ff', '#a855f7', '#ec4899'];

    const newTier = {
      id: newId,
      key: `tier_${newId}`,
      name: tierData.name || `Prize Tier ${newId}`,
      prizeName: tierData.prizeName || 'Exciting Gala Gift',
      icon: tierData.icon || icons[(newId - 1) % icons.length],
      quota: tierData.quota || 5,
      defaultBatch: 1,
      color: tierData.color || colors[(newId - 1) % colors.length],
      glowColor: 'rgba(255, 215, 0, 0.5)'
    };

    this.tiers.push(newTier);
    this.saveToStorage();
    return newTier;
  }

  removeTier(id) {
    if (this.tiers.length <= 1) return false;
    const idx = this.tiers.findIndex(t => t.id === Number(id));
    if (idx !== -1) {
      this.tiers.splice(idx, 1);
      if (this.currentTierIndex >= this.tiers.length) {
        this.currentTierIndex = 0;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  resetToDefaults() {
    this.tiers = JSON.parse(JSON.stringify(DEFAULT_PRIZE_TIERS));
    this.currentTierIndex = 0;
    this.saveToStorage();
    return this.tiers;
  }

  setDrawCount(count) {
    const valid = [1, 5, 10];
    const n = Number(count);
    if (valid.includes(n)) {
      this.drawCount = n;
    }
    return this.drawCount;
  }

  getDrawCount() {
    return this.drawCount;
  }
}
