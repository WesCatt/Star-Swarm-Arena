import { Game } from './game.js';
import { AudioManager } from './audio.js';
import { loadAssets } from './assets.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadAssets();
  const canvas = document.getElementById('game-canvas');
  const game = new Game(canvas);
  const audio = new AudioManager();
  audio.attachButton(document.getElementById('audio-button'));

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
