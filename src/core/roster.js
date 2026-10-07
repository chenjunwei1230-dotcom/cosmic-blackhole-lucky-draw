// ─── Data Pools ───────────────────────────────────────────────
const SURNAMES = [
  '王','李','张','刘','陈','杨','黄','赵','周','吴',
  '徐','孙','马','朱','胡','郭','林','何','高','罗',
  '郑','梁','谢','宋','唐','许','韩','冯','邓','曹',
  '彭','曾','萧','田','董','潘','袁','蔡','蒋','余',
  '于','叶','程','魏','苏','吕','丁','任','沈','姚',
  '卢','姜','崔','钟','谭','陆','汪','范','金','石',
  '廖','贾','夏','韦','付','方','白','邹','孟','熊',
  '秦','邱','江','尹','薛','闫','段','雷','侯','龙'
];

const GIVEN_CHARS = [
  '伟','芳','娜','敏','静','丽','强','磊','洋','勇',
  '艳','杰','娟','涛','明','超','华','慧','婷','宇',
  '浩','鑫','欣','佳','思','雨','晨','旭','辰','博',
  '文','志','天','子','一','嘉','梦','诗','若','琳',
  '瑞','泽','凯','翔','睿','昊','晗','逸','皓','然',
  '萌','悦','颖','璇','瑶','琦','彤','怡','蕾','薇',
  '峰','鹏','飞','毅','刚','军','平','东','海','波',
  '成','建','国','民','永','家','安','宁','昌','德'
];

const DEPARTMENTS = [
  '研发一部','研发二部','产品部','设计部','市场部',
  '销售一部','销售二部','人力资源部','财务部','运营部',
  '客服部','法务部','行政部','质量部','战略部','数据部'
];

import defaultEmployeeData from '../../employee.json' with { type: 'json' };

const STORAGE_KEY = 'cosmic-draw-winners';
const POOL_STORAGE_KEY = 'cosmic-draw-pool';

// ─── Roster Class ─────────────────────────────────────────────
export class Roster {
  constructor() {
    this.pool = this._loadCustomPool() || [];
    this.winners = this._loadWinners();
    // 优先使用新加入的 employee.json 名单（Attack on Titan 100人）
    if (this.pool.length === 0 || !this.pool.some(p => p.employeeId && p.employeeId.startsWith('AOT'))) {
      if (defaultEmployeeData && defaultEmployeeData.length > 0) {
        this.importJSON(defaultEmployeeData);
      } else {
        this._generateMockRoster(600);
      }
    } else {
      // 同步最新头像路径
      if (defaultEmployeeData && defaultEmployeeData.length > 0) {
        const empMap = new Map(defaultEmployeeData.map(e => [e.id, e.avatar]));
        let modified = false;
        this.pool.forEach(p => {
          const freshAvatar = empMap.get(p.id) || empMap.get(p.employeeId);
          if (freshAvatar && p.avatar !== freshAvatar) {
            p.avatar = freshAvatar;
            modified = true;
          }
        });
        if (modified) this._saveCustomPool();
      }
    }
  }

  // ── Persistence ──────────────────────────────────────────────
  _loadWinners() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  _saveWinners() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.winners));
      }
    } catch (e) {
      console.warn('Failed to save winners to localStorage:', e);
    }
  }

  _loadCustomPool() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(POOL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      }
      return null;
    } catch { return null; }
  }

  _saveCustomPool() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(POOL_STORAGE_KEY, JSON.stringify(this.pool));
      }
    } catch (e) {
      console.warn('Failed to save pool to localStorage:', e);
    }
  }

  // ── Mock Generation ──────────────────────────────────────────
  _generateMockRoster(count) {
    const used = new Set();
    this.pool = [];

    for (let i = 1; i <= count; i++) {
      const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
      let given;
      if (Math.random() > 0.3) {
        const c1 = GIVEN_CHARS[Math.floor(Math.random() * GIVEN_CHARS.length)];
        const c2 = GIVEN_CHARS[Math.floor(Math.random() * GIVEN_CHARS.length)];
        given = c1 + c2;
      } else {
        given = GIVEN_CHARS[Math.floor(Math.random() * GIVEN_CHARS.length)];
      }

      let fullName = surname + given;
      if (used.has(fullName)) {
        fullName += (i % 9 + 1);
      }
      used.add(fullName);

      const empId = `EMP${String(i).padStart(3, '0')}`;
      this.pool.push({
        id: i,
        employeeId: empId,
        name: fullName,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        avatar: null
      });
    }
  }

  // ── Pool Queries ─────────────────────────────────────────────
  getAvailablePool() {
    const winnerIds = new Set(this.winners.map(w => w.id || w.employeeId));
    return this.pool.filter(p => !winnerIds.has(p.id) && !winnerIds.has(p.employeeId));
  }

  getPoolSize()       { return this.pool.length; }
  getAvailableCount() { return this.getAvailablePool().length; }
  getWinnerCount()    { return this.winners.length; }
  getAllWinners()     { return [...this.winners]; }

  getWinnersForTier(tierKey) {
    return this.winners.filter(w => w.prize && (w.prize.key === tierKey || w.prize.name === tierKey));
  }

  // ── Draw Methods ─────────────────────────────────────────────
  drawWinner(prizeTier = null) {
    const results = this.drawWinners(1, prizeTier);
    return results.length > 0 ? results[0] : null;
  }

  drawWinners(count = 1, prizeTier = null) {
    const available = this.getAvailablePool();
    if (available.length === 0) return [];

    const drawTotal = Math.min(count, available.length);
    // Fisher-Yates partial shuffle to pick unique winners
    const poolCopy = [...available];
    const picked = [];

    for (let i = 0; i < drawTotal; i++) {
      const randIdx = Math.floor(Math.random() * poolCopy.length);
      const selected = poolCopy.splice(randIdx, 1)[0];
      const winnerRecord = {
        ...selected,
        employeeId: selected.employeeId || `EMP${String(selected.id).padStart(3, '0')}`,
        prize: prizeTier ? {
          id: prizeTier.id,
          key: prizeTier.key,
          name: prizeTier.name,
          enName: prizeTier.enName,
          icon: prizeTier.icon,
          color: prizeTier.color
        } : null,
        drawnAt: new Date().toISOString()
      };
      picked.push(winnerRecord);
      this.winners.push(winnerRecord);
    }

    this._saveWinners();
    return picked;
  }

  // ── Void / Rollback Winner ───────────────────────────────────
  voidWinner(identifier) {
    const index = this.winners.findIndex(w =>
      w.id === identifier || w.employeeId === identifier || (w.id && String(w.id) === String(identifier))
    );
    if (index !== -1) {
      const removed = this.winners.splice(index, 1)[0];
      this._saveWinners();
      return removed;
    }
    return null;
  }

  // ── Reset ────────────────────────────────────────────────────
  resetWinners() {
    this.winners = [];
    this._saveWinners();
  }

  // ── Unified Import (JSON or CSV) ─────────────────────────────
  importData(rawText) {
    const trimmed = rawText.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      return this.importJSON(trimmed);
    } else {
      return this.importCSV(trimmed);
    }
  }

  // ── JSON Import (Direct Array or Object) ──────────────────────
  importJSON(jsonInput) {
    try {
      const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      const list = Array.isArray(data) ? data : (data.roster || data.attendees || data.employees || data.list || []);
      if (!Array.isArray(list) || list.length === 0) return 0;

      const newPool = [];
      list.forEach((item, index) => {
        const idNum = item.id || (index + 1);
        const empId = item.employeeId || item.empId || item.workId || item.id || `EMP${String(index + 1).padStart(3, '0')}`;
        const name = item.name || item.fullName || item.userName || item.姓名 || `员工${index + 1}`;
        const department = item.department || item.dept || item.部门 || '通用部门';
        const avatar = item.avatar || item.photo || item.image || item.headImg || null;

        newPool.push({
          id: idNum,
          employeeId: String(empId),
          name: String(name),
          department: String(department),
          avatar: avatar ? String(avatar) : null
        });
      });

      if (newPool.length > 0) {
        this.pool = newPool;
        this.winners = [];
        this._saveCustomPool();
        this._saveWinners();
      }
      return newPool.length;
    } catch (err) {
      console.error('Failed to parse JSON roster:', err);
      return 0;
    }
  }

  // ── CSV Import ───────────────────────────────────────────────
  importCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length === 0) return 0;

    let start = 0;
    const header = lines[0].toLowerCase();
    const hasHeader = header.includes('name') || header.includes('姓名') ||
                      header.includes('department') || header.includes('部门') ||
                      header.includes('id') || header.includes('工号');
    if (hasHeader) {
      start = 1;
    }

    const newPool = [];
    for (let i = start; i < lines.length; i++) {
      const parts = lines[i].split(/[,\t;|]/).map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 1 && parts[0]) {
        let empId, name, department, avatar;

        if (parts.length >= 3 && /^[A-Za-z0-9_-]+$/.test(parts[0])) {
          // Format: ID, Name, Department, [Avatar]
          empId = parts[0];
          name = parts[1];
          department = parts[2] || '通用部门';
          avatar = parts[3] || null;
        } else {
          // Format: Name, Department, [Avatar], [ID]
          empId = `EMP${String(i - start + 1).padStart(3, '0')}`;
          name = parts[0];
          department = parts[1] || '通用部门';
          avatar = parts[2] || null;
        }

        newPool.push({
          id: i - start + 1,
          employeeId: empId,
          name,
          department,
          avatar
        });
      }
    }

    if (newPool.length > 0) {
      this.pool = newPool;
      this.winners = [];
      this._saveCustomPool();
      this._saveWinners();
    }
    return newPool.length;
  }
}
