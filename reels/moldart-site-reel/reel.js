const stage = document.getElementById('reelStage');
const overlay = document.getElementById('reelOverlay');
const playButton = document.getElementById('playButton');
const replayButton = document.getElementById('replayButton');
const audio = document.getElementById('narration');
const scenes = [...document.querySelectorAll('.scene')].map((node, index) => ({
  node,
  index,
  start: Number(node.dataset.start || 0),
  end: Number(node.dataset.end || 0),
}));
const progressSegments = [...document.querySelectorAll('.progress-segment')];

let rafId = 0;
let started = false;

function setProgress(currentTime) {
  scenes.forEach((scene, index) => {
    const isActive = currentTime >= scene.start && currentTime < scene.end;
    scene.node.classList.toggle('is-active', isActive);

    const segment = progressSegments[index];
    if (!segment) return;

    let fill = 0;
    if (currentTime >= scene.end) {
      fill = 1;
    } else if (currentTime > scene.start && scene.end > scene.start) {
      fill = (currentTime - scene.start) / (scene.end - scene.start);
    }
    segment.style.setProperty('--fill', String(Math.max(0, Math.min(fill, 1))));
  });
}

function tick() {
  setProgress(audio.currentTime || 0);
  if (!audio.paused && !audio.ended) {
    rafId = window.requestAnimationFrame(tick);
  }
}

async function startReel() {
  window.cancelAnimationFrame(rafId);
  audio.currentTime = 0;
  setProgress(0);
  replayButton.hidden = true;
  overlay.hidden = true;
  stage.dataset.playing = 'true';

  try {
    await audio.play();
    started = true;
    tick();
  } catch (error) {
    overlay.hidden = false;
    console.error('Audio playback failed', error);
  }
}

playButton?.addEventListener('click', startReel);
replayButton?.addEventListener('click', startReel);

audio?.addEventListener('ended', () => {
  window.cancelAnimationFrame(rafId);
  const lastScene = scenes[scenes.length - 1];
  setProgress(lastScene ? Math.max(lastScene.start, lastScene.end - 0.01) : audio.duration || 0);
  replayButton.hidden = false;
  stage.dataset.playing = 'false';
});

audio?.addEventListener('pause', () => {
  if (!audio.ended) {
    window.cancelAnimationFrame(rafId);
  }
});

audio?.addEventListener('loadedmetadata', () => {
  if (!started) {
    setProgress(0);
  }
});

setProgress(0);
