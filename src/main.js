import { StageFSM, States } from './core/fsm.js';
import { Roster } from './core/roster.js';
import { PrizeManager, PRIZE_TIERS } from './core/prizes.js';
import { CosmicScene } from './graphics/cosmicScene.js';
import { WinnerModal } from './ui/winnerModal.js';
import { HistoryDrawer } from './ui/historyDrawer.js';
import { SoundEngine } from './audio/soundEngine.js';

window.addEventListener('DOMContentLoaded', () => {
  // ── DOM References ──
  const container         = document.getElementById('webgl-container');
  const hudStatus         = document.getElementById('hud-status');
  const hudTip            = document.getElementById('hud-tip');
  const hudAvailable      = document.getElementById('hud-available');
  const hudTotal          = document.getElementById('hud-total');
  const hudWinnerCount    = document.getElementById('hud-winner-count');
  const hudTierDrawnCount = document.getElementById('hud-tier-drawn-count');

  // Prize & Batch HUD
  const tierDropdownBtn   = document.getElementById('tier-dropdown-btn');
  const tierMenu          = document.getElementById('tier-menu');
  const currentTierIcon   = document.getElementById('current-tier-icon');
  const currentTierName   = document.getElementById('current-tier-name');
  const currentTierQuota  = document.getElementById('current-tier-quota');
  const batchButtons      = document.querySelectorAll('.batch-btn');

  // Admin & QoL
  const btnClean          = document.getElementById('btn-clean');
  const btnFullscreen     = document.getElementById('btn-fullscreen');
  const btnImport         = document.getElementById('btn-import');
  const btnReset          = document.getElementById('btn-reset');
  const fileInput         = document.getElementById('roster-import');

  // ── Core Subsystems ──
  const scene        = new CosmicScene(container);
  const roster       = new Roster();
  const prizeManager = new PrizeManager();
  const modal        = new WinnerModal();
  const audio        = new SoundEngine();

  let selectedWinners = [];
  let isCleanStage    = false;

  // ── History Drawer ──
  const historyDrawer = new HistoryDrawer({
    roster,
    onVoidWinner: (voidedWinner) => {
      refreshPoolHUD();
      hudTip.textContent = `VOIDED: ${voidedWinner.name} RETURNED TO POOL`;
      setTimeout(() => {
        if (fsm.getState() === States.IDLE) {
          hudTip.textContent = 'PRESS [SPACE / ENTER] TO COLLAPSE';
        }
      }, 2500);
    }
  });

  // ── HUD Helpers ──
  function refreshPoolHUD() {
    hudAvailable.textContent   = roster.getAvailableCount().toLocaleString();
    hudTotal.textContent       = roster.getPoolSize().toLocaleString();
    hudWinnerCount.textContent = roster.getWinnerCount().toString();

    const curTier = prizeManager.getCurrentTier();
    const tierWinners = roster.getWinnersForTier(curTier.key);
    hudTierDrawnCount.textContent = `THIS TIER: ${tierWinners.length} / ${curTier.quota}`;

    historyDrawer.updateBadge();
  }

  function updateTierDisplay() {
    const tier = prizeManager.getCurrentTier();
    currentTierIcon.textContent = tier.icon;
    currentTierName.textContent = tier.name;
    currentTierQuota.textContent = `${tier.quota}人`;
    refreshPoolHUD();

    // Sync menu active state
    const items = tierMenu.querySelectorAll('.tier-menu-item');
    items.forEach(it => {
      const id = Number(it.dataset.id);
      it.classList.toggle('active', id === tier.id);
    });
  }

  function buildTierMenu() {
    tierMenu.innerHTML = '';
    prizeManager.getAllTiers().forEach(tier => {
      const item = document.createElement('div');
      item.className = `tier-menu-item ${tier.id === prizeManager.getCurrentTier().id ? 'active' : ''}`;
      item.dataset.id = tier.id;
      item.innerHTML = `
        <span class="item-shortcut">[${tier.id}]</span>
        <span class="item-icon">${tier.icon}</span>
        <span class="item-name">${tier.name} · ${tier.enName}</span>
        <span class="item-quota">${tier.quota}人</span>
      `;
      item.addEventListener('click', () => {
        if (fsm.getState() !== States.IDLE) return;
        prizeManager.setTierById(tier.id);
        updateTierDisplay();
        tierMenu.classList.remove('open');
      });
      tierMenu.appendChild(item);
    });
  }

  buildTierMenu();
  updateTierDisplay();

  // ── Start Render Loop ──
  scene.render();

  // ── FSM Orchestration ──
  const fsm = new StageFSM({
    onStateChange: (state) => {
      scene.updateState(state);
      hudStatus.textContent = state;

      // Close open dropdowns
      tierMenu.classList.remove('open');

      switch (state) {
        case States.IDLE:
          hudStatus.className = 'status-active';
          hudTip.textContent = 'PRESS [SPACE / ENTER] TO INITIATE DRAW';
          hudTip.style.opacity = '1';
          scene.setWinnerFocus(null);
          modal.hide();
          refreshPoolHUD();
          break;

        case States.COLLAPSING:
          hudStatus.className = 'status-active';
          hudTip.textContent = 'GRAVITATIONAL VORTEX · CANDIDATES SWALLOWED INTO BLACK HOLE...';
          audio.startCollapse();
          setTimeout(() => {
            if (fsm.getState() === States.COLLAPSING) {
              hudTip.textContent = 'CRITICAL MASS REACHED [PRESS SPACE / ENTER TO DETONATE]';
            }
          }, 2200);
          break;

        case States.STOPPING: {
          const drawCount = prizeManager.getDrawCount();
          const currentTier = prizeManager.getCurrentTier();
          selectedWinners = roster.drawWinners(drawCount, currentTier);

          if (!selectedWinners || selectedWinners.length === 0) {
            hudTip.textContent = '⚠ POOL EXHAUSTED — IMPORT NEW ROSTER OR RESET';
            audio.fadeOutCollapse();
            setTimeout(() => fsm.transitionTo(States.IDLE), 200);
            return;
          }

          // Lock in the winner IMMEDIATELY so 3D emergence matches modal 100%
          const winnerId = selectedWinners[0].id || selectedWinners[0].employeeId;
          scene.setWinnerFocus(winnerId);

          hudTip.textContent = `SINGULARITY AT PEAK TENSION · DETONATION IMMINENT...`;
          audio.fadeOutCollapse();
          break;
        }

        case States.SUPERNOVA:
          hudTip.textContent = '✦ RELATIVISTIC SUPERNOVA EXPLOSION ✦';
          scene.triggerSupernova();
          modal.triggerFlash();
          audio.playSupernova();
          break;

        case States.REVEAL: {
          hudTip.textContent = 'WINNER REVEALED [SPACE / ESC TO DISMISS]';
          if (selectedWinners && selectedWinners.length > 0) {
            modal.show(selectedWinners, prizeManager.getCurrentTier());
            audio.playReveal();
          }
          refreshPoolHUD();
          break;
        }
      }
    }
  });

  // ── Batch Count Toggle ──
  batchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (fsm.getState() !== States.IDLE) return;
      const count = Number(btn.dataset.count);
      prizeManager.setDrawCount(count);
      batchButtons.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  // ── Tier Dropdown Toggle ──
  tierDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (fsm.getState() !== States.IDLE) return;
    tierMenu.classList.toggle('open');
  });

  window.addEventListener('click', () => {
    tierMenu.classList.remove('open');
  });

  // ── Fullscreen Toggle ──
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  btnFullscreen.addEventListener('click', toggleFullscreen);

  // ── Clean Stage Toggle ──
  function toggleCleanStage() {
    isCleanStage = !isCleanStage;
    document.body.classList.toggle('clean-stage-mode', isCleanStage);
    btnClean.classList.toggle('active', isCleanStage);
    btnClean.textContent = isCleanStage ? '[C] NORMAL VIEW' : '[C] CLEAN VIEW';
  }

  btnClean.addEventListener('click', toggleCleanStage);

  // ── Keyboard Controls ──
  window.addEventListener('keydown', (e) => {
    // If typing in input, ignore
    if (e.target.tagName === 'INPUT') return;

    // 1. Stage State Transitions
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'PageDown') {
      e.preventDefault();
      // If history drawer is open, close it on Space/Enter
      if (historyDrawer.isOpen) {
        historyDrawer.close();
        return;
      }
      fsm.handleInput('TOGGLE');
      return;
    }

    if (e.code === 'Escape') {
      e.preventDefault();
      if (tierMenu.classList.contains('open')) {
        tierMenu.classList.remove('open');
        return;
      }
      if (historyDrawer.isOpen) {
        historyDrawer.close();
        return;
      }
      fsm.handleInput('DISMISS');
      return;
    }

    // 2. Prize Tier Shortcuts [1-5] (ONLY active in IDLE)
    if (fsm.getState() === States.IDLE) {
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        const tierId = parseInt(e.code.replace('Digit', ''), 10);
        prizeManager.setTierById(tierId);
        updateTierDisplay();
        return;
      }

      // Batch toggle with 'B'
      if (e.code === 'KeyB') {
        const currentCount = prizeManager.getDrawCount();
        const next = currentCount === 1 ? 5 : currentCount === 5 ? 10 : 1;
        prizeManager.setDrawCount(next);
        batchButtons.forEach(b => b.classList.toggle('active', Number(b.dataset.count) === next));
        return;
      }
    }

    // 3. History Drawer Shortcut [H]
    if (e.code === 'KeyH') {
      e.preventDefault();
      historyDrawer.toggle();
      return;
    }

    // 4. Stage Clean View Shortcut [C]
    if (e.code === 'KeyC') {
      e.preventDefault();
      toggleCleanStage();
      return;
    }

    // 5. Fullscreen Shortcut [F]
    if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
  });

  // ── JSON / CSV Import ──
  btnImport.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      const count = roster.importData(content);
      if (count > 0) {
        hudTip.textContent = `SUCCESSFULLY IMPORTED ${count} ATTENDEES`;
        refreshPoolHUD();
      } else {
        hudTip.textContent = 'IMPORT FAILED — PLEASE CHECK FILE FORMAT (JSON / CSV)';
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });

  // ── Reset Winners ──
  btnReset.addEventListener('click', () => {
    if (fsm.getState() !== States.IDLE) return;
    if (confirm('确认清空所有已产生的中奖记录？')) {
      roster.resetWinners();
      refreshPoolHUD();
      historyDrawer.render();
      hudTip.textContent = 'ALL WINNERS CLEARED — POOL RESTORED';
      setTimeout(() => {
        if (fsm.getState() === States.IDLE) {
          hudTip.textContent = 'PRESS [SPACE / ENTER] TO COLLAPSE';
        }
      }, 2000);
    }
  });
});
