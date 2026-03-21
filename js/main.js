import { Game } from './game.js';
import { loadAssets } from './assets.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadAssets();
  const canvas = document.getElementById('game-canvas');
  const game = new Game(canvas);
  game.start();
});
