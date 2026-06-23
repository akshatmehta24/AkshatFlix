/* ================================================= */
/* AKSHATFLIX — Premium Apple-style scroll engine    */
/* All 7 changes applied                             */
/* ================================================= */

const isMobile = () => window.innerWidth <= 768;

/* ========================= */
/* CHANGE 7: INTRO SCREEN    */
/* Clean fade, no overlap    */
/* ========================= */

window.addEventListener("load", () => {
    const intro = document.getElementById("intro");
    if (!intro) return;

    // Wait 2.6s then cleanly fade out
    setTimeout(() => {
        intro.classList.add("hide");
        // Remove from DOM after transition so it can't overlap
        setTimeout(() => {
            intro.style.display = "none";
        }, 700);
    }, 2600);
});

/* ========================= */
/* SMOOTH NAVBAR             */
/* ========================= */

const navbar = document.getElementById("navbar");

function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
}

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

/* ========================= */
/* SCROLL PROGRESS BAR       */
/* ========================= */

const progressBar = document.getElementById("progress-bar");
function updateProgress() {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });

/* ========================= */
/* COUNTER ANIMATIONS        */
/* ========================= */

const counters = document.querySelectorAll(".counter");
let countersDone = false;

function runCounters() {
    if (countersDone) return;
    countersDone = true;
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;
        const tick = () => {
            current = Math.min(current + step, target);
            counter.textContent = Math.ceil(current);
            if (current < target) requestAnimationFrame(tick);
            else counter.textContent = target + "+";
        };
        tick();
    });
}

/* ========================= */
/* INTERSECTION OBSERVER     */
/* Apple-style stagger reveals */
/* ========================= */

function reveal(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        // Stagger children if data-stagger set
        const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;

        setTimeout(() => {
            el.classList.add("revealed");
            // Trigger skill bars
            if (el.classList.contains("skill-item")) {
                const fill = el.querySelector(".skill-fill");
                if (fill) fill.style.width = fill.getAttribute("data-width") + "%";
            }
        }, delay);

        observer.unobserve(el);
    });
}

const observerOpts = {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
};

const io = new IntersectionObserver(reveal, observerOpts);

// Stats — stagger each card
document.querySelectorAll(".stat").forEach((el, i) => {
    el.dataset.delay = i * 80;
    io.observe(el);
});

// Counter trigger
const statsSection = document.querySelector(".stats-section");
if (statsSection) {
    const counterObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { runCounters(); counterObs.disconnect(); }
    }, { threshold: 0.2 });
    counterObs.observe(statsSection);
}

// Section headers
document.querySelectorAll(".section-header h2, .section-label").forEach(el => io.observe(el));

// Project cards — stagger within each row
document.querySelectorAll(".content-row").forEach(row => {
    row.querySelectorAll(".project-card").forEach((card, i) => {
        card.dataset.delay = i * 100;
        io.observe(card);
    });
});

// Episode cards — stagger
document.querySelectorAll(".episode-card").forEach((el, i) => {
    el.dataset.delay = i * 120;
    io.observe(el);
});

// Stack pills — stagger with spring
document.querySelectorAll(".stack-grid span").forEach((el, i) => {
    el.dataset.delay = i * 55;
    io.observe(el);
});

// Achievement cards
document.querySelectorAll(".achievement-card").forEach((el, i) => {
    el.dataset.delay = i * 120;
    io.observe(el);
});

// Skill items
document.querySelectorAll(".skill-item").forEach((el, i) => {
    el.dataset.delay = i * 100;
    io.observe(el);
});

// About
document.querySelectorAll(".about h2, .about p").forEach(el => io.observe(el));

// Contact
document.querySelectorAll(".contact-section h2, .contact-section p, .contact-buttons").forEach(el => io.observe(el));

/* ========================= */
/* CHANGE 6: HERO PARALLAX   */
/* Apple zoom + parallax     */
/* Desktop only              */
/* ========================= */

const heroContent  = document.querySelector(".hero-content");
const heroImageEl  = document.querySelector(".hero-image img");
const heroImageWrap = document.querySelector(".hero-image");

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

let rafPending = false;

function onScroll() {
    if (!isMobile()) {
        heroParallax();
    }
    updateNavbar();
    updateProgress();
}

function heroParallax() {
    if (!heroContent || !heroImageEl) return;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const progress = Math.min(1, scrollY / (vh * 0.75));
    const ep = easeOut(progress);

    // Content: elegant fade up (Apple style — subtle, not dramatic)
    heroContent.style.opacity    = `${1 - ep * 0.9}`;
    heroContent.style.transform  = `translateY(${-ep * 50}px)`;

    // Image: slow parallax down + gentle scale
    heroImageEl.style.transform = `translateY(${scrollY * 0.12}px) scale(${1 - progress * 0.08})`;
    heroImageEl.style.opacity   = `${1 - progress * 0.5}`;
}

window.addEventListener("scroll", () => {
    if (!rafPending) {
        requestAnimationFrame(() => {
            onScroll();
            rafPending = false;
        });
        rafPending = true;
    }
}, { passive: true });

/* ========================= */
/* CHANGE 6: 3D MOUSE GLOW   */
/* Netflix cinematic effect  */
/* ========================= */

const heroSection = document.querySelector(".hero");

if (heroSection && !isMobile()) {
    heroSection.addEventListener("mousemove", (e) => {
        if (!heroImageWrap) return;
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top)  / rect.height;

        const rotateY =  (x - 0.5) * 14;
        const rotateX = -(y - 0.5) * 10;

        heroImageEl.style.transform =
            `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

        // Move the glow pseudo-element via CSS custom properties
        heroImageWrap.style.setProperty('--gx', `${x * 100}%`);
        heroImageWrap.style.setProperty('--gy', `${y * 100}%`);
    });

    heroSection.addEventListener("mouseleave", () => {
        if (!heroImageEl) return;
        heroImageEl.style.transition = "transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease";
        heroImageEl.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
        setTimeout(() => {
            if (heroImageEl) heroImageEl.style.transition = "";
        }, 800);
    });
}

/* ========================= */
/* MODAL                     */
/* ========================= */

const modal       = document.getElementById("projectModal");
const modalTitle  = document.getElementById("modalTitle");
const modalCat    = document.getElementById("modalCategory");
const modalLink   = document.getElementById("modalLink");
const closeModal  = document.querySelector(".close-modal");

document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
        if (modalTitle) modalTitle.textContent  = card.dataset.title    || "Project";
        if (modalCat)   modalCat.textContent    = card.dataset.category || "Creative Content";
        if (modalLink)  modalLink.href          = card.dataset.link     || "#";
        if (modal)      modal.style.display     = "flex";
        document.body.style.overflow = "hidden";
    });
});

function closeModalFn() {
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "auto";
}

if (closeModal) closeModal.addEventListener("click", closeModalFn);
window.addEventListener("click", e => { if (e.target === modal) closeModalFn(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModalFn(); });

/* ========================= */
/* HAMBURGER MENU            */
/* ========================= */

const hamburger = document.getElementById("hamburger");
const navMenu   = document.querySelector("nav");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("open");
        navMenu.classList.toggle("open");
        document.body.style.overflow = navMenu.classList.contains("open") ? "hidden" : "";
    });

    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("open");
            navMenu.classList.remove("open");
            document.body.style.overflow = "";
        });
    });
}

/* ========================= */
/* SMOOTH ANCHOR SCROLL      */
/* ========================= */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            e.preventDefault();
            const offset = navbar ? navbar.offsetHeight + 20 : 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
    });
});

/* ========================= */
/* FLOATING SEASON CARDS     */
/* ========================= */

const seasonCards = document.querySelectorAll(".season-card");
if (seasonCards.length) {
    const floatStyle = document.createElement("style");
    floatStyle.textContent = `
        @keyframes floatCard {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
    `;
    document.head.appendChild(floatStyle);
    seasonCards.forEach((card, i) => {
        card.style.animation = `floatCard 4s ease-in-out ${i * 0.3}s infinite`;
    });
}

/* ========================= */
/* MOBILE: ensure revealed   */
/* ========================= */

if (isMobile()) {
    // On mobile all elements should be visible — override any leftover opacity:0
    document.querySelectorAll(
        ".stat, .section-header h2, .section-label, .project-card, " +
        ".episode-card, .stack-grid span, .achievement-card, " +
        ".skill-item, .about h2, .about p, " +
        ".contact-section h2, .contact-section p, .contact-buttons"
    ).forEach(el => {
        el.classList.add("revealed");
        // trigger skill bars too
        if (el.classList.contains("skill-item")) {
            const fill = el.querySelector(".skill-fill");
            if (fill) fill.style.width = fill.getAttribute("data-width") + "%";
        }
    });

    // Run counters immediately on mobile
    runCounters();
}
