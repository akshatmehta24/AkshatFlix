/* ============================================================ */
/* AKSHATFLIX — Apple-Style Scroll Animation Engine             */
/* ============================================================ */

/* ========================= */
/* INTRO SCREEN              */
/* ========================= */

window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  setTimeout(() => {
    intro.classList.add("hidden");
    setTimeout(() => {
      intro.style.display = "none";
      // Trigger hero entrance after intro
      runHeroEntrance();
    }, 900);
  }, 2600);
});

/* ========================= */
/* HERO ENTRANCE ANIMATION   */
/* (runs once after intro)   */
/* ========================= */

function runHeroEntrance() {
  const eyebrow = document.getElementById("heroEyebrow");
  const name    = document.getElementById("heroName");
  const role    = document.getElementById("heroRole");
  const desc    = document.getElementById("heroDesc");
  const btns    = document.getElementById("heroBtns");
  const imgWrap = document.getElementById("heroImgWrap");
  const cue     = document.getElementById("scrollCue");

  const items = [eyebrow, name, role, desc, btns];
  items.forEach((el, i) => {
    if (!el) return;
    el.style.opacity   = "0";
    el.style.transform = "translateY(30px)";
    el.style.filter    = "blur(8px)";
    el.style.transition = `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${i*0.1}s,
                           transform 0.9s cubic-bezier(0.22,1,0.36,1) ${i*0.1}s,
                           filter 0.9s ease ${i*0.1}s`;
    requestAnimationFrame(() => {
      el.style.opacity   = "1";
      el.style.transform = "translateY(0)";
      el.style.filter    = "blur(0px)";
    });
  });

  if (imgWrap) {
    imgWrap.style.opacity   = "0";
    imgWrap.style.transform = "translateX(60px) scale(0.92)";
    imgWrap.style.filter    = "blur(12px)";
    imgWrap.style.transition = "opacity 1.1s cubic-bezier(0.22,1,0.36,1) 0.3s, transform 1.1s cubic-bezier(0.22,1,0.36,1) 0.3s, filter 1s ease 0.3s";
    requestAnimationFrame(() => {
      imgWrap.style.opacity   = "1";
      imgWrap.style.transform = "translateX(0) scale(1)";
      imgWrap.style.filter    = "blur(0px)";
    });
  }

  if (cue) {
    setTimeout(() => {
      cue.style.opacity    = "0";
      cue.style.transition = "opacity 0.8s ease";
      requestAnimationFrame(() => { cue.style.opacity = "1"; });
    }, 1200);
  }
}

/* ========================= */
/* NAVBAR                    */
/* ========================= */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

/* ========================= */
/* SCROLL PROGRESS BAR       */
/* ========================= */

const progressBar = document.getElementById("progress-bar");

window.addEventListener("scroll", () => {
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = pct + "%";
}, { passive: true });

/* ========================= */
/* HAMBURGER MENU            */
/* ========================= */

const hamburger = document.getElementById("hamburger");
const navEl     = document.querySelector("nav");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navEl.classList.toggle("open");
  document.body.style.overflow = navEl.classList.contains("open") ? "hidden" : "";
});

navEl.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navEl.classList.remove("open");
    document.body.style.overflow = "";
  });
});

/* ========================= */
/* SMOOTH ANCHOR SCROLL      */
/* ========================= */

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", function(e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* ========================= */
/* HERO — STICKY SCROLL-OUT  */
/* Apple cinematic parallax  */
/* ========================= */

const heroContent  = document.querySelector(".hero-content");
const heroImgWrap  = document.getElementById("heroImgWrap");
const heroPinWrap  = document.querySelector(".hero-pin-wrap");
const scrollCue    = document.getElementById("scrollCue");

function updateHeroScroll() {
  if (!heroPinWrap) return;

  const heroH      = window.innerHeight;
  const totalScroll = heroPinWrap.offsetHeight - heroH;
  const scrolled   = Math.min(Math.max(window.scrollY, 0), totalScroll);
  const progress   = scrolled / totalScroll; // 0 → 1

  const ep = easeInOut(progress);

  /* Content: fade up and blur out */
  if (heroContent) {
    const t = Math.min(1, ep * 1.4);
    heroContent.style.opacity   = `${1 - t}`;
    heroContent.style.transform = `translateY(${-ep * 100}px)`;
    heroContent.style.filter    = `blur(${ep * 10}px)`;
  }

  /* Image: slower parallax, scale out, fade */
  if (heroImgWrap) {
    const imgT = Math.min(1, ep * 1.1);
    heroImgWrap.style.opacity   = `${1 - imgT * 0.9}`;
    heroImgWrap.style.transform = `translateY(${scrolled * 0.18}px) scale(${1 - progress * 0.18})`;
    heroImgWrap.style.filter    = `blur(${ep * 6}px)`;
  }

  /* Scroll cue: fades out immediately */
  if (scrollCue) {
    scrollCue.style.opacity = `${1 - Math.min(1, progress * 6)}`;
  }
}

/* ========================= */
/* EASING FUNCTIONS          */
/* ========================= */

function easeOut(t)   { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

/* ========================= */
/* ONE-SHOT TRIGGER SET      */
/* ========================= */

const triggered = new Set();

/* ========================= */
/* STAT COUNTER ANIMATION    */
/* ========================= */

let countersDone = false;

function runCounters() {
  if (countersDone) return;
  countersDone = true;
  document.querySelectorAll(".counter").forEach(counter => {
    const target = +counter.getAttribute("data-target");
    let current  = 0;
    const steps  = 70;
    const inc    = target / steps;
    const tick   = () => {
      current += inc;
      if (current < target) {
        counter.innerText = Math.ceil(current);
        requestAnimationFrame(tick);
      } else {
        counter.innerText = target;
      }
    };
    tick();
  });
}

/* ========================= */
/* MAIN SCROLL ENGINE        */
/* ========================= */

function onScroll() {
  const vh = window.innerHeight;

  /* Hero parallax */
  updateHeroScroll();

  /* ── STAT CARDS ── stagger up */
  document.querySelectorAll(".stat").forEach((el, i) => {
    if (triggered.has(el)) return;
    if (el.getBoundingClientRect().top < vh * 0.88) {
      setTimeout(() => {
        el.style.transition = `opacity 0.75s cubic-bezier(0.22,1,0.36,1),
                               transform 0.75s cubic-bezier(0.22,1,0.36,1)`;
        el.style.opacity   = "1";
        el.style.transform = "translateY(0)";
      }, i * 80);
      triggered.add(el);
      runCounters();
    }
  });

  /* ── SECTION HEADERS ── slide from left */
  document.querySelectorAll(".section-header h2").forEach(el => {
    if (triggered.has(el)) return;
    if (el.getBoundingClientRect().top < vh * 0.88) {
      el.style.transition = "opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1)";
      el.style.opacity   = "1";
      el.style.transform = "translateX(0)";
      triggered.add(el);
    }
  });

  /* ── PROJECT CARDS ── staggered cascade */
  document.querySelectorAll(".project-card").forEach((el, i) => {
    if (triggered.has(el)) return;
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && r.left < window.innerWidth * 1.1) {
      setTimeout(() => {
        el.style.transition = `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${(i%3)*0.08}s,
                               transform 0.65s cubic-bezier(0.22,1,0.36,1) ${(i%3)*0.08}s`;
        el.style.opacity   = "1";
        el.style.transform = "translateY(0) scale(1)";
      }, (i % 3) * 80);
      triggered.add(el);
    }
  });

  /* ── EPISODE CARDS ── slide from left with stagger */
  document.querySelectorAll(".episode-card").forEach((el, i) => {
    if (triggered.has(el)) return;
    if (el.getBoundingClientRect().top < vh * 0.88) {
      setTimeout(() => {
        el.style.transition = "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)";
        el.style.opacity   = "1";
        el.style.transform = "translateX(0)";
      }, i * 120);
      triggered.add(el);
    }
  });

  /* ── SEASONS HEADER ── */
  const seasonsHeader = document.querySelector(".seasons-header");
  if (seasonsHeader && !triggered.has(seasonsHeader)) {
    if (seasonsHeader.getBoundingClientRect().top < vh * 0.88) {
      seasonsHeader.style.transition = "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)";
      seasonsHeader.style.opacity   = "1";
      seasonsHeader.style.transform = "translateY(0)";
      triggered.add(seasonsHeader);
    }
  }

  /* ── STACK PILLS ── pop in */
  document.querySelectorAll(".stack-grid span").forEach((el, i) => {
    if (triggered.has(el)) return;
    if (el.getBoundingClientRect().top < vh * 0.92) {
      setTimeout(() => {
        el.style.transition = `opacity 0.5s cubic-bezier(0.34,1.56,0.64,1),
                               transform 0.5s cubic-bezier(0.34,1.56,0.64,1)`;
        el.style.opacity   = "1";
        el.style.transform = "scale(1) translateY(0)";
      }, i * 55);
      triggered.add(el);
    }
  });

  /* ── ACHIEVEMENT CARDS ── scale in */
  document.querySelectorAll(".achievement-card").forEach((el, i) => {
    if (triggered.has(el)) return;
    if (el.getBoundingClientRect().top < vh * 0.9) {
      setTimeout(() => {
        el.style.transition = `opacity 0.7s cubic-bezier(0.34,1.2,0.64,1),
                               transform 0.7s cubic-bezier(0.34,1.2,0.64,1)`;
        el.style.opacity   = "1";
        el.style.transform = "scale(1) translateY(0)";
      }, i * 140);
      triggered.add(el);
    }
  });

  /* ── SKILLS HEADER ── */
  const skillH2 = document.querySelector(".skills-section h2");
  if (skillH2 && !triggered.has(skillH2)) {
    if (skillH2.getBoundingClientRect().top < vh * 0.88) {
      skillH2.style.transition = "opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1)";
      skillH2.style.opacity   = "1";
      skillH2.style.transform = "translateX(0)";
      triggered.add(skillH2);
    }
  }

  /* ── SKILL FILLS ── */
  const skillsSection = document.querySelector(".skills-section");
  if (skillsSection && !triggered.has(skillsSection)) {
    if (skillsSection.getBoundingClientRect().top < vh * 0.88) {
      document.querySelectorAll(".skill-fill").forEach(fill => {
        fill.style.width = fill.getAttribute("data-width") + "%";
      });
      triggered.add(skillsSection);
    }
  }

  /* ── ABOUT PARAGRAPH ── */
  const aboutP = document.querySelector(".about p");
  if (aboutP && !triggered.has(aboutP)) {
    if (aboutP.getBoundingClientRect().top < vh * 0.88) {
      aboutP.style.transition = "opacity 1.1s ease, transform 1.1s ease";
      aboutP.style.opacity   = "1";
      aboutP.style.transform = "translateY(0)";
      triggered.add(aboutP);
    }
  }

  /* ── CONTACT ── zoom in */
  const contactInner = document.querySelector(".contact-inner");
  if (contactInner && !triggered.has(contactInner)) {
    if (contactInner.getBoundingClientRect().top < vh * 0.88) {
      contactInner.style.transition = "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)";
      contactInner.style.opacity   = "1";
      contactInner.style.transform = "translateY(0) scale(1)";
      triggered.add(contactInner);
    }
  }
}

/* ========================= */
/* PROJECT MODAL             */
/* ========================= */

const modal         = document.getElementById("projectModal");
const modalTitle    = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalLink     = document.getElementById("modalLink");

document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("click", () => {
    modalTitle.textContent    = card.dataset.title    || "Project";
    modalCategory.textContent = card.dataset.category || "Creative Content";
    modalLink.href            = card.dataset.link     || "#";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

function closeModalFn() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelector(".close-modal")?.addEventListener("click", closeModalFn);
document.querySelector(".modal-backdrop")?.addEventListener("click", closeModalFn);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModalFn();
});

/* ========================= */
/* CARD 3D MAGNETIC HOVER    */
/* ========================= */

document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
    card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(1.06)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
  });
  card.addEventListener("mouseenter", () => {
    card.style.transition = "transform 0.1s ease";
  });
});

/* ========================= */
/* FLOATING CARD ANIMATION   */
/* ========================= */

const floatStyle = document.createElement("style");
floatStyle.innerHTML = `
@keyframes floatCard {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
}`;
document.head.appendChild(floatStyle);

document.querySelectorAll(".season-card").forEach((card, i) => {
  card.style.animation = `floatCard 4s ease-in-out ${i * 0.3}s infinite`;
});

/* ========================= */
/* RAF SCROLL LOOP           */
/* ========================= */

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
/* INIT ON DOM READY         */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {
  onScroll(); // Seed initial positions
});

window.addEventListener("pageshow", () => {
  document.body.classList.add("loaded");
});
