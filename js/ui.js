import { ITEM_TYPES, TEAM_COLORS } from './config.js';
import { getItemIconMarkup } from './item-icons.js';
import { padTime } from './utils.js';

const TRANSLATIONS = {
  en: {
    langButton: 'EN',
    pageTitle: 'Star Swarm Arena',
    blueFleet: 'Blue Fleet',
    redFleet: 'Red Fleet',
    mothershipCommand: 'Mothership Command',
    strikeFormation: 'Strike Formation',
    arenaStatus: 'Arena Status',
    velocitySystem: 'Velocity Duel System',
    logoTitle: 'Star Swarm Arena',
    startOverline: 'Local Split-Screen Battle',
    startTitle: 'Break Formation. Seize The Arena.',
    startDescription: 'Two rival flagships tear through a shared battlefield, racing for planets, fleet growth, and the final collapse.',
    startBattle: 'Start Battle',
    settings: 'Settings',
    quickSetup: 'Quick Setup',
    touch: 'Touch',
    touchMode: 'Left / Right Screen',
    boost: 'Boost',
    arrowKeys: 'Arrow Keys',
    settingsNote: 'Capture planets, raise your drone cap, and destroy the enemy mothership first.',
    matchComplete: 'Match Complete',
    runItBack: 'Run It Back',
    backToHome: 'Back To Home',
    noBuffs: 'No buffs',
    planetsSuffix: 'planets',
    battleLive: 'Battle Live',
    awaitingRestart: 'Awaiting Restart',
    standBy: 'Stand By',
    neutralTip: (count, cap) => `${count} neutral planets remain. Item cap: ${cap}.`,
    victoryTitle: (winner) => `${winner} Victory`,
    victorySubtitle: (winner) => `The enemy flagship is down. ${winner} now controls the arena.`,
    items: {
      'ship-speed': { name: 'Ship Speed', description: 'Mothership speed +50% for 3 seconds.' },
      production: { name: 'Production', description: 'Drone output doubles for 3 seconds.' },
      'drone-size': { name: 'Drone Size', description: 'Drone body size +80% for 3 seconds.' },
      'drone-speed': { name: 'Drone Speed', description: 'Drone speed +50% for 3 seconds.' },
      'drone-attack': { name: 'Attack x2', description: 'Drone damage doubles for 3 seconds.' },
      neutralize: { name: 'Neutralize', description: 'One enemy planet is reset to neutral instantly.' },
      autocapture: { name: 'Auto Capture', description: 'Claims the nearest planet after 3 seconds.' },
    },
    buffs: {
      shipSpeed: 'Ship Speed',
      production: 'Production',
      droneSize: 'Drone Size',
      droneSpeed: 'Drone Speed',
      droneDamage: 'Attack x2',
      autocapture: 'Auto Capture',
    },
    teams: {
      blue: 'Blue Fleet',
      red: 'Red Fleet',
    },
  },
  zh: {
    langButton: '中文',
    pageTitle: '星群竞技场',
    blueFleet: '蓝方舰队',
    redFleet: '红方舰队',
    mothershipCommand: '母舰指挥',
    strikeFormation: '突击编队',
    arenaStatus: '战场状态',
    velocitySystem: '高速对决系统',
    logoTitle: '星群竞技场',
    startOverline: '本地双人同屏对战',
    startTitle: '突破防线，夺取战场。',
    startDescription: '两艘敌对旗舰在同一片战场上高速缠斗，争夺星球、舰群规模与最终胜利。',
    startBattle: '开始战斗',
    settings: '设置',
    quickSetup: '快速设置',
    touch: '触控',
    touchMode: '屏幕左侧 / 右侧',
    boost: '加速',
    arrowKeys: '方向键',
    settingsNote: '占领星球，提升无人机上限，并率先摧毁敌方母舰。',
    matchComplete: '对局结束',
    runItBack: '再来一局',
    backToHome: '返回主页',
    noBuffs: '暂无增益',
    planetsSuffix: '颗星球',
    battleLive: '战斗进行中',
    awaitingRestart: '等待重新开始',
    standBy: '待命中',
    neutralTip: (count, cap) => `剩余中立星球 ${count} 颗。道具上限：${cap}。`,
    victoryTitle: (winner) => `${winner} 胜利`,
    victorySubtitle: (winner) => `敌方母舰已被摧毁，现在由${winner}掌控整片战场。`,
    items: {
      'ship-speed': { name: '战舰加速', description: '母舰移动速度提升 50%，持续 3 秒。' },
      production: { name: '产能翻倍', description: '无人机产出速度翻倍，持续 3 秒。' },
      'drone-size': { name: '无人机增幅', description: '无人机体积提升 80%，持续 3 秒。' },
      'drone-speed': { name: '无人机加速', description: '无人机速度提升 50%，持续 3 秒。' },
      'drone-attack': { name: '攻击翻倍', description: '无人机伤害翻倍，持续 3 秒。' },
      neutralize: { name: '中立化', description: '立即将一颗敌方星球重置为中立。' },
      autocapture: { name: '自动占领', description: '3 秒后自动夺取最近的一颗星球。' },
    },
    buffs: {
      shipSpeed: '战舰加速',
      production: '产能翻倍',
      droneSize: '无人机增幅',
      droneSpeed: '无人机加速',
      droneDamage: '攻击翻倍',
      autocapture: '自动占领',
    },
    teams: {
      blue: '蓝方舰队',
      red: '红方舰队',
    },
  },
};

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
    this.languageButton = document.getElementById('language-button');
    this.restartButton = document.getElementById('restart-button');
    this.homeButton = document.getElementById('home-button');
    this.blueBoostButton = document.getElementById('blue-boost-button');
    this.redBoostButton = document.getElementById('red-boost-button');
    this.blueHold = document.getElementById('blue-hold');
    this.redHold = document.getElementById('red-hold');
    this.victoryTitle = document.getElementById('victory-title');
    this.victorySubtitle = document.getElementById('victory-subtitle');
    this.hudState = document.getElementById('hud-state');
    this.hudTip = document.getElementById('hud-tip');
    this.pickupNoticeStacks = {
      blue: document.getElementById('blue-pickup-notices'),
      red: document.getElementById('red-pickup-notices'),
    };
    this.currentLanguage = 'en';
    this.lastWinner = null;
    this.dualHold = { blue: false, red: false, progress: 0 };
    this.pickupNoticeEntries = [];
    this.pickupNoticeTimers = new Map();
    this.pickupNoticeSeq = 0;

    this.textRefs = {
      html: document.documentElement,
      title: document.querySelector('title'),
      blueName: document.querySelector('.hud-panel.blue .hud-name'),
      blueSubname: document.querySelector('.hud-panel.blue .hud-subname'),
      redName: document.querySelector('.hud-panel.red .hud-name'),
      redSubname: document.querySelector('.hud-panel.red .hud-subname'),
      arenaStatus: document.querySelector('.hud-center .eyebrow'),
      logoKicker: document.querySelector('.start-logo-kicker'),
      logoTitle: document.querySelector('.start-logo-title'),
      startOverline: document.querySelector('.start-overline'),
      startTitle: document.querySelector('.start-copy h1'),
      startDescription: document.querySelector('.start-description'),
      settingsTitle: document.querySelector('.settings-title'),
      settingsBlueLabel: document.querySelector('#settings-panel .settings-row:nth-child(2) span'),
      settingsRedLabel: document.querySelector('#settings-panel .settings-row:nth-child(3) span'),
      settingsRedValue: document.querySelector('#settings-panel .settings-row:nth-child(3) strong'),
      settingsTouchLabel: document.querySelector('#settings-panel .settings-row:nth-child(4) span'),
      settingsTouchValue: document.querySelector('#settings-panel .settings-row:nth-child(4) strong'),
      settingsNote: document.querySelector('.settings-note'),
      victoryEyebrow: document.querySelector('.victory-panel .eyebrow'),
    };

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
    this.bindLanguage();
    this.applyTranslations();
    this.setVisualState('start');
  }

  populateLegend() {
    if (!this.legend) return;
    const t = TRANSLATIONS[this.currentLanguage];
    this.legend.innerHTML = ITEM_TYPES.map((item) => `
      <article class="legend-item">
        <div class="legend-icon" style="--icon-accent:${item.accent}">
          ${getItemIconMarkup(item)}
        </div>
        <div class="legend-name">${t.items[item.id]?.name || item.name}</div>
        <div class="legend-desc">${t.items[item.id]?.description || item.description}</div>
      </article>
    `).join('');
  }

  getItemText(itemId) {
    const fallback = ITEM_TYPES.find((item) => item.id === itemId);
    const translated = TRANSLATIONS[this.currentLanguage].items[itemId];
    return {
      name: translated?.name || fallback?.name || itemId,
      description: translated?.description || fallback?.description || '',
      accent: fallback?.accent || '#d6d8de',
      icon: fallback ? getItemIconMarkup(fallback) : '',
    };
  }

  getPickupLeadText() {
    return this.currentLanguage === 'en' ? 'Picked up' : '\u83b7\u5f97\u9053\u5177';
  }

  clearPickupNoticeForTeam(team) {
    const removed = this.pickupNoticeEntries.filter((entry) => entry.team === team);
    for (const entry of removed) {
      const timer = this.pickupNoticeTimers.get(entry.id);
      if (timer) {
        window.clearTimeout(timer);
        this.pickupNoticeTimers.delete(entry.id);
      }
    }
    this.pickupNoticeEntries = this.pickupNoticeEntries.filter((entry) => entry.team !== team);
  }

  clearPickupNotices() {
    for (const timer of this.pickupNoticeTimers.values()) {
      window.clearTimeout(timer);
    }
    this.pickupNoticeTimers.clear();
    this.pickupNoticeEntries = [];
    this.renderPickupNotices();
  }

  removePickupNotice(id) {
    const timer = this.pickupNoticeTimers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      this.pickupNoticeTimers.delete(id);
    }
    this.pickupNoticeEntries = this.pickupNoticeEntries.filter((entry) => entry.id !== id);
    this.renderPickupNotices();
  }

  renderPickupNotices() {
    for (const team of ['blue', 'red']) {
      const stack = this.pickupNoticeStacks[team];
      if (!stack) continue;
      const teamName = TRANSLATIONS[this.currentLanguage].teams[team] || TEAM_COLORS[team].text;
      const lead = this.getPickupLeadText();
      stack.innerHTML = this.pickupNoticeEntries
        .filter((entry) => entry.team === team)
        .map((entry) => {
          const itemText = this.getItemText(entry.itemId);
          return `
            <article class="pickup-notice-card ${team}" style="--pickup-accent:${entry.accent}">
              <div class="pickup-notice-icon" aria-hidden="true">${itemText.icon}</div>
              <div class="pickup-notice-copy">
                <div class="pickup-notice-kicker">${teamName} · ${lead}</div>
                <div class="pickup-notice-name">${itemText.name}</div>
                <div class="pickup-notice-desc">${itemText.description}</div>
              </div>
            </article>
          `;
        })
        .join('');
    }
  }

  showPickupNotice(team, itemType) {
    if (!team || !itemType?.id) return;

    this.clearPickupNoticeForTeam(team);

    const entry = {
      id: `pickup-${this.pickupNoticeSeq += 1}`,
      team,
      itemId: itemType.id,
      accent: itemType.accent,
    };

    this.pickupNoticeEntries.push(entry);
    this.renderPickupNotices();

    const timer = window.setTimeout(() => this.removePickupNotice(entry.id), 2200);
    this.pickupNoticeTimers.set(entry.id, timer);
  }

  bindCallbacks(callbacks) {
    this.startButton?.addEventListener('click', callbacks.onStart);
    this.restartButton?.addEventListener('click', callbacks.onRestart);
    this.homeButton?.addEventListener('click', callbacks.onHome);
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

  bindLanguage() {
    if (!this.languageButton) return;
    this.languageButton.addEventListener('click', () => {
      this.currentLanguage = this.currentLanguage === 'en' ? 'zh' : 'en';
      this.applyTranslations();
    });
  }

  applyTranslations() {
    const t = TRANSLATIONS[this.currentLanguage];
    this.textRefs.html?.setAttribute('lang', this.currentLanguage === 'en' ? 'en' : 'zh-CN');
    if (this.textRefs.title) this.textRefs.title.textContent = t.pageTitle;
    if (this.languageButton) this.languageButton.textContent = t.langButton;
    if (this.textRefs.blueName) this.textRefs.blueName.textContent = t.blueFleet;
    if (this.textRefs.blueSubname) this.textRefs.blueSubname.textContent = t.mothershipCommand;
    if (this.textRefs.redName) this.textRefs.redName.textContent = t.redFleet;
    if (this.textRefs.redSubname) this.textRefs.redSubname.textContent = t.strikeFormation;
    if (this.textRefs.arenaStatus) this.textRefs.arenaStatus.textContent = t.arenaStatus;
    if (this.textRefs.logoKicker) this.textRefs.logoKicker.textContent = t.velocitySystem;
    if (this.textRefs.logoTitle) this.textRefs.logoTitle.textContent = t.logoTitle;
    if (this.textRefs.startOverline) this.textRefs.startOverline.textContent = t.startOverline;
    if (this.textRefs.startTitle) this.textRefs.startTitle.textContent = t.startTitle;
    if (this.textRefs.startDescription) this.textRefs.startDescription.textContent = t.startDescription;
    if (this.startButton) this.startButton.textContent = t.startBattle;
    if (this.settingsButton) this.settingsButton.textContent = t.settings;
    if (this.textRefs.settingsTitle) this.textRefs.settingsTitle.textContent = t.quickSetup;
    if (this.textRefs.settingsBlueLabel) this.textRefs.settingsBlueLabel.textContent = t.blueFleet;
    if (this.textRefs.settingsRedLabel) this.textRefs.settingsRedLabel.textContent = t.redFleet;
    if (this.textRefs.settingsRedValue) this.textRefs.settingsRedValue.textContent = t.arrowKeys;
    if (this.textRefs.settingsTouchLabel) this.textRefs.settingsTouchLabel.textContent = t.touch;
    if (this.textRefs.settingsTouchValue) this.textRefs.settingsTouchValue.textContent = t.touchMode;
    if (this.textRefs.settingsNote) this.textRefs.settingsNote.textContent = t.settingsNote;
    if (this.textRefs.victoryEyebrow) this.textRefs.victoryEyebrow.textContent = t.matchComplete;
    if (this.restartButton) this.restartButton.textContent = t.runItBack;
    if (this.homeButton) this.homeButton.textContent = t.backToHome;
    if (this.blueBoostButton) this.blueBoostButton.textContent = t.boost;
    if (this.redBoostButton) this.redBoostButton.textContent = t.boost;
    this.populateLegend();
    this.renderPickupNotices();
    if (this.lastWinner) {
      this.setVictoryText(this.lastWinner);
    }
  }

  setVictoryText(team) {
    const t = TRANSLATIONS[this.currentLanguage];
    const winner = t.teams[team] || TEAM_COLORS[team].text;
    this.victoryTitle.textContent = t.victoryTitle(winner);
    this.victorySubtitle.textContent = t.victorySubtitle(winner);
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
    this.clearPickupNotices();
    this.setVisualState('start');
    this.hud.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
    if (this.settingsPanel) {
      this.settingsPanel.classList.add('hidden');
      this.settingsPanel.classList.remove('is-open');
    }
    if (this.settingsButton) {
      this.settingsButton.setAttribute('aria-expanded', 'false');
    }
  }

  showPlaying() {
    this.clearPickupNotices();
    this.setVisualState('playing');
    this.startScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  showVictory(team) {
    this.clearPickupNotices();
    this.setVisualState('victory');
    this.hud.classList.remove('hidden');
    this.victoryScreen.classList.remove('hidden');
    this.lastWinner = team;
    this.setVictoryText(team);
  }

  setVisualState(state) {
    if (!this.appShell) return;
    this.appShell.classList.toggle('state-start', state === 'start');
    this.appShell.classList.toggle('state-playing', state === 'playing');
    this.appShell.classList.toggle('state-victory', state === 'victory');
  }

  updateHUD(snapshot) {
    for (const team of ['blue', 'red']) {
      const entry = snapshot[team];
      const refs = this.refs[team];

      refs.bar.style.width = `${entry.healthRatio * 100}%`;
      refs.health.textContent = `${Math.ceil(entry.health)}/${entry.maxHealth}`;
      refs.drones.textContent = `${entry.drones}/${entry.cap}`;
      refs.planets.textContent = this.currentLanguage === 'en'
        ? `${entry.planets} ${TRANSLATIONS.en.planetsSuffix}`
        : `${entry.planets}${TRANSLATIONS.zh.planetsSuffix}`;
      refs.buffs.innerHTML = entry.buffs.length
        ? entry.buffs.map((buff) => `<span class="buff-pill">${TRANSLATIONS[this.currentLanguage].buffs[buff.type] || buff.label}<small>${padTime(buff.remaining)}</small></span>`).join('')
        : '';
    }

    this.hudState.textContent = TRANSLATIONS[this.currentLanguage][snapshot.stateKey] || snapshot.stateKey;
    this.hudTip.textContent = TRANSLATIONS[this.currentLanguage].neutralTip(snapshot.neutralPlanets, snapshot.itemCap);
  }
}
