/* ================================================= */
/* AKSHATFLIX — Premium Apple-style scroll engine    */
/* All 7 changes applied                             */
/* ================================================= */

const isMobile = () => window.innerWidth <= 768;

/* ========================= */
/* INTRO SCREEN */
/* ========================= */

window.addEventListener("load", () => {
    const intro = document.getElementById("intro");
    setTimeout(() => {
        intro.style.opacity = "0";
        setTimeout(() => { intro.style.display = "none"; }, 800);
    }, 2800);
});

/* ========================= */
/* NAVBAR EFFECT */
/* ========================= */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.style.background = "rgba(5,5,5,0.85)";
        navbar.style.backdropFilter = "blur(20px)";
        navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,.4)";
    } else {
        navbar.style.background = "transparent";
        navbar.style.boxShadow = "none";
    }
});

/* ========================= */
/* COUNTER ANIMATIONS */
/* ========================= */

const counters = document.querySelectorAll(".counter");
let counterStarted = false;

function runCounters() {
    if (counterStarted) return;
    counterStarted = true;
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        let current = 0;
        const increment = target / 80;
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target + "+";
            }
        };
        updateCounter();
    });
}

const statsSection = document.querySelector(".stats-section");
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) runCounters(); });
}, { threshold: 0.2 });
if (statsSection) statsObserver.observe(statsSection);

/* ========================= */
/* PROJECT MODAL */
/* ========================= */

const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalLink = document.getElementById("modalLink");
const closeModal = document.querySelector(".close-modal");
const cards = document.querySelectorAll(".project-card");

cards.forEach(card => {
    card.addEventListener("click", () => {
        modalTitle.textContent = card.dataset.title || "Project";
        modalCategory.textContent = card.dataset.category || "Creative Content";
        modalLink.href = card.dataset.link || "#";
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });
});

if (closeModal) {
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    });
}

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
});

/* ========================= */
/* HAMBURGER MENU */
/* ========================= */

const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector("nav");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("open");
});

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navMenu.classList.remove("open");
    });
});

/* ========================= */
/* SKILLS ANIMATION */
/* ========================= */

const skillFills = document.querySelectorAll(".skill-fill");
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            skillFills.forEach(fill => {
                fill.style.width = fill.getAttribute("data-width") + "%";
            });
        }
    });
}, { threshold: 0.3 });
const skillsSection = document.querySelector(".skills-section");
if (skillsSection) skillObserver.observe(skillsSection);

/* ========================= */
/* SCROLL PROGRESS BAR */
/* ========================= */

const progressBar = document.getElementById("progress-bar");
window.addEventListener("scroll", () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = scrolled + "%";
});

/* =========================================== */
/* APPLE-STYLE SCROLL-DRIVEN ANIMATIONS        */
/* Everything below is tied to scroll position */
/* =========================================== */

/* Helper: get how far an element is through the viewport (0 → 1) */
function getScrollProgress(el, start = 0.15, end = 0.85) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const raw = 1 - (rect.top / (vh * end));
    return Math.min(1, Math.max(0, raw));
}

/* ── 1. HERO SECTION ── cinematic scroll-out */
const heroContent = document.querySelector(".hero-content");
const heroImage   = document.querySelector(".hero-image img");
const heroTag     = document.querySelector(".hero-tag");
const heroH1      = document.querySelector(".hero h1");
const heroH2      = document.querySelector(".hero h2");
const heroP       = document.querySelector(".hero p");
const heroBtns    = document.querySelector(".hero-buttons");

/* ── 2. STATS — stagger in from below */
const statCards = document.querySelectorAll(".stat");

/* ── 3. SECTION HEADERS — slide-in from left */
const sectionHeaders = document.querySelectorAll(".section-header h2");

/* ── 4. PROJECT CARDS — staggered cascade */
const projectCards = document.querySelectorAll(".project-card");

/* ── 5. EPISODE CARDS — slide from left */
const episodeCards = document.querySelectorAll(".episode-card");

/* ── 6. STACK PILLS — pop in */
const stackPills = document.querySelectorAll(".stack-grid span");

/* ── 7. ACHIEVEMENT CARDS — scale in */
const achievementCards = document.querySelectorAll(".achievement-card");

/* ── 8. ABOUT TEXT — word-level reveal */
const aboutParagraph = document.querySelector(".about p");

/* ── 9. CONTACT — dramatic zoom */
const contactSection = document.querySelector(".contact-section");
const contactH2      = document.querySelector(".contact-section h2");
const contactBtns    = document.querySelector(".contact-buttons");

/* ========================= */
/* INITIAL STATE SETUP       */
/* ========================= */

function initScrollStates() {
    /* Hero elements — set will-change for GPU compositing */
    [heroTag, heroH1, heroH2, heroP, heroBtns].forEach(el => {
        if (el) el.style.willChange = "opacity, transform";
    });
    if (heroImage) heroImage.style.willChange = "transform, opacity";

    /* Stat cards */
    statCards.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = `translateY(60px)`;
        el.style.transition = "none";
        el.style.willChange = "opacity, transform";
    });

    /* Section headers */
    sectionHeaders.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateX(-60px)";
        el.style.willChange = "opacity, transform";
    });

    /* Project cards */
    projectCards.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(50px) scale(0.92)";
        el.style.willChange = "opacity, transform";
    });

    /* Episode cards */
    episodeCards.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateX(-80px)";
        el.style.willChange = "opacity, transform";
    });

    /* Stack pills */
    stackPills.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "scale(0.6) translateY(20px)";
        el.style.willChange = "opacity, transform";
    });

    /* Achievement cards */
    achievementCards.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "scale(0.8) translateY(30px)";
        el.style.willChange = "opacity, transform";
    });

    /* About paragraph */
    if (aboutParagraph) {
        aboutParagraph.style.opacity = "0";
        aboutParagraph.style.transform = "translateY(30px)";
        aboutParagraph.style.willChange = "opacity, transform";
    }

    /* Contact */
    if (contactH2) {
        contactH2.style.opacity = "0";
        contactH2.style.transform = "scale(0.85) translateY(40px)";
        contactH2.style.willChange = "opacity, transform";
    }
    if (contactBtns) {
        contactBtns.style.opacity = "0";
        contactBtns.style.transform = "translateY(30px)";
        contactBtns.style.willChange = "opacity, transform";
    }
}

/* ========================= */
/* EASING FUNCTIONS          */
/* ========================= */

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

/* ========================= */
/* SCROLL ANIMATION ENGINE   */
/* ========================= */

const triggered = new Set(); // one-shot animations

function onScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    /* ── HERO: scroll-out parallax as user scrolls down ── */
    if (heroContent && heroImage) {
        const heroProgress = Math.min(1, scrollY / (vh * 0.7));
        const ep = easeInOut(heroProgress);

        /* Content floats up and fades */
        if (heroContent) {
            heroContent.style.opacity    = `${1 - ep * 1.2}`;
            heroContent.style.transform  = `translateY(${-ep * 80}px)`;
        }

        /* Individual hero children stagger on scroll-out */
        const heroChildren = [heroTag, heroH1, heroH2, heroP, heroBtns];
        heroChildren.forEach((el, i) => {
            if (!el) return;
            const delay = i * 0.06;
            const localP = Math.max(0, ep - delay);
            el.style.opacity   = `${1 - localP * 2}`;
            el.style.transform = `translateY(${-localP * 60}px)`;
        });

        /* Profile image — slower parallax + slight scale */
        heroImage.style.transform = `translateY(${scrollY * 0.12}px) scale(${1 - heroProgress * 0.08})`;
        heroImage.style.opacity   = `${1 - heroProgress * 0.6}`;
    }

    /* ── STAT CARDS: stagger in from bottom ── */
    statCards.forEach((el, i) => {
        if (triggered.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.88) {
            const delay = i * 90;
            setTimeout(() => {
                el.style.transition = "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)";
                el.style.opacity   = "1";
                el.style.transform = "translateY(0)";
            }, delay);
            triggered.add(el);
        }
    });

    /* ── SECTION HEADERS: slide in from left ── */
    sectionHeaders.forEach(el => {
        if (triggered.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.85) {
            el.style.transition = "opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1)";
            el.style.opacity   = "1";
            el.style.transform = "translateX(0)";
            triggered.add(el);
        }
    });

    /* ── PROJECT CARDS: cascade in ── */
    projectCards.forEach((el, i) => {
        if (triggered.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.left < window.innerWidth * 1.1 && rect.top < vh * 0.92) {
            const delay = (i % 3) * 100;
            setTimeout(() => {
                el.style.transition = "opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1)";
                el.style.opacity   = "1";
                el.style.transform = "translateY(0) scale(1)";
            }, delay);
            triggered.add(el);
        }
    });

    /* ── EPISODE CARDS: slide in from left with stagger ── */
    episodeCards.forEach((el, i) => {
        if (triggered.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.85) {
            setTimeout(() => {
                el.style.transition = "opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1)";
                el.style.opacity   = "1";
                el.style.transform = "translateX(0)";
            }, i * 130);
            triggered.add(el);
        }
    });

    /* ── STACK PILLS: pop in with stagger ── */
    stackPills.forEach((el, i) => {
        if (triggered.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.9) {
            setTimeout(() => {
                el.style.transition = "opacity 0.5s cubic-bezier(.34,1.56,.64,1), transform 0.5s cubic-bezier(.34,1.56,.64,1)";
                el.style.opacity   = "1";
                el.style.transform = "scale(1) translateY(0)";
            }, i * 60);
            triggered.add(el);
        }
    });

    /* ── ACHIEVEMENT CARDS: scale up ── */
    achievementCards.forEach((el, i) => {
        if (triggered.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.88) {
            setTimeout(() => {
                el.style.transition = "opacity 0.7s cubic-bezier(.34,1.2,.64,1), transform 0.7s cubic-bezier(.34,1.2,.64,1)";
                el.style.opacity   = "1";
                el.style.transform = "scale(1) translateY(0)";
            }, i * 150);
            triggered.add(el);
        }
    });

    /* ── ABOUT PARAGRAPH ── */
    if (aboutParagraph && !triggered.has(aboutParagraph)) {
        const rect = aboutParagraph.getBoundingClientRect();
        if (rect.top < vh * 0.85) {
            aboutParagraph.style.transition = "opacity 1s ease, transform 1s ease";
            aboutParagraph.style.opacity    = "1";
            aboutParagraph.style.transform  = "translateY(0)";
            triggered.add(aboutParagraph);
        }
    }

    /* ── CONTACT SECTION: dramatic zoom-in ── */
    if (contactH2 && !triggered.has(contactH2)) {
        const rect = contactH2.getBoundingClientRect();
        if (rect.top < vh * 0.85) {
            contactH2.style.transition = "opacity 1s cubic-bezier(.22,1,.36,1), transform 1s cubic-bezier(.22,1,.36,1)";
            contactH2.style.opacity    = "1";
            contactH2.style.transform  = "scale(1) translateY(0)";
            triggered.add(contactH2);

            if (contactBtns) {
                setTimeout(() => {
                    contactBtns.style.transition = "opacity 0.8s ease, transform 0.8s ease";
                    contactBtns.style.opacity    = "1";
                    contactBtns.style.transform  = "translateY(0)";
                }, 300);
            }
        }
    }
}

/* ========================= */
/* SMOOTH SECTION SCROLL     */
/* ========================= */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

/* ========================= */
/* CARD HOVER DEPTH (3D)     */
/* ========================= */

cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = ((y / rect.height) - 0.5) * -8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
});

/* ========================= */
/* FLOATING SEASON CARDS     */
/* ========================= */

const seasonCards = document.querySelectorAll(".season-card");
seasonCards.forEach((card, index) => {
    card.style.animation = `floatCard 4s ease-in-out ${index * 0.3}s infinite`;
});

const floatStyle = document.createElement("style");
floatStyle.innerHTML = `
@keyframes floatCard {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
`;
document.head.appendChild(floatStyle);

/* ========================= */
/* PERFORMANCE               */
/* ========================= */

window.addEventListener("pageshow", () => {
    document.body.classList.add("loaded");
});

/* ========================= */
/* INIT + RAF LOOP           */
/* ========================= */

initScrollStates();

/* Run immediately once so above-fold elements render correctly */
window.addEventListener("DOMContentLoaded", () => {
    onScroll();
});

/* Passive scroll listener for performance */
let ticking = false;
window.addEventListener("scroll", () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            onScroll();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

/* ========================= */
/* PARTICLE BACKGROUND       */
/* ========================= */

(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, mouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = 120;
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(random) {
      this.x  = random ? Math.random() * W : (Math.random() < 0.5 ? -10 : W + 10);
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2.2 + 0.5;
      const roll = Math.random();
      this.color = roll < 0.35 ? '#E50914'
                 : roll < 0.55 ? '#ff3b45'
                 : roll < 0.70 ? '#ff6b6b'
                 : '#ffffff';
      this.baseAlpha = Math.random() * 0.6 + 0.15;
      this.alpha = this.baseAlpha;
      this.life = 1;
      this.decay = Math.random() * 0.0008 + 0.0002;
    }
    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influence = 140;
      if (dist < influence && dist > 0) {
        const force = (influence - dist) / influence;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 0.18;
        this.vy += Math.sin(angle) * force * 0.18;
        this.alpha = Math.min(1, this.baseAlpha + force * 0.7);
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.04;
      }
      this.vx *= 0.97;
      this.vy *= 0.97;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      if (this.x < -20 || this.x > W + 20 ||
          this.y < -20 || this.y > H + 20 || this.life <= 0) {
        this.reset(false);
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha * this.life;
      if (this.color !== '#ffffff') {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 4;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function drawConnections() {
    const maxDist = 90;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const opacity = (1 - d / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(229,9,20,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    if (mouse.x > 0) {
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
      grd.addColorStop(0, 'rgba(229,9,20,0.07)');
      grd.addColorStop(1, 'rgba(229,9,20,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
      ctx.fill();
    }

    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  resize();
  initParticles();
  loop();

  window.addEventListener('resize', () => { resize(); initParticles(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
})();

/* ========================= */
/* MAGNETIC CURSOR           */
/* ========================= */

(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (!dot || !ring) return;

  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;
  let dotX   = mouseX;
  let dotY   = mouseY;

  // Track raw mouse position
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Smooth animation loop
  function animateCursor() {
    // Dot follows tightly
    dotX += (mouseX - dotX) * 0.18;
    dotY += (mouseY - dotY) * 0.18;

    // Ring follows with more lag
    ringX += (mouseX - ringX) * 0.10;
    ringY += (mouseY - ringY) * 0.10;

    dot.style.left  = dotX + 'px';
    dot.style.top   = dotY + 'px';
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // ── MAGNETIC PULL on buttons ──
  const magnetTargets = document.querySelectorAll(
    '.btn-primary, .btn-secondary, .hamburger, nav a'
  );

  magnetTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });

    el.addEventListener('mousemove', e => {
      const rect   = el.getBoundingClientRect();
      const elCX   = rect.left + rect.width  / 2;
      const elCY   = rect.top  + rect.height / 2;
      const dx     = e.clientX - elCX;
      const dy     = e.clientY - elCY;

      // Pull element toward cursor slightly
      el.style.transform    = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
      el.style.transition   = 'transform 0.15s ease';

      // Pull cursor dot toward element center
      mouseX = elCX + dx * 0.6;
      mouseY = elCY + dy * 0.6;
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      // Snap element back
      el.style.transform  = 'translate(0, 0)';
      el.style.transition = 'transform 0.4s cubic-bezier(.22,1,.36,1)';
    });
  });

  // ── CARD hover state ──
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-card');
    });
    card.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-card');
    });
  });

  // ── Hide cursor when leaving window ──
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // ── Click pulse effect ──
  window.addEventListener('mousedown', () => {
    ring.style.transform = 'translate(-50%, -50%) scale(0.75)';
  });
  window.addEventListener('mouseup', () => {
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
  });

})();

/* ========================= */
/* HORIZONTAL SCROLL ENGINE  */
/* ========================= */

(function () {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const sections = [
    { outer: 'trending',  track: 'track-trending',  dots: 'dots-trending'  },
    { outer: 'ai',        track: 'track-ai',        dots: 'dots-ai'        },
    { outer: 'marketing', track: 'track-marketing', dots: 'dots-marketing' },
  ];

  sections.forEach(({ outer, track, dots }) => {
    const outerEl = document.getElementById(outer);
    const trackEl = document.getElementById(track);
    const dotsEl  = document.getElementById(dots);
    if (!outerEl || !trackEl) return;

    const dotEls = dotsEl ? dotsEl.querySelectorAll('.h-scroll-dot') : [];

    // Total horizontal distance to travel
    const totalScroll = trackEl.scrollWidth - window.innerWidth * 0.84;

    // Give the outer element enough height so scrolling through it
    // takes long enough to see all cards (1.5x multiplier feels natural)
    const scrollHeight = window.innerHeight + totalScroll * 1.5;
    outerEl.style.height = scrollHeight + 'px';

    let currentX = 0;

    function update() {
      const rect     = outerEl.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (scrollHeight - window.innerHeight)));

      const targetX  = -(progress * totalScroll);

      // Smooth lerp
      currentX += (targetX - currentX) * 0.12;

      trackEl.style.transform = `translateX(${currentX}px)`;

      // Update progress dots
      if (dotEls.length) {
        const cardIndex = Math.round(progress * (dotEls.length - 1));
        dotEls.forEach((dot, i) => {
          dot.classList.toggle('active', i === cardIndex);
        });
      }

      requestAnimationFrame(update);
    }

    update();
  });
})();
