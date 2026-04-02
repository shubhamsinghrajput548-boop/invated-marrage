// ============================================================
//  WEDDING WEBSITE — ENHANCED JS
//  Includes: all 4 bug fixes + 6 new features
//    Visual:      Petal shower, Cursor sparkle trail, Typewriter text
//    Interactive: Know-the-couple quiz, Photo lightbox, Floating wishes wall
// ============================================================

// ─────────────────────────────────────────────
//  CANVAS SETUP
// ─────────────────────────────────────────────
const canvasFireworks = document.getElementById('fireworksCanvas');
const ctxFireworks    = canvasFireworks?.getContext('2d');
const canvasParticles = document.getElementById('particlesCanvas');
const ctxParticles    = canvasParticles?.getContext('2d');

let fireworks = [];
let particles = [];
let animationId;

function resizeCanvas(canvas, ctx) {
  if (!canvas || !ctx) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

if (canvasFireworks) resizeCanvas(canvasFireworks, ctxFireworks);
if (canvasParticles) resizeCanvas(canvasParticles, ctxParticles);


// ─────────────────────────────────────────────
//  FEATURE 1 — PETAL SHOWER
//  Rose/cherry petals fall from top alongside
//  the existing emoji particles.
// ─────────────────────────────────────────────
class Petal {
  constructor() {
    this.reset();
  }

  reset() {
    this.x       = Math.random() * window.innerWidth;
    this.y       = -20;
    this.size    = Math.random() * 10 + 6;
    this.speedY  = Math.random() * 1.2 + 0.6;
    this.speedX  = (Math.random() - 0.5) * 0.8;
    this.angle   = Math.random() * Math.PI * 2;
    this.spin    = (Math.random() - 0.5) * 0.06;
    this.opacity = Math.random() * 0.5 + 0.5;
    // Soft petal palette: pinks, reds, whites
    const hue    = Math.random() < 0.5
      ? Math.random() * 20 + 340   // pink-red
      : Math.random() * 30 + 0;    // red-orange
    this.color   = `hsl(${hue}, 80%, ${Math.random() * 20 + 70}%)`;
  }

  update() {
    this.y      += this.speedY;
    this.x      += this.speedX + Math.sin(this.y * 0.02) * 0.4;
    this.angle  += this.spin;
    if (this.y > window.innerHeight + 30) this.reset();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle   = this.color;
    // Simple oval petal shape
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.45, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const PETAL_COUNT = 35;
const petalArray  = Array.from({ length: PETAL_COUNT }, () => {
  const p = new Petal();
  p.y = Math.random() * window.innerHeight; // stagger initial positions
  return p;
});


// ─────────────────────────────────────────────
//  PARTICLE  (bug fix: direction=1 moves UP)
// ─────────────────────────────────────────────
class Particle {
  constructor(x, y, direction = 1) {
    this.x       = x;
    this.y       = direction > 0 ? window.innerHeight : 0;
    this.startY  = this.y;
    this.size    = Math.random() * 4 + 2;
    this.speedX  = 0;
    // FIX Bug 3: negate so direction=1 moves upward (y decreases)
    this.speedY  = direction * -(Math.random() * 1.5 + 0.8);
    this.direction = direction;
    this.opacity = 1;
    this.life    = 0;
    this.emoji   = ['💖','💕','✨','🌟','💫','🌸','🌺','💐'][Math.floor(Math.random() * 8)];
  }

  update() {
    this.life++;
    this.x      += Math.sin(this.life * 0.02 + this.x * 0.01) * 0.3;
    this.y      += this.speedY;
    this.opacity = 1 - (this.life / 300);

    if (this.direction > 0 && this.y < -50)                  return false;
    if (this.direction < 0 && this.y > window.innerHeight + 50) return false;
    if (this.opacity <= 0)                                     return false;
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha   = this.opacity;
    ctx.font          = `${this.size * 8}px Arial`;
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'middle';
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.restore();
  }
}


// ─────────────────────────────────────────────
//  FIREWORKS
// ─────────────────────────────────────────────
class Firework {
  constructor(x, y) {
    this.x        = x;
    this.y        = window.innerHeight;
    this.targetY  = y;
    this.speed    = 4;
    this.color    = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.exploded = false;
    this.particles = [];
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) this.explode();
    } else {
      this.particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.1;
        p.life++;
        p.vx *= 0.98;
      });
      this.particles = this.particles.filter(p => p.life < p.maxLife);
    }
  }

  explode() {
    this.exploded = true;
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: this.x + Math.cos(angle) * 10,
        y: this.y + Math.sin(angle) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0, maxLife: 60,
        color: this.color,
        size: Math.random() * 3 + 1
      });
    }
  }

  draw(ctx) {
    if (!this.exploded) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }
}


// ─────────────────────────────────────────────
//  FEATURE 2 — CURSOR SPARKLE TRAIL
// ─────────────────────────────────────────────
const sparkles = [];

class Sparkle {
  constructor(x, y) {
    this.x       = x;
    this.y       = y;
    this.size    = Math.random() * 6 + 3;
    this.life    = 1;
    this.decay   = Math.random() * 0.04 + 0.025;
    this.vx      = (Math.random() - 0.5) * 2;
    this.vy      = (Math.random() - 0.5) * 2 - 1;
    const hue    = Math.random() * 60 + 300; // pink-gold range
    this.color   = `hsl(${hue}, 100%, 70%)`;
  }

  update() {
    this.life -= this.decay;
    this.x    += this.vx;
    this.y    += this.vy;
    this.size *= 0.95;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle   = this.color;
    // Draw a 4-pointed star
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r     = i % 2 === 0 ? this.size : this.size * 0.4;
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      i === 0
        ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
        : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Dedicated lightweight canvas for cursor sparkles
const cursorCanvas    = document.createElement('canvas');
cursorCanvas.style.cssText =
  'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
document.body.appendChild(cursorCanvas);
const ctxCursor = cursorCanvas.getContext('2d');

function resizeCursorCanvas() {
  cursorCanvas.width  = window.innerWidth;
  cursorCanvas.height = window.innerHeight;
}
resizeCursorCanvas();

let lastMouseX = -999, lastMouseY = -999;
document.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  // Only spawn if mouse actually moved a bit (avoids pileup while idle)
  if (Math.hypot(dx, dy) > 4) {
    sparkles.push(new Sparkle(e.clientX, e.clientY));
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});

function animateCursor() {
  ctxCursor.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  for (let i = sparkles.length - 1; i >= 0; i--) {
    sparkles[i].draw(ctxCursor);
    if (!sparkles[i].update()) sparkles.splice(i, 1);
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();


// ─────────────────────────────────────────────
//  ANIMATION LOOP  (bug fix: no ctx re-fetch)
// ─────────────────────────────────────────────
function animate() {
  // Particles + petals share one canvas
  if (canvasParticles && ctxParticles) {
    ctxParticles.clearRect(0, 0, canvasParticles.width, canvasParticles.height);

    particles = particles.filter(p => p.update());
    particles.forEach(p => p.draw(ctxParticles));
    while (particles.length > 50) particles.shift();

    if (Math.random() < 0.05) {
      particles.push(new Particle(Math.random() * canvasParticles.width, canvasParticles.height));
    }

    // Draw petals on the same canvas
    petalArray.forEach(p => { p.update(); p.draw(ctxParticles); });
  }

  if (ctxFireworks && canvasFireworks) {
    ctxFireworks.clearRect(0, 0, canvasFireworks.width, canvasFireworks.height);
    fireworks = fireworks.filter(fw => {
      fw.update();
      return fw.exploded ? fw.particles.length > 0 : true;
    });
    fireworks.forEach(fw => fw.draw(ctxFireworks));

    if (Math.random() < 0.02) {
      fireworks.push(
        new Firework(Math.random() * canvasFireworks.width, canvasFireworks.height * 0.3)
      );
    }
  }

  animationId = requestAnimationFrame(animate);
}

animate();

// FIX Bug 1: restored the missing setInterval wrapper
setInterval(() => {
  if (canvasFireworks) {
    fireworks.push(
      new Firework(Math.random() * window.innerWidth, window.innerHeight * 0.3)
    );
  }
}, 2000);


// ─────────────────────────────────────────────
//  FEATURE 3 — TYPEWRITER HERO TEXT
//  Targets any element with data-typewriter attr.
//  Usage: <h1 data-typewriter="Aryan & Priya">
// ─────────────────────────────────────────────
function initTypewriter() {
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const fullText  = el.dataset.typewriter || el.textContent;
    const speed     = parseInt(el.dataset.typewriterSpeed || '80', 10);
    const pauseEnd  = parseInt(el.dataset.typewriterPause || '2000', 10);
    el.textContent  = '';
    el.style.borderRight = '2px solid currentColor';
    el.style.whiteSpace  = 'nowrap';
    el.style.overflow    = 'hidden';

    let i = 0;
    function type() {
      if (i < fullText.length) {
        el.textContent += fullText.charAt(i++);
        setTimeout(type, speed);
      } else {
        // Blink cursor then erase option — here we just keep text and fade cursor
        setTimeout(() => {
          el.style.transition   = 'border-color 0.5s';
          el.style.borderColor  = 'transparent';
        }, pauseEnd);
      }
    }
    // Small initial delay so page loads first
    setTimeout(type, 600);
  });
}

initTypewriter();


// ─────────────────────────────────────────────
//  MUSIC & ENTRY
// ─────────────────────────────────────────────
const music    = document.getElementById('bgMusic');
const musicBtn = document.querySelector('.music-control');
let isPlaying  = false;

function fadeInMusic() {
  if (!music) return;
  music.volume = 0;
  music.play().catch(() => {});
  let vol = 0;
  const fade = setInterval(() => {
    vol          += 0.03;
    music.volume  = Math.min(vol, 0.6);
    if (vol >= 0.6) clearInterval(fade);
  }, 150);
}

if (music && musicBtn) {
  fadeInMusic();
  isPlaying            = true;
  musicBtn.textContent = '🔇 Mute';

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      music.pause();
      musicBtn.textContent = '🎵 Play Music';
      isPlaying = false;
    } else {
      fadeInMusic();
      musicBtn.textContent = '🔇 Mute';
      isPlaying = true;
    }
  });
}


// ─────────────────────────────────────────────
//  THEME TOGGLE
// ─────────────────────────────────────────────
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
  });
}


// ─────────────────────────────────────────────
//  COUNTDOWN WITH FLIP ANIMATION
// ─────────────────────────────────────────────
const weddingDate = new Date('2026-04-20T12:00:00').getTime();


function updateCountdown() {
  const now  = Date.now();
  const diff = weddingDate - now;

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const vals = { days, hours, minutes, seconds };
  Object.entries(vals).forEach(([id, newVal]) => {
    const front = document.getElementById(id);
    const back  = document.getElementById(id + '-back');
    if (!front) return;
    const formatted = newVal.toString().padStart(2, '0');
    if (front.textContent !== formatted) {
      if (back) back.textContent = formatted;
      const card = front.closest('.flip-card-inner');
      if (card) {
        card.style.transition = 'transform 0.4s ease';
        card.style.transform  = 'rotateY(180deg)';
        setTimeout(() => {
          front.textContent    = formatted;
          card.style.transition = 'none';
          card.style.transform  = 'rotateY(0deg)';
        }, 400);
      } else {
        front.textContent = formatted;
      }
    }
  });

  

  if (diff < 0) {
    const h2 = document.querySelector('.countdown-container h2');
    if (h2) h2.textContent = 'We Are Married! 💍✨';
    for (let i = 0; i < 200; i++) {
      particles.push(
        new Particle(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
      );
    }
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();


// ─────────────────────────────────────────────
//  SCROLL ANIMATIONS & PARALLAX
// ─────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.section, .glass-card').forEach(el => observer.observe(el));

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  document.querySelectorAll('.parallax').forEach(el => {
    el.style.backgroundPositionY = `${scrolled * 0.3}px`;
  });
});


// ─────────────────────────────────────────────
//  TIMELINE INTERACTIVITY
// ─────────────────────────────────────────────
document.querySelectorAll('.timeline-item').forEach((item, index) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});


// ─────────────────────────────────────────────
//  FEATURE 4 — PHOTO LIGHTBOX GALLERY
//  Works with existing .gallery-item elements.
//  Expects <img> inside each .gallery-item.
// ─────────────────────────────────────────────
function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Build overlay DOM
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.innerHTML = `
    <div id="lightbox-backdrop"></div>
    <div id="lightbox-box">
      <button id="lightbox-prev" aria-label="Previous">&#8249;</button>
      <img id="lightbox-img" src="" alt="Gallery photo" />
      <button id="lightbox-next" aria-label="Next">&#8250;</button>
      <button id="lightbox-close" aria-label="Close">&times;</button>
      <div id="lightbox-counter"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Inject minimal styles
  const style = document.createElement('style');
  style.textContent = `
    #lightbox-overlay {
      display: none; position: fixed; inset: 0; z-index: 10000;
      align-items: center; justify-content: center;
    }
    #lightbox-overlay.open { display: flex; }
    #lightbox-backdrop {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.85); cursor: pointer;
    }
    #lightbox-box {
      position: relative; z-index: 1;
      display: flex; align-items: center; gap: 12px;
      max-width: 90vw; max-height: 90vh;
    }
    #lightbox-img {
      max-width: 80vw; max-height: 80vh;
      border-radius: 12px; object-fit: contain;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      transition: opacity 0.2s;
    }
    #lightbox-prev, #lightbox-next {
      background: rgba(255,255,255,0.15); border: none; color: #fff;
      font-size: 2rem; width: 44px; height: 44px; border-radius: 50%;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; transition: background 0.2s; flex-shrink: 0;
    }
    #lightbox-prev:hover, #lightbox-next:hover { background: rgba(255,255,255,0.3); }
    #lightbox-close {
      position: absolute; top: -40px; right: 0;
      background: none; border: none; color: #fff;
      font-size: 2rem; cursor: pointer; line-height: 1;
    }
    #lightbox-counter {
      position: absolute; bottom: -30px; left: 50%;
      transform: translateX(-50%); color: rgba(255,255,255,0.7);
      font-size: 13px; white-space: nowrap;
    }
  `;
  document.head.appendChild(style);

  // Collect image srcs
  const srcs = Array.from(items).map(item => {
    const img = item.querySelector('img');
    return img ? img.src : item.style.backgroundImage.replace(/url\(["']?|["']?\)/g,'');
  });

  let current = 0;
  const imgEl     = document.getElementById('lightbox-img');
  const counter   = document.getElementById('lightbox-counter');

  function openAt(index) {
    current = (index + srcs.length) % srcs.length;
    imgEl.style.opacity = '0';
    imgEl.src = srcs[current];
    imgEl.onload = () => { imgEl.style.opacity = '1'; };
    counter.textContent = `${current + 1} / ${srcs.length}`;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => openAt(i));
  });

  document.getElementById('lightbox-prev').addEventListener('click', () => openAt(current - 1));
  document.getElementById('lightbox-next').addEventListener('click', () => openAt(current + 1));
  document.getElementById('lightbox-close').addEventListener('click', close);
  document.getElementById('lightbox-backdrop').addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'ArrowRight') openAt(current + 1);
    if (e.key === 'ArrowLeft')  openAt(current - 1);
    if (e.key === 'Escape')     close();
  });
}

initLightbox();


// ─────────────────────────────────────────────
//  FEATURE 5 — "KNOW THE COUPLE" QUIZ
//  Add a <div id="couple-quiz"></div> anywhere
//  in the HTML to mount this quiz.
//  Customise QUIZ_QUESTIONS below.
// ─────────────────────────────────────────────
// const QUIZ_QUESTIONS = [
//   {
//     q:       'Where did the couple first meet?',
//     options: ['At a café', 'At a ', 'At university', 'At work'],
//     answer:  1   // index of correct option
//   },
//   {
//     q:       'What is their favourite travel destination together?',
//     options: ['Paris', 'Bali', 'Tokyo', 'New York'],
//     answer:  1
//   },
//   {
//     q:       'How long have they been together?',
//     options: ['1 year', '2 years', '3 years', '5 years'],
//     answer:  2
//   },
//   {
//     q:       'What is their shared hobby?',
//     options: ['Cooking', 'Hiking', 'Photography', 'Board games'],
//     answer:  0
//   },
//   {
//     q:       'Where did the proposal happen?',
//     options: ['On a beach', 'At a restaurant', 'In the mountains', 'At home'],
//     answer:  2
//   }
// ];

function initQuiz() {
  const mount = document.getElementById('couple-quiz');
  if (!mount) return;

  const style = document.createElement('style');
  style.textContent = `
    #couple-quiz {
      max-width: 520px; margin: 0 auto;
      font-family: inherit;
    }
    .quiz-progress {
      display: flex; gap: 6px; margin-bottom: 20px;
    }
    .quiz-progress-dot {
      flex: 1; height: 4px; border-radius: 2px;
      background: rgba(255,255,255,0.2); transition: background 0.3s;
    }
    .quiz-progress-dot.done  { background: #D4537E; }
    .quiz-progress-dot.active { background: rgba(255,255,255,0.7); }
    .quiz-question {
      font-size: 1.1rem; font-weight: 600;
      margin-bottom: 18px; line-height: 1.5;
      animation: quizFadeIn 0.3s ease;
    }
    .quiz-options { display: grid; gap: 10px; }
    .quiz-option {
      padding: 12px 18px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.08);
      cursor: pointer; font-size: 0.95rem;
      transition: background 0.2s, border-color 0.2s;
      text-align: left;
    }
    .quiz-option:hover:not(:disabled) {
      background: rgba(255,255,255,0.18);
      border-color: rgba(255,255,255,0.5);
    }
    .quiz-option.correct  { background: rgba(29,158,117,0.4); border-color: #1D9E75; }
    .quiz-option.wrong    { background: rgba(226,75,74,0.35); border-color: #E24B4A; }
    .quiz-option:disabled { cursor: default; }
    .quiz-feedback {
      margin-top: 14px; font-size: 0.9rem; min-height: 24px;
      animation: quizFadeIn 0.2s ease;
    }
    .quiz-next {
      margin-top: 16px; padding: 10px 28px;
      border-radius: 99px; border: none;
      background: #D4537E; color: #fff;
      font-size: 0.95rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .quiz-next:hover { opacity: 0.85; }
    .quiz-result {
      text-align: center; padding: 20px 0;
      animation: quizFadeIn 0.4s ease;
    }
    .quiz-result .score { font-size: 3rem; font-weight: 700; color: #D4537E; }
    .quiz-result .msg   { font-size: 1.05rem; margin-top: 8px; line-height: 1.6; }
    .quiz-restart {
      margin-top: 18px; padding: 10px 28px;
      border-radius: 99px; border: none;
      background: rgba(255,255,255,0.15); color: inherit;
      font-size: 0.9rem; cursor: pointer; transition: background 0.2s;
    }
    .quiz-restart:hover { background: rgba(255,255,255,0.25); }
    @keyframes quizFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
  `;
  document.head.appendChild(style);

  let current = 0;
  let score   = 0;

  function scoreMessage(s, total) {
    if (s === total)      return "Perfect! You really know this couple! 🎉";
    if (s >= total * 0.8) return "Impressive — you know them well! 💕";
    if (s >= total * 0.5) return "Not bad — you've been paying attention! 😊";
    return "Better brush up before the wedding! 😄";
  }

  function render() {
    if (current >= QUIZ_QUESTIONS.length) {
      mount.innerHTML = `
        <div class="quiz-result">
          <div class="score">${score} / ${QUIZ_QUESTIONS.length}</div>
          <div class="msg">${scoreMessage(score, QUIZ_QUESTIONS.length)}</div>
          <button class="quiz-restart">Play again</button>
        </div>
      `;
      mount.querySelector('.quiz-restart').addEventListener('click', () => {
        current = 0; score = 0; render();
      });
      // Burst of particles on completion
      for (let i = 0; i < 30; i++) {
        particles.push(new Particle(Math.random() * window.innerWidth, window.innerHeight));
      }
      return;
    }

    const q = QUIZ_QUESTIONS[current];
    mount.innerHTML = `
      <div class="quiz-progress">
        ${QUIZ_QUESTIONS.map((_, i) => `
          <div class="quiz-progress-dot ${i < current ? 'done' : i === current ? 'active' : ''}"></div>
        `).join('')}
      </div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
      <div class="quiz-feedback"></div>
    `;

    mount.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.dataset.index, 10);
        const correct = chosen === q.answer;
        if (correct) score++;

        // Reveal answers
        mount.querySelectorAll('.quiz-option').forEach((b, i) => {
          b.disabled = true;
          if (i === q.answer) b.classList.add('correct');
          else if (i === chosen && !correct) b.classList.add('wrong');
        });

        const feedback = mount.querySelector('.quiz-feedback');
        feedback.textContent = correct ? '✅ Correct!' : `❌ The answer was: ${q.options[q.answer]}`;

        // Auto-advance after 1.5 s
        setTimeout(() => { current++; render(); }, 1500);
      });
    });
  }

  render();
}

initQuiz();


// ─────────────────────────────────────────────
//  FEATURE 6 — FLOATING WISHES WALL
//  Add <div id="wishes-section"></div> in HTML.
//  Guests type a wish → it floats up the screen.
// ─────────────────────────────────────────────
function initWishesWall() {
  const mount = document.getElementById('wishes-section');
  if (!mount) return;

  const style = document.createElement('style');
  style.textContent = `
    #wishes-section { position: relative; }
    #wishes-form-wrap {
      display: flex; gap: 10px; flex-wrap: wrap;
      justify-content: center; margin-bottom: 20px;
    }
    #wish-input {
      flex: 1; min-width: 220px; max-width: 360px;
      padding: 10px 16px; border-radius: 99px;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: inherit; font-size: 0.95rem; outline: none;
    }
    #wish-input::placeholder { color: rgba(255,255,255,0.45); }
    #wish-input:focus { border-color: rgba(255,255,255,0.6); }
    #wish-send {
      padding: 10px 24px; border-radius: 99px;
      border: none; background: #D4537E; color: #fff;
      font-size: 0.95rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s; white-space: nowrap;
    }
    #wish-send:hover { opacity: 0.85; }
    #wishes-stage {
      position: relative; width: 100%; height: 220px;
      overflow: hidden; pointer-events: none;
    }
    .floating-wish {
      position: absolute; bottom: -40px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px; padding: 8px 16px;
      font-size: 0.88rem; white-space: nowrap;
      max-width: 260px; overflow: hidden;
      text-overflow: ellipsis; color: #fff;
      animation: floatUp var(--dur, 7s) ease-in forwards;
      pointer-events: none;
    }
    @keyframes floatUp {
      0%   { bottom: -40px; opacity: 0; }
      10%  { opacity: 1; }
      80%  { opacity: 1; }
      100% { bottom: 230px; opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  mount.innerHTML = `
    <div id="wishes-form-wrap">
      <input id="wish-input" type="text" maxlength="80"
        placeholder="Leave a wish for the couple… 💌" />
      <button id="wish-send">Send wish ✨</button>
    </div>
    <div id="wishes-stage"></div>
  `;

  const stage  = document.getElementById('wishes-stage');
  const input  = document.getElementById('wish-input');
  const sendBtn = document.getElementById('wish-send');

  // Seed with some starter wishes so the stage isn't empty
  const starters = [
    'Wishing you a lifetime of love! 💑',
    'May every day be as magical as today ✨',
    'Here\'s to forever! 🥂',
    'Congratulations to the most beautiful couple 🌸',
    'Love, laughter and happily ever after 💖',
  ];

  function launchWish(text) {
    const el = document.createElement('div');
    el.className = 'floating-wish';
    el.textContent = text;
    const dur = (Math.random() * 3 + 5).toFixed(1) + 's';
    const left = Math.random() * 70 + 5; // 5–75% from left
    el.style.setProperty('--dur', dur);
    el.style.left = left + '%';
    stage.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // Launch starters staggered
  starters.forEach((w, i) => setTimeout(() => launchWish(w), i * 1200));

  function submit() {
    const text = input.value.trim();
    if (!text) return;
    launchWish(text + ' 💕');
    // Also save to localStorage so wishes persist on reload
    const saved = JSON.parse(localStorage.getItem('wishes') || '[]');
    saved.push({ text, ts: Date.now() });
    localStorage.setItem('wishes', JSON.stringify(saved.slice(-50)));
    input.value = '';
    input.focus();
  }

  sendBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

  // Re-launch saved wishes after starters
  setTimeout(() => {
    const saved = JSON.parse(localStorage.getItem('wishes') || '[]');
    saved.slice(-8).forEach((w, i) =>
      setTimeout(() => launchWish(w.text + ' 💕'), i * 900 + 1000)
    );
  }, starters.length * 1200 + 500);
}

initWishesWall();


// ─────────────────────────────────────────────
//  RSVP FORM  (bug fix: null check)
// ─────────────────────────────────────────────
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(rsvpForm));
    localStorage.setItem('rsvp', JSON.stringify(data));
    alert("🎉 Thank you for RSVPing! We can't wait to celebrate with you! 💕");
    rsvpForm.reset();
  });
}


// ─────────────────────────────────────────────
//  CTA BUTTONS
// ─────────────────────────────────────────────
const heroSection = document.getElementById('hero');
if (heroSection) {
  const rsvpBtn = heroSection.querySelector('.btn-primary');
  if (rsvpBtn) {
    rsvpBtn.addEventListener('click', () => {
      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  const storyBtn = heroSection.querySelector('.btn-secondary');
  if (storyBtn) {
    storyBtn.addEventListener('click', () => {
      document.getElementById('story')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}


// ─────────────────────────────────────────────
//  RESIZE HANDLER
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (canvasFireworks) resizeCanvas(canvasFireworks, ctxFireworks);
  if (canvasParticles) resizeCanvas(canvasParticles, ctxParticles);
  resizeCursorCanvas();
});


// ─────────────────────────────────────────────
//  SMOOTH SCROLL FOR ALL ANCHOR LINKS
// ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});