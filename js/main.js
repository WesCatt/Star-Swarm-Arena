import { Game } from './game.js';
import { AudioManager } from './audio.js';
import { loadAssets } from './assets.js';

window.addEventListener('DOMContentLoaded', async () => {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const loadingPercent = document.getElementById('loading-percent');
  const loadingKicker = document.getElementById('loading-kicker');
  const loadingStatus = document.getElementById('loading-status');
  const loadingMessages = [
    { until: 0.18, text: '\u6b63\u5728\u6821\u51c6\u661f\u56fe\u4e2d' },
    { until: 0.42, text: '\u6b63\u5728\u7ec4\u88c5\u98de\u8239\u4e2d' },
    { until: 0.72, text: '\u6b63\u5728\u90e8\u7f72\u98de\u8239\u4e2d' },
    { until: 0.92, text: '\u6b63\u5728\u63a5\u5165\u822a\u9053\u4e2d' },
    { until: 1, text: '\u5373\u5c06\u8dc3\u8fc1\u81f3\u6218\u573a' },
  ];

  const getLoadingMessage = (progress) => {
    const match = loadingMessages.find((entry) => progress < entry.until);
    return match?.text || '\u8230\u961f\u5df2\u5c31\u7eea';
  };

  const setLoadingProgress = ({ progress }) => {
    const percent = Math.round(progress * 100);
    if (loadingBar) loadingBar.style.width = `${percent}%`;
    if (loadingPercent) loadingPercent.textContent = `${percent}%`;
    if (loadingStatus) loadingStatus.textContent = getLoadingMessage(progress);
  };

  await loadAssets({ onProgress: setLoadingProgress });
  setLoadingProgress({ progress: 1 });

  const canvas = document.getElementById('game-canvas');
  const audio = new AudioManager();
  const game = new Game(canvas, audio);
  const appShell = document.querySelector('.app-shell');
  const startButton = document.getElementById('start-button');
  const onlineButton = document.getElementById('settings-button');
  audio.attachButton(document.getElementById('audio-button'));

  const syncViewportVars = () => {
    const viewport = window.visualViewport;
    const width = viewport?.width || document.documentElement.clientWidth || window.innerWidth;
    const height = viewport?.height || document.documentElement.clientHeight || window.innerHeight;
    document.documentElement.style.setProperty('--app-width', `${Math.round(width)}px`);
    document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
  };

  const tryEnterFullscreen = async () => {
    if (!appShell || document.fullscreenElement || !appShell.requestFullscreen) return;
    try {
      await appShell.requestFullscreen({ navigationUI: 'hide' });
    } catch {}
  };

  syncViewportVars();
  window.addEventListener('resize', syncViewportVars);
  window.visualViewport?.addEventListener('resize', syncViewportVars);
  window.visualViewport?.addEventListener('scroll', syncViewportVars);
  startButton?.addEventListener('click', tryEnterFullscreen, { passive: true });
  onlineButton?.addEventListener('click', tryEnterFullscreen, { passive: true });

  const unlockAudio = async () => {
    await audio.ensureStarted();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('mousedown', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('mousedown', unlockAudio, { passive: true });

  const syncAudio = () => {
    audio.setScene(game.state);
    audio.tick();
    requestAnimationFrame(syncAudio);
  };

  game.start();
  loadingScreen?.classList.add('hidden');
  syncAudio();
});
