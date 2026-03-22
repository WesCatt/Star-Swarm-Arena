import { ITEM_TYPES, TEAM_COLORS } from './config.js';
import { getItemIconMarkup } from './item-icons.js';
import { padTime } from './utils.js';

export class UI {
  constructor() {
    this.appShell = document.querySelector('.app-shell');
    this.hud = document.getElementById('top-hud');
    this.startScreen = document.getElementById('start-screen');
    this.victoryScreen = document.getElementById('victory-screen');
    this.legend = document.getElementById('item-legend');
    this.startButton = document.getElementById('start-button');
    this.settingsButton = document.getElementById('settings-button');
    this.settingsPanel = document.getElementById('settings-panel');
    this.restartButton = document.getElementById('restart-button');
    this.blueHold = document.getElementById('blue-hold');
    this.redHold = document.getElementById('red-hold');
    this.victoryTitle = document.getElementById('victory-title');
    this.victorySubtitle = document.getElementById('victory-subtitle');
    this.hudState = document.getElementById('hud-state');
    this.hudTip = document.getElementById('hud-tip');
    this.dualHold = { blue: false, red: false, progress: 0 };

    this.refs = {
      blue: {
        bar: document.getElementById('blue-health-bar'),
        health: document.getElementById('blue-health-text'),
        drones: document.getElementById('blue-drone-text'),
        planets: document.getElementById('blue-planet-text'),
        buffs: document.getElementById('blue-buffs'),
      },
      red: {
        bar: document.getElementById('red-health-bar'),
        health: document.getElementById('red-health-text'),
        drones: document.getElementById('red-drone-text'),
        planets: document.getElementById('red-planet-text'),
        buffs: document.getElementById('red-buffs'),
      },
    };

    this.populateLegend();
    this.bindHoldButtons();
    this.bindSettings();
  }

  populateLegend() {
    if (!this.legend) return;
    this.legend.innerHTML = ITEM_TYPES.map((item) => `
      <article class="legend-item">
        <div class="legend-icon" style="--icon-accent:${item.accent}">
          ${getItemIconMarkup(item)}
        </div>
        <div class="legend-name">${item.name}</div>
        <div class="legend-desc">${item.description}</div>
      </article>
    `).join('');
  }

  bindCallbacks(callbacks) {
    this.startButton?.addEventListener('click', callbacks.onStart);
    this.restartButton?.addEventListener('click', callbacks.onRestart);
  }

  bindHoldButtons() {
    if (!this.blueHold || !this.redHold) return;
    const bind = (element, key) => {
      const down = () => {
        this.dualHold[key] = true;
      };
      const up = () => {
        this.dualHold[key] = false;
      };

      element.addEventListener('pointerdown', down);
      element.addEventListener('pointerup', up);
      element.addEventListener('pointerleave', up);
      element.addEventListener('pointercancel', up);
    };

    bind(this.blueHold, 'blue');
    bind(this.redHold, 'red');
  }

  bindSettings() {
    if (!this.settingsButton || !this.settingsPanel) return;

    this.settingsButton.addEventListener('click', () => {
      const open = this.settingsPanel.classList.toggle('is-open');
      this.settingsPanel.classList.toggle('hidden', !open);
      this.settingsButton.setAttribute('aria-expanded', String(open));
    });
  }

  updateDualHold(delta, onReady) {
    if (!this.blueHold || !this.redHold) return;
    if (this.dualHold.blue && this.dualHold.red) {
      this.dualHold.progress = Math.min(1, this.dualHold.progress + delta / 900);
    } else {
      this.dualHold.progress = Math.max(0, this.dualHold.progress - delta / 250);
    }

    const degrees = `${this.dualHold.progress * 360}deg`;
    this.blueHold.style.setProperty('--progress', degrees);
    this.redHold.style.setProperty('--progress', degrees);

    if (this.dualHold.progress >= 1) {
      this.dualHold.progress = 0;
      this.dualHold.blue = false;
      this.dualHold.red = false;
      this.blueHold.style.setProperty('--progress', '0deg');
      this.redHold.style.setProperty('--progress', '0deg');
      onReady();
    }
  }

  showStart() {
    this.appShell?.classList.remove('state-playing', 'state-victory');
    this.appShell?.classList.add('state-start');
    this.hud.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
    this.settingsPanel?.classList.add('hidden');
    this.settingsPanel?.classList.remove('is-open');
    this.settingsButton?.setAttribute('aria-expanded', 'false');
  }

  showPlaying() {
    this.appShell?.classList.remove('state-start', 'state-victory');
    this.appShell?.classList.add('state-playing');
    this.startScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  showVictory(team) {
    this.appShell?.classList.remove('state-start', 'state-playing');
    this.appShell?.classList.add('state-victory');
    this.hud.classList.remove('hidden');
    this.victoryScreen.classList.remove('hidden');
    const winner = TEAM_COLORS[team].text;
    this.victoryTitle.textContent = `${winner} Victory`;
    this.victorySubtitle.textContent = `The enemy flagship is down. ${winner} now controls the arena.`;
  }

  updateHUD(snapshot) {
    for (const team of ['blue', 'red']) {
      const entry = snapshot[team];
      const refs = this.refs[team];

      refs.bar.style.width = `${entry.healthRatio * 100}%`;
      refs.health.textContent = `${Math.ceil(entry.health)} / ${entry.maxHealth}`;
      refs.drones.textContent = `${entry.drones} / ${entry.cap}`;
      refs.planets.textContent = `${entry.planets} planets`;
      refs.buffs.innerHTML = entry.buffs.length
        ? entry.buffs.map((buff) => `<span class="buff-pill">${buff.label}<small>${padTime(buff.remaining)}</small></span>`).join('')
        : '<span class="buff-pill">No buffs</span>';
    }

    this.hudState.textContent = snapshot.stateLabel;
    this.hudTip.textContent = snapshot.tip;
  }
}
