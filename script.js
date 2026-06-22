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
        heroImage.style.transform = `translateY(${scrollY * 0.15}px) scale(${1 - heroProgress * 0.25})`;
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
