// ─── Prize Tier Definitions and State Manager ─────────────────
export const PRIZE_TIERS = [
  {
    id: 1,
    key: 'grand',
    name: '特等奖',
    enName: 'Grand Prize',
    icon: '🌟',
    quota: 1,
    defaultBatch: 1,
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.6)'
  },
  {
    id: 2,
    key: 'first',
    name: '一等奖',
    enName: '1st Prize',
    icon: '🥇',
    quota: 3,
    defaultBatch: 1,
    color: '#ffc837',
    glowColor: 'rgba(255, 200, 55, 0.55)'
  },
  {
    id: 3,
    key: 'second',
    name: '二等奖',
    enName: '2nd Prize',
    icon: '🥈',
    quota: 5,
    defaultBatch: 5,
    color: '#e0e7ff',
    glowColor: 'rgba(224, 231, 255, 0.5)'
  },
  {
    id: 4,
    key: 'third',
    name: '三等奖',
    enName: '3rd Prize',
    icon: '🥉',
    quota: 10,
    defaultBatch: 5,
    color: '#ff9a44',
    glowColor: 'rgba(255, 154, 68, 0.55)'
  },
  {
    id: 5,
    key: 'lucky',
    name: '幸运奖',
    enName: 'Lucky Prize',
    icon: '🎁',
    quota: 20,
    defaultBatch: 10,
    color: '#00f2fe',
    glowColor: 'rgba(0, 242, 254, 0.55)'
  }
];

export class PrizeManager {
  constructor() {
    this.tiers = [...PRIZE_TIERS];
    this.currentTierIndex = 0; // Default to Grand Prize
    this.drawCount = 1; // 1, 5, 10
  }

  getCurrentTier() {
    return this.tiers[this.currentTierIndex];
  }

  getAllTiers() {
    return this.tiers;
  }

  setTierById(id) {
    const idx = this.tiers.findIndex(t => t.id === Number(id));
    if (idx !== -1) {
      this.currentTierIndex = idx;
      return this.getCurrentTier();
    }
    return null;
  }

  setTierByIndex(idx) {
    if (idx >= 0 && idx < this.tiers.length) {
      this.currentTierIndex = idx;
      return this.getCurrentTier();
    }
    return null;
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
