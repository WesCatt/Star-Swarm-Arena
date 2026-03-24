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
    startOverline: 'Local And Online Fleet Arena',
    startTitle: 'Break Formation. Seize The Arena.',
    startDescription: 'Choose a same-screen duel or join a live 6-player room where bots hold the line until real pilots drop in and take over.',
    localPlay: 'Local Play',
    onlinePlay: 'Online Play',
    modeNotes: 'Mode Notes',
    localLabel: 'Local',
    onlineLabel: 'Online',
    mobileLabel: 'Mobile',
    localControls: 'W A S D / Arrows',
    onlineControls: 'W A S D + Space + H + K',
    mobileControls: 'Left Move / Right Boost',
    settingsNote: 'Online rooms hold 6 slots. Empty seats stay active as bots, and new players inherit that bot\'s current resources.',
    matchComplete: 'Match Complete',
    runItBack: 'Run It Back',
    backToHome: 'Back To Home',
    onlineMatch: 'Online Match',
    onlineConnectingTitle: 'Connecting To Fleet Relay',
    onlineConnectingSubtitle: 'Finding a room with up to 6 players. Empty seats stay active as bots until someone joins.',
    onlineWaiting: 'Waiting for server...',
    roomRoster: 'Room Roster',
    resourceLabel: 'Resources',
    planetLabel: 'Planets',
    elimLabel: 'Elims',
    hullLabel: 'Hull',
    boostLabel: 'Boost',
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
      'cooldown-haste': { name: 'Half Cooldown', description: 'Current skill cooldowns are halved, and new cooldowns stay halved for 6 seconds.' },
    },
    buffs: {
      shipSpeed: 'Ship Speed',
      production: 'Production',
      droneSize: 'Drone Size',
      droneSpeed: 'Drone Speed',
      droneDamage: 'Attack x2',
      autocapture: 'Auto Capture',
      cooldownHaste: 'Half Cooldown',
    },
    teams: {
      blue: 'Blue Fleet',
      red: 'Red Fleet',
    },
  },
  zh: {
    langButton: 'ZH',
    pageTitle: 'Star Swarm Arena',
    blueFleet: 'Blue Fleet',
    redFleet: 'Red Fleet',
    mothershipCommand: 'Mothership Command',
    strikeFormation: 'Strike Formation',
    arenaStatus: 'Arena Status',
    velocitySystem: 'Velocity Duel System',
    logoTitle: 'Star Swarm Arena',
    startOverline: 'Online And Local Fleet Arena',
    startTitle: 'Break Formation. Seize The Arena.',
    startDescription: 'Join local or online battles with up to 6 pilots and persistent bot seats.',
    localPlay: 'Local Play',
    onlinePlay: 'Online Play',
    modeNotes: 'Mode Notes',
    localLabel: 'Local',
    onlineLabel: 'Online',
    mobileLabel: 'Mobile',
    localControls: 'W A S D / Arrows',
    onlineControls: 'W A S D + Space + H + K',
    mobileControls: 'Left Move / Right Boost',
    settingsNote: 'Online rooms keep 6 active seats. Bots fill empty seats until real pilots join.',
    matchComplete: 'Match Complete',
    runItBack: 'Run It Back',
    backToHome: 'Back To Home',
    onlineMatch: 'Online Match',
    onlineConnectingTitle: 'Connecting To Fleet Relay',
    onlineConnectingSubtitle: 'Finding a room with up to 6 players. Empty seats stay active as bots until someone joins.',
    onlineWaiting: 'Waiting for server...',
    roomRoster: 'Room Roster',
    resourceLabel: 'Resources',
    planetLabel: 'Planets',
    elimLabel: 'Elims',
    hullLabel: 'Hull',
    boostLabel: 'Boost',
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
      'cooldown-haste': { name: 'Half Cooldown', description: 'Current skill cooldowns are halved, and new cooldowns stay halved for 6 seconds.' },
    },
    buffs: {
      shipSpeed: 'Ship Speed',
      production: 'Production',
      droneSize: 'Drone Size',
      droneSpeed: 'Drone Speed',
      droneDamage: 'Attack x2',
      autocapture: 'Auto Capture',
      cooldownHaste: 'Half Cooldown',
    },
    teams: {
      blue: 'Blue Fleet',
      red: 'Red Fleet',
    },
  },
};
const ONLINE_SHIP_AVATARS = {
  'slot-1': new URL('../assets/planets/Ships/ship_0000.png', import.meta.url).href,
  'slot-2': new URL('../assets/planets/Ships/ship_0004.png', import.meta.url).href,
  'slot-3': new URL('../assets/planets/Ships/ship_0008.png', import.meta.url).href,
  'slot-4': new URL('../assets/planets/Ships/ship_0012.png', import.meta.url).href,
  'slot-5': new URL('../assets/planets/Ships/ship_0016.png', import.meta.url).href,
  'slot-6': new URL('../assets/planets/Ships/ship_0020.png', import.meta.url).href,
  blue: new URL('../assets/planets/Ships/ship_0000.png', import.meta.url).href,
  red: new URL('../assets/planets/Ships/ship_0012.png', import.meta.url).href,
};

export class UI {
  constructor() {
    this.appShell = document.querySelector('.app-shell');
    this.hud = document.getElementById('top-hud');
    this.onlineHud = document.getElementById('online-hud');
    this.onlineMobileHud = document.getElementById('online-mobile-hud');
    this.onlineRoomIndicator = document.getElementById('online-room-indicator');
    this.startScreen = document.getElementById('start-screen');
    this.onlineStatusScreen = document.getElementById('online-status-screen');
    this.victoryScreen = document.getElementById('victory-screen');
    this.onlineMenuButton = document.getElementById('online-menu-button');
    this.onlineMenuModal = document.getElementById('online-menu-modal');
    this.onlineMenuContinueButton = document.getElementById('online-menu-continue');
    this.onlineMenuLeaveButton = document.getElementById('online-menu-leave');
    this.startButton = document.getElementById('start-button');
    this.settingsButton = document.getElementById('settings-button');
    this.settingsPanel = document.getElementById('settings-panel');
    this.languageButton = document.getElementById('language-button');
    this.restartButton = document.getElementById('restart-button');
    this.homeButton = document.getElementById('home-button');
    this.onlineHomeButton = document.getElementById('online-home-button');
    this.blueBoostButton = document.getElementById('blue-boost-button');
    this.redBoostButton = document.getElementById('red-boost-button');
    this.onlineBoostButton = document.getElementById('online-boost-button');
    this.victoryTitle = document.getElementById('victory-title');
    this.victorySubtitle = document.getElementById('victory-subtitle');
    this.hudState = document.getElementById('hud-state');
    this.hudTip = document.getElementById('hud-tip');
    this.onlineStatusTitle = document.getElementById('online-status-title');
    this.onlineStatusSubtitle = document.getElementById('online-status-subtitle');
    this.onlineStatusMeta = document.getElementById('online-status-meta');
    this.pickupNoticeStacks = {
      blue: document.getElementById('blue-pickup-notices'),
      red: document.getElementById('red-pickup-notices'),
    };
    this.currentLanguage = 'en';
    this.lastWinner = null;
    this.pickupNoticeEntries = [];
    this.pickupNoticeTimers = new Map();
    this.pickupNoticeSeq = 0;
    this.seenOnlinePickupIds = new Set();
    this.currentMode = 'local';
    this.lastOnlineHudSignature = '';
    this.lastOnlineRosterSignature = '';
    this.onlineRoomText = '';
    this.onlineFps = 0;

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
      settingsLocalLabel: document.querySelector('#settings-panel .settings-row:nth-child(2) span'),
      settingsLocalValue: document.querySelector('#settings-panel .settings-row:nth-child(2) strong'),
      settingsOnlineLabel: document.querySelector('#settings-panel .settings-row:nth-child(3) span'),
      settingsOnlineValue: document.querySelector('#settings-panel .settings-row:nth-child(3) strong'),
      settingsMobileLabel: document.querySelector('#settings-panel .settings-row:nth-child(4) span'),
      settingsMobileValue: document.querySelector('#settings-panel .settings-row:nth-child(4) strong'),
      settingsNote: document.querySelector('.settings-note'),
      victoryEyebrow: document.querySelector('.victory-panel .eyebrow'),
      onlineHudTitle: document.querySelector('.online-card-title'),
      onlineStatusEyebrow: document.querySelector('.online-status-panel .eyebrow'),
      onlineMenuEyebrow: document.querySelector('.online-menu-dialog .eyebrow'),
      onlineMenuTitle: document.getElementById('online-menu-title'),
      onlineMenuCopy: document.getElementById('online-menu-copy'),
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

    this.onlineRefs = {
      card: document.getElementById('online-player-card'),
      badge: document.getElementById('online-player-badge'),
      avatar: document.getElementById('online-player-avatar'),
      name: document.getElementById('online-player-name'),
      room: document.getElementById('online-player-room'),
      healthBar: document.getElementById('online-health-bar'),
      resourceText: document.getElementById('online-resource-text'),
      planetText: document.getElementById('online-planet-text'),
      killText: document.getElementById('online-kill-text'),
      skillRepair: document.getElementById('online-skill-repair'),
      skillArc: document.getElementById('online-skill-arc'),
      targetLock: document.getElementById('online-target-lock'),
      targetName: document.getElementById('online-target-name'),
      targetHealthBar: document.getElementById('online-target-health-bar'),
      targetHealthText: document.getElementById('online-target-health-text'),
      mobileCard: document.getElementById('online-mobile-card'),
      mobileAvatar: document.getElementById('online-mobile-avatar'),
      mobileRoom: document.getElementById('online-mobile-room'),
      mobileSeat: document.getElementById('online-mobile-seat'),
      mobileName: document.getElementById('online-mobile-name'),
      mobileHealthBar: document.getElementById('online-mobile-health-bar'),
      mobileResourceText: document.getElementById('online-mobile-resource-text'),
      mobilePlanetText: document.getElementById('online-mobile-planet-text'),
      mobileKillText: document.getElementById('online-mobile-kill-text'),
      mobileSkillRepair: document.getElementById('online-mobile-skill-repair'),
      mobileSkillArc: document.getElementById('online-mobile-skill-arc'),
      mobileTargetLock: document.getElementById('online-mobile-target-lock'),
      mobileTargetName: document.getElementById('online-mobile-target-name'),
      mobileTargetHealthBar: document.getElementById('online-mobile-target-health-bar'),
      mobileTargetHealthText: document.getElementById('online-mobile-target-health-text'),
      touchSkillRepairLabel: document.getElementById('online-repair-label'),
      touchSkillArcLabel: document.getElementById('online-arc-label'),
      touchSkillRepair: document.getElementById('online-repair-cooldown'),
      touchSkillArc: document.getElementById('online-arc-cooldown'),
    };

    this.bindLanguage();
    this.applyTranslations();
    this.setVisualState('start', 'local');
  }

  bindCallbacks(callbacks) {
    this.startButton?.addEventListener('click', callbacks.onStart);
    this.settingsButton?.addEventListener('click', callbacks.onOnlineStart);
    this.restartButton?.addEventListener('click', callbacks.onRestart);
    this.homeButton?.addEventListener('click', callbacks.onHome);
    this.onlineHomeButton?.addEventListener('click', callbacks.onOnlineHome || callbacks.onHome);
    this.onlineMenuButton?.addEventListener('click', callbacks.onOnlineMenuToggle);
    this.onlineMenuContinueButton?.addEventListener('click', callbacks.onOnlineMenuContinue);
    this.onlineMenuLeaveButton?.addEventListener('click', callbacks.onOnlineMenuLeave || callbacks.onOnlineHome || callbacks.onHome);
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
    if (this.startButton) this.startButton.textContent = t.localPlay;
    if (this.settingsButton) this.settingsButton.textContent = t.onlinePlay;
    if (this.textRefs.settingsTitle) this.textRefs.settingsTitle.textContent = t.modeNotes;
    if (this.textRefs.settingsLocalLabel) this.textRefs.settingsLocalLabel.textContent = t.localLabel;
    if (this.textRefs.settingsLocalValue) this.textRefs.settingsLocalValue.textContent = t.localControls;
    if (this.textRefs.settingsOnlineLabel) this.textRefs.settingsOnlineLabel.textContent = t.onlineLabel;
    if (this.textRefs.settingsOnlineValue) this.textRefs.settingsOnlineValue.textContent = t.onlineControls;
    if (this.textRefs.settingsMobileLabel) this.textRefs.settingsMobileLabel.textContent = t.mobileLabel;
    if (this.textRefs.settingsMobileValue) this.textRefs.settingsMobileValue.textContent = t.mobileControls;
    if (this.textRefs.settingsNote) this.textRefs.settingsNote.textContent = t.settingsNote;
    if (this.textRefs.victoryEyebrow) this.textRefs.victoryEyebrow.textContent = t.matchComplete;
    if (this.textRefs.onlineHudTitle) this.textRefs.onlineHudTitle.textContent = t.roomRoster;
    if (this.textRefs.onlineStatusEyebrow) this.textRefs.onlineStatusEyebrow.textContent = t.onlineMatch;
    if (this.onlineMenuButton) this.onlineMenuButton.textContent = 'Settings';
    if (this.textRefs.onlineMenuEyebrow) this.textRefs.onlineMenuEyebrow.textContent = t.onlineMatch;
    if (this.textRefs.onlineMenuTitle) this.textRefs.onlineMenuTitle.textContent = 'Match Menu';
    if (this.textRefs.onlineMenuCopy) this.textRefs.onlineMenuCopy.textContent = 'Choose to keep flying or leave this room and return to the home screen.';
    if (this.onlineMenuContinueButton) this.onlineMenuContinueButton.textContent = 'Continue';
    if (this.onlineMenuLeaveButton) this.onlineMenuLeaveButton.textContent = 'Leave Game';
    if (this.onlineStatusTitle && !this.onlineStatusTitle.dataset.customized) this.onlineStatusTitle.textContent = t.onlineConnectingTitle;
    if (this.onlineStatusSubtitle && !this.onlineStatusSubtitle.dataset.customized) this.onlineStatusSubtitle.textContent = t.onlineConnectingSubtitle;
    if (this.onlineStatusMeta && !this.onlineStatusMeta.dataset.customized) this.onlineStatusMeta.textContent = t.onlineWaiting;
    if (this.restartButton) this.restartButton.textContent = t.runItBack;
    if (this.homeButton) this.homeButton.textContent = t.backToHome;
    if (this.onlineHomeButton) this.onlineHomeButton.textContent = t.backToHome;
    if (this.blueBoostButton) this.blueBoostButton.textContent = t.boostLabel.toUpperCase();
    if (this.redBoostButton) this.redBoostButton.textContent = t.boostLabel.toUpperCase();
    if (this.onlineBoostButton) this.onlineBoostButton.textContent = t.boostLabel.toUpperCase();
    if (this.lastWinner) this.setVictoryText(this.lastWinner);
    this.renderPickupNotices();
  }

  setVictoryText(team) {
    const t = TRANSLATIONS[this.currentLanguage];
    const winner = t.teams[team] || TEAM_COLORS[team].text;
    this.victoryTitle.textContent = t.victoryTitle(winner);
    this.victorySubtitle.textContent = t.victorySubtitle(winner);
  }

  setVisualState(state, mode = this.currentMode) {
    this.currentMode = mode;
    if (this.appShell) {
      this.appShell.dataset.mode = mode;
      this.appShell.classList.toggle('state-start', state === 'start');
      this.appShell.classList.toggle('state-playing', state === 'playing');
      this.appShell.classList.toggle('state-victory', state === 'victory');
    }
  }

  showStart() {
    this.clearPickupNotices();
    this.setVisualState('start', 'local');
    this.startScreen.classList.remove('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
    this.onlineRoomIndicator?.classList.add('hidden');
    this.hideOnlineMenu();
    this.onlineMenuButton?.classList.add('hidden');
    this.settingsPanel?.classList.remove('hidden');
  }

  showPlaying() {
    this.clearPickupNotices();
    this.setVisualState('playing', 'local');
    this.startScreen.classList.add('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
    this.onlineRoomIndicator?.classList.add('hidden');
    this.hideOnlineMenu();
    this.onlineMenuButton?.classList.add('hidden');
  }

  showOnlineStatus(status = {}) {
    const t = TRANSLATIONS[this.currentLanguage];
    this.clearPickupNotices();
    this.setVisualState('start', 'online');
    this.startScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
    this.onlineRoomIndicator?.classList.add('hidden');
    this.hideOnlineMenu();
    this.onlineMenuButton?.classList.add('hidden');
    this.onlineStatusScreen.classList.remove('hidden');

    if (this.onlineStatusTitle) {
      this.onlineStatusTitle.textContent = status.title || t.onlineConnectingTitle;
      this.onlineStatusTitle.dataset.customized = 'true';
    }
    if (this.onlineStatusSubtitle) {
      this.onlineStatusSubtitle.textContent = status.subtitle || t.onlineConnectingSubtitle;
      this.onlineStatusSubtitle.dataset.customized = 'true';
    }
    if (this.onlineStatusMeta) {
      this.onlineStatusMeta.textContent = status.meta || t.onlineWaiting;
      this.onlineStatusMeta.dataset.customized = 'true';
    }
  }

  showOnlinePlaying() {
    this.setVisualState('playing', 'online');
    this.startScreen.classList.add('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.onlineHud.classList.remove('hidden');
    this.onlineMobileHud.classList.remove('hidden');
    this.onlineRoomIndicator?.classList.remove('hidden');
    this.onlineMenuButton?.classList.remove('hidden');
    this.refreshOnlineRoomIndicator();
  }

  showVictory(team) {
    this.clearPickupNotices();
    this.setVisualState('victory', 'local');
    this.hud.classList.remove('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
    this.onlineRoomIndicator?.classList.add('hidden');
    this.hideOnlineMenu();
    this.onlineMenuButton?.classList.add('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.remove('hidden');
    this.lastWinner = team;
    this.setVictoryText(team);
  }

  showOnlineMenu() {
    this.onlineMenuModal?.classList.remove('hidden');
    if (this.onlineMenuButton) this.onlineMenuButton.setAttribute('aria-expanded', 'true');
  }

  hideOnlineMenu() {
    this.onlineMenuModal?.classList.add('hidden');
    if (this.onlineMenuButton) this.onlineMenuButton.setAttribute('aria-expanded', 'false');
  }

  toggleOnlineMenu() {
    if (!this.onlineMenuModal || this.currentMode !== 'online') return;
    const isHidden = this.onlineMenuModal.classList.contains('hidden');
    if (isHidden) this.showOnlineMenu();
    else this.hideOnlineMenu();
  }

  refreshOnlineRoomIndicator() {
    if (!this.onlineRoomIndicator) return;
    const room = this.onlineRoomText || 'Room --';
    const fps = this.onlineFps > 0 ? `  ${this.onlineFps} fps` : '';
    this.onlineRoomIndicator.textContent = `${room}${fps}`;
  }

  setOnlineFps(fps) {
    const rounded = Number.isFinite(fps) ? Math.max(0, Math.round(fps)) : 0;
    if (rounded === this.onlineFps) return;
    this.onlineFps = rounded;
    if (this.currentMode === 'online') this.refreshOnlineRoomIndicator();
  }

  updateDualHold() {}

  getOnlineShipAvatar(slotId) {
    return ONLINE_SHIP_AVATARS[slotId] || ONLINE_SHIP_AVATARS.blue;
  }

  syncOnlineIdentity(player) {
    const accent = player.theme?.primary || TEAM_COLORS[player.slotId]?.primary || '#4fd4ff';
    this.onlineRefs.card?.style.setProperty('--online-accent', accent);
    this.onlineRefs.mobileCard?.style.setProperty('--online-accent', accent);
    this.onlineRefs.badge?.style.setProperty('--online-accent', accent);

    const avatarUrl = this.getOnlineShipAvatar(player.slotId);
    if (this.onlineRefs.avatar) {
      this.onlineRefs.avatar.src = avatarUrl;
      this.onlineRefs.avatar.alt = `${player.badge} ship avatar`;
    }
    if (this.onlineRefs.mobileAvatar) {
      this.onlineRefs.mobileAvatar.src = avatarUrl;
      this.onlineRefs.mobileAvatar.alt = `${player.badge} ship avatar`;
    }
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
    return 'Picked up';
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
    this.seenOnlinePickupIds.clear();
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
    for (const stackName of ['blue', 'red']) {
      const stack = this.pickupNoticeStacks[stackName];
      if (!stack) continue;
      stack.innerHTML = this.pickupNoticeEntries
        .filter((entry) => (entry.stack || entry.team) === stackName)
        .map((entry) => {
          const itemText = this.getItemText(entry.itemId);
          const teamName = TRANSLATIONS[this.currentLanguage].teams[entry.team] || TEAM_COLORS[entry.team]?.text || entry.teamLabel || 'Pilot';
          const kicker = entry.kicker || `${teamName} / ${this.getPickupLeadText()}`;
          return `
            <article class="pickup-notice-card ${stackName}" style="--pickup-accent:${entry.accent}">
              <div class="pickup-notice-icon" aria-hidden="true">${itemText.icon}</div>
              <div class="pickup-notice-copy">
                <div class="pickup-notice-kicker">${kicker}</div>
                <div class="pickup-notice-name">${itemText.name}</div>
                <div class="pickup-notice-desc">${itemText.description}</div>
              </div>
            </article>
          `;
        })
        .join('');
    }
  }

  showPickupNotice(team, itemType, options = {}) {
    if (!team || !itemType?.id) return;
    const channel = options.channel || team;
    this.clearPickupNoticeForTeam(channel);
    const entry = {
      id: `pickup-${this.pickupNoticeSeq += 1}`,
      team: channel,
      stack: options.stack || (team === 'red' ? 'red' : 'blue'),
      teamLabel: options.teamLabel || null,
      kicker: options.kicker || null,
      itemId: itemType.id,
      accent: options.accent || itemType.accent,
    };
    this.pickupNoticeEntries.push(entry);
    this.renderPickupNotices();
    const timer = window.setTimeout(() => this.removePickupNotice(entry.id), options.duration || 2200);
    this.pickupNoticeTimers.set(entry.id, timer);
  }

  consumeOnlinePickupEvents(snapshot, playerSlotId, player) {
    if (!snapshot || !playerSlotId || !player) return;
    for (const event of snapshot.pickupEvents || []) {
      if (event.collectorSlotId !== playerSlotId || this.seenOnlinePickupIds.has(event.id)) continue;
      this.seenOnlinePickupIds.add(event.id);
      if (this.seenOnlinePickupIds.size > 48) {
        const oldestId = this.seenOnlinePickupIds.values().next().value;
        if (oldestId) this.seenOnlinePickupIds.delete(oldestId);
      }
      this.showPickupNotice(playerSlotId, {
        id: event.itemTypeId,
        accent: event.accent,
      }, {
        channel: `online-${playerSlotId}`,
        stack: 'blue',
        teamLabel: player.badge,
        kicker: `${player.badge} / PICKED UP`,
        accent: event.accent,
        duration: 2400,
      });
    }
  }
  updateHUD(snapshot) {
    if (!snapshot || this.currentMode !== 'local') return;
    for (const team of ['blue', 'red']) {
      const entry = snapshot[team];
      const refs = this.refs[team];
      if (!entry || !refs) continue;
      refs.bar.style.width = `${entry.healthRatio * 100}%`;
      refs.health.textContent = `${Math.ceil(entry.health)}/${entry.maxHealth}`;
      refs.drones.textContent = `${entry.drones}/${entry.cap}`;
      refs.planets.textContent = `${entry.planets} planets`;
      refs.buffs.innerHTML = entry.buffs.length
        ? entry.buffs.map((buff) => `<span class="buff-pill">${TRANSLATIONS[this.currentLanguage].buffs[buff.type] || buff.label}<small>${padTime(buff.remaining)}</small></span>`).join('')
        : '';
    }

    this.hudState.textContent = TRANSLATIONS[this.currentLanguage][snapshot.stateKey] || snapshot.stateKey;
    this.hudTip.textContent = TRANSLATIONS[this.currentLanguage].neutralTip(snapshot.neutralPlanets, snapshot.itemCap);
  }

  formatOnlineCooldown(frames) {
    if (!Number.isFinite(frames) || frames <= 0) return 'READY';
    const seconds = frames / 60;
    return seconds >= 10 ? `${Math.ceil(seconds)}S` : `${seconds.toFixed(1)}S`;
  }

  updateOnlineSkillPill(element, key, frames) {
    if (!element) return;
    const isReady = !Number.isFinite(frames) || frames <= 0;
    element.textContent = `${key} ${this.formatOnlineCooldown(frames)}`;
    element.classList.toggle('ready', isReady);
  }

  updateOnlineTouchCooldown(element, label, readyText, frames) {
    if (!element && !label) return;
    const isReady = !Number.isFinite(frames) || frames <= 0;
    const cooldownText = this.formatOnlineCooldown(frames);
    if (element) {
      element.textContent = cooldownText;
      element.classList.toggle('ready', isReady);
    }
    if (label) {
      label.textContent = isReady ? readyText : cooldownText;
      label.classList.toggle('cooling', !isReady);
      label.classList.toggle('ready', isReady);
    }
  }

  updateOnlineTargetLock(snapshot, playerSlotId) {
    const effect = (snapshot.skillEffects || []).find((entry) => (
      (entry.type === 'arc-strike' || entry.type === 'arc-orb')
      && entry.ownerSlotId === playerSlotId
      && entry.targetSlotId
    ));
    const target = effect
      ? snapshot.ships.find((ship) => ship.slotId === effect.targetSlotId && ship.health > 0 && ship.respawnFrames <= 0)
      : null;

    const pairs = [
      {
        root: this.onlineRefs.targetLock,
        name: this.onlineRefs.targetName,
        bar: this.onlineRefs.targetHealthBar,
        text: this.onlineRefs.targetHealthText,
      },
      {
        root: this.onlineRefs.mobileTargetLock,
        name: this.onlineRefs.mobileTargetName,
        bar: this.onlineRefs.mobileTargetHealthBar,
        text: this.onlineRefs.mobileTargetHealthText,
      },
    ];

    for (const refs of pairs) {
      if (!refs.root) continue;
      refs.root.classList.add('hidden');
    }

    return target;
  }

  updateOnlineHud(snapshot, playerSlotId) {
    if (!snapshot || !playerSlotId) return;

    const t = TRANSLATIONS[this.currentLanguage];
    const player = snapshot.ships.find((ship) => ship.slotId === playerSlotId);
    if (!player) return;
    const target = this.updateOnlineTargetLock(snapshot, playerSlotId);
    this.consumeOnlinePickupEvents(snapshot, playerSlotId, player);

    const hudSignature = [
      snapshot.roomId,
      snapshot.playerCount,
      player.badge,
      player.name,
      player.slotId,
      Math.round(player.health),
      Math.round(player.energy),
      Math.round(player.resources),
      player.planets,
      player.eliminations,
      Math.round(player.repairCooldown || 0),
      Math.round(player.arcCooldown || 0),
      target?.slotId || 'none',
      Math.round(target?.health || 0),
    ].join('|');

    if (hudSignature === this.lastOnlineHudSignature) {
      return;
    }
    this.lastOnlineHudSignature = hudSignature;

    this.syncOnlineIdentity(player);
    const roomText = `${snapshot.roomId} ${snapshot.playerCount}/${snapshot.capacity}`;
    this.onlineRoomText = roomText;
    if (this.onlineRefs.badge) this.onlineRefs.badge.textContent = '';
    if (this.onlineRefs.name) this.onlineRefs.name.textContent = '';
    if (this.onlineRefs.room) this.onlineRefs.room.textContent = '';
    this.refreshOnlineRoomIndicator();
    this.onlineRefs.healthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
    this.onlineRefs.resourceText.textContent = `${t.resourceLabel} ${Math.round(player.resources)}`;
    this.onlineRefs.planetText.textContent = `${t.planetLabel} ${player.planets}`;
    this.onlineRefs.killText.textContent = `${t.elimLabel} ${player.eliminations}`;
    this.updateOnlineSkillPill(this.onlineRefs.skillRepair, 'H', player.repairCooldown || 0);
    this.updateOnlineSkillPill(this.onlineRefs.skillArc, 'K', player.arcCooldown || 0);

    if (this.onlineRefs.mobileRoom) this.onlineRefs.mobileRoom.textContent = '';
    if (this.onlineRefs.mobileSeat) this.onlineRefs.mobileSeat.textContent = '';
    if (this.onlineRefs.mobileName) this.onlineRefs.mobileName.textContent = '';
    this.onlineRefs.mobileHealthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
    this.onlineRefs.mobileResourceText.textContent = `${t.resourceLabel[0] || 'R'} ${Math.round(player.resources)}`;
    this.onlineRefs.mobilePlanetText.textContent = `${t.planetLabel[0] || 'P'} ${player.planets}`;
    this.onlineRefs.mobileKillText.textContent = `${t.elimLabel[0] || 'K'} ${player.eliminations}`;
    this.updateOnlineSkillPill(this.onlineRefs.mobileSkillRepair, 'H', player.repairCooldown || 0);
    this.updateOnlineSkillPill(this.onlineRefs.mobileSkillArc, 'K', player.arcCooldown || 0);
    this.updateOnlineTouchCooldown(
      this.onlineRefs.touchSkillRepair,
      this.onlineRefs.touchSkillRepairLabel,
      'H',
      player.repairCooldown || 0,
    );
    this.updateOnlineTouchCooldown(
      this.onlineRefs.touchSkillArc,
      this.onlineRefs.touchSkillArcLabel,
      'K',
      player.arcCooldown || 0,
    );
  }
}
