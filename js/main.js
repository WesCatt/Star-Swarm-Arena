import { Game } from './game.js';
import { AudioManager } from './audio.js';
import { loadAssets } from './assets.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadAssets();
  const canvas = document.getElementById('game-canvas');
  const audio = new AudioManager();
  const game = new Game(canvas, audio);
  const appShell = document.querySelector('.app-shell');
  const startButton = document.getElementById('start-button');
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
  syncAudio();
});
