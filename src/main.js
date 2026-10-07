import { StageFSM, States } from './core/fsm.js';
import { Roster } from './core/roster.js';
import { PrizeManager, PRIZE_TIERS } from './core/prizes.js';
import { CosmicScene } from './graphics/cosmicScene.js';
import { WinnerModal } from './ui/winnerModal.js';
import { HistoryDrawer } from './ui/historyDrawer.js';
import { SettingsDrawer } from './ui/settingsDrawer.js';
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
  const btnRoster         = document.getElementById('btn-roster');
  const btnWinners        = document.getElementById('btn-winners');
  const topRosterCount    = document.getElementById('top-roster-count');
  const topWinnersCount   = document.getElementById('top-winners-count');
  const btnSettings       = document.getElementById('btn-settings');
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
          hudTip.textContent = 'CLICK OR PRESS [SPACE] TO INITIATE DRAW';
        }
      }, 2500);
    }
  });

  // ── Settings Drawer (Referenced from annual-gala-lucky-draw) ──
  const settingsDrawer = new SettingsDrawer({
    prizeManager,
    roster,
    onSettingsChanged: () => {
      updateTierDisplay();
      buildTierMenu();
      refreshPoolHUD();
    },
    onVoidWinner: (voided) => {
      refreshPoolHUD();
    }
  });

  if (btnRoster) {
    btnRoster.addEventListener('click', () => {
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.toggle('roster');
    });
  }

  if (btnWinners) {
    btnWinners.addEventListener('click', () => {
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.toggle('winners');
    });
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.toggle('tiers');
    });
  }

  // ── HUD Helpers ──
  function refreshPoolHUD() {
    const avail = roster.getAvailableCount();
    const total = roster.getPoolSize();
    const winnersCount = roster.getWinnerCount();

    hudAvailable.textContent   = avail.toLocaleString();
    hudTotal.textContent       = total.toLocaleString();
    hudWinnerCount.textContent = winnersCount.toString();

    if (topRosterCount) topRosterCount.textContent = total.toString();
    if (topWinnersCount) topWinnersCount.textContent = winnersCount.toString();

    const curTier = prizeManager.getCurrentTier();
    const tierWinners = roster.getWinnersForTier(curTier.key);
    hudTierDrawnCount.textContent = `THIS TIER: ${tierWinners.length} / ${curTier.quota}`;

    historyDrawer.updateBadge();
  }

  // Click pool meta to open candidate roster
  const poolMeta = document.querySelector('.pool-glass-card');
  if (poolMeta) {
    poolMeta.style.cursor = 'pointer';
    poolMeta.title = 'Click to view Candidate Roster (R)';
    poolMeta.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.open('roster');
    });
  }

  // Click awards pill to open winners history
  const awardsPill = document.querySelector('.stats-glass-pill');
  if (awardsPill) {
    awardsPill.style.cursor = 'pointer';
    awardsPill.title = 'Click to view Winners History (W)';
    awardsPill.addEventListener('click', () => {
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.open('winners');
    });
  }

  function updateTierDisplay() {
    const tier = prizeManager.getCurrentTier();
    currentTierIcon.textContent = tier.icon;
    currentTierName.textContent = tier.name;
    currentTierQuota.textContent = `${tier.quota} Pax`;
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
        <span class="item-name">${tier.name}</span>
        <span class="item-quota">${tier.quota} Pax</span>
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
          hudTip.textContent = 'CLICK OR PRESS [SPACE] TO INITIATE DRAW';
          hudTip.style.opacity = '1';
          scene.setWinnerFocus(null);
          modal.hide();
          refreshPoolHUD();
          break;

        case States.COLLAPSING:
          hudStatus.className = 'status-active';
          hudTip.textContent = 'GRAVITATIONAL VORTEX · SWALLOWING CANDIDATES...';
          audio.startCollapse();
          setTimeout(() => {
            if (fsm.getState() === States.COLLAPSING) {
              hudTip.textContent = 'CRITICAL MASS REACHED [CLICK OR PRESS SPACE TO DETONATE]';
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
          hudTip.textContent = 'WINNER REVEALED [CLICK OR PRESS SPACE TO CONTINUE]';
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

  // ── Dismiss Modal on Click ──
  modal.setOnDismiss(() => {
    if (fsm.getState() === States.REVEAL) {
      fsm.handleInput('DISMISS');
    }
  });

  // ── Mouse Click Trigger Controls ──
  function handleStageClick(e) {
    // If clicking inside interactive controls, dropdowns, inputs, drawer, ignore
    if (e.target.closest('button, input, select, .history-drawer, .history-floating-tab, .settings-drawer, .settings-floating-tab, .tier-dropdown-menu, .pool-glass-card')) {
      return;
    }

    if (tierMenu.classList.contains('open')) {
      tierMenu.classList.remove('open');
      return;
    }

    if (settingsDrawer.isOpen) {
      settingsDrawer.close();
      return;
    }

    if (historyDrawer.isOpen) {
      historyDrawer.close();
      return;
    }

    if (fsm.getState() === States.REVEAL) {
      fsm.handleInput('DISMISS');
    } else if (fsm.getState() === States.IDLE || fsm.getState() === States.COLLAPSING) {
      fsm.handleInput('TOGGLE');
    }
  }

  document.getElementById('webgl-container').addEventListener('click', handleStageClick);
  document.getElementById('stage-hud').addEventListener('click', handleStageClick);

  hudTip.addEventListener('click', (e) => {
    e.stopPropagation();
    if (historyDrawer.isOpen) {
      historyDrawer.close();
      return;
    }
    if (fsm.getState() === States.REVEAL) {
      fsm.handleInput('DISMISS');
    } else if (fsm.getState() === States.IDLE || fsm.getState() === States.COLLAPSING) {
      fsm.handleInput('TOGGLE');
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
      if (settingsDrawer.isOpen) {
        settingsDrawer.close();
        return;
      }
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
      if (settingsDrawer.isOpen) {
        settingsDrawer.close();
        return;
      }
      if (historyDrawer.isOpen) {
        historyDrawer.close();
        return;
      }
      fsm.handleInput('DISMISS');
      return;
    }

    // 2. Roster Shortcut [R]
    if (e.code === 'KeyR') {
      e.preventDefault();
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.toggle('roster');
      return;
    }

    // 3. Winners History Shortcut [W]
    if (e.code === 'KeyW') {
      e.preventDefault();
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.toggle('winners');
      return;
    }

    // 4. Settings Drawer Shortcut [S]
    if (e.code === 'KeyS') {
      e.preventDefault();
      if (historyDrawer.isOpen) historyDrawer.close();
      settingsDrawer.toggle('tiers');
      return;
    }

    // 3. Prize Tier Shortcuts [1-5] (ONLY active in IDLE)
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

    // 4. History Drawer Shortcut [H]
    if (e.code === 'KeyH') {
      e.preventDefault();
      if (settingsDrawer.isOpen) settingsDrawer.close();
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
    if (confirm('Are you sure you want to clear all winner records and restore the draw pool?')) {
      roster.resetWinners();
      refreshPoolHUD();
      historyDrawer.render();
      hudTip.textContent = 'ALL WINNERS CLEARED — POOL RESTORED';
      setTimeout(() => {
        if (fsm.getState() === States.IDLE) {
          hudTip.textContent = 'CLICK OR PRESS [SPACE] TO INITIATE DRAW';
        }
      }, 2000);
    }
  });
});
