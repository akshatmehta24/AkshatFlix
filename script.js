/* ========================= */
/* INTRO SCREEN */
/* ========================= */

window.addEventListener("load", () => {

    const intro = document.getElementById("intro");

    setTimeout(() => {

        intro.style.opacity = "0";

        setTimeout(() => {
            intro.style.display = "none";
        }, 800);

    }, 2800);

});

/* ========================= */
/* NAVBAR EFFECT */
/* ========================= */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.style.background =
            "rgba(5,5,5,0.85)";

        navbar.style.backdropFilter =
            "blur(20px)";

        navbar.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.4)";

    } else {

        navbar.style.background =
            "transparent";

        navbar.style.boxShadow =
            "none";
    }

});

/* ========================= */
/* REVEAL ANIMATIONS */
/* ========================= */

const revealElements =
    document.querySelectorAll(".reveal");

const revealObserver =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active");

                }

            });

        },

        {
            threshold: 0.15
        }

    );

revealElements.forEach(el => {

    revealObserver.observe(el);

});

/* ========================= */
/* COUNTER ANIMATIONS */
/* ========================= */

const counters =
    document.querySelectorAll(".counter");

let counterStarted = false;

function runCounters() {

    if (counterStarted) return;

    counterStarted = true;

    counters.forEach(counter => {

        const target =
            +counter.getAttribute("data-target");

        let current = 0;

        const increment =
            target / 80;

        const updateCounter = () => {

            if (current < target) {

                current += increment;

                counter.innerText =
                    Math.ceil(current);

                requestAnimationFrame(
                    updateCounter
                );

            } else {

                counter.innerText =
                    target + "+";
            }

        };

        updateCounter();

    });

}

const statsSection =
    document.querySelector(".stats-section");

const statsObserver =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    runCounters();

                }

            });

        },

        {
            threshold: 0.4
        }

    );

if (statsSection) {

    statsObserver.observe(
        statsSection
    );

}

/* ========================= */
/* PROJECT MODAL */
/* ========================= */

const modal =
    document.getElementById(
        "projectModal"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const modalCategory =
    document.getElementById(
        "modalCategory"
    );

const modalLink =
    document.getElementById(
        "modalLink"
    );

const closeModal =
    document.querySelector(
        ".close-modal"
    );

const cards =
    document.querySelectorAll(
        ".project-card"
    );

cards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const title =
                card.dataset.title ||
                "Project";

            const category =
                card.dataset.category ||
                "Creative Content";

            const link =
                card.dataset.link ||
                "#";

            modalTitle.textContent =
                title;

            modalCategory.textContent =
                category;

            modalLink.href =
                link;

            modal.style.display =
                "flex";

            document.body.style.overflow =
                "hidden";

        }
    );

});

if (closeModal) {

    closeModal.addEventListener(
        "click",
        () => {

            modal.style.display =
                "none";

            document.body.style.overflow =
                "auto";

        }
    );

}

window.addEventListener(
    "click",
    (e) => {

        if (e.target === modal) {

            modal.style.display =
                "none";

            document.body.style.overflow =
                "auto";

        }

    }
);

/* ========================= */
/* ESC CLOSE */
/* ========================= */

document.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "Escape" &&
            modal.style.display === "flex"
        ) {

            modal.style.display =
                "none";

            document.body.style.overflow =
                "auto";

        }

    }
);

/* ========================= */
/* HERO PARALLAX */
/* ========================= */

const heroImage =
    document.querySelector(
        ".hero-image img"
    );

window.addEventListener(
    "scroll",
    () => {

        const scrollY =
            window.scrollY;

        if (heroImage) {

            heroImage.style.transform =
                `translateY(${scrollY * 0.08}px)`;

        }

    }
);

/* ========================= */
/* CARD HOVER DEPTH */
/* ========================= */

cards.forEach(card => {

    card.addEventListener(
        "mousemove",
        (e) => {

            const rect =
                card.getBoundingClientRect();

            const x =
                e.clientX -
                rect.left;

            const y =
                e.clientY -
                rect.top;

            const rotateY =
                ((x / rect.width) - 0.5)
                * 8;

            const rotateX =
                ((y / rect.height) - 0.5)
                * -8;

            card.style.transform =
                `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.05)
                `;
        }
    );

    card.addEventListener(
        "mouseleave",
        () => {

            card.style.transform =
                "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
        }
    );

});

/* ========================= */
/* SMOOTH SECTION SCROLL */
/* ========================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(anchor => {

        anchor.addEventListener(
            "click",
            function (e) {

                const target =
                    document.querySelector(
                        this.getAttribute(
                            "href"
                        )
                    );

                if (target) {

                    e.preventDefault();

                    target.scrollIntoView({

                        behavior: "smooth",
                        block: "start"

                    });

                }

            }
        );

    });

/* ========================= */
/* SUBTLE FLOATING EFFECT */
/* ========================= */

const seasonCards =
    document.querySelectorAll(
        ".season-card"
    );

seasonCards.forEach((card, index) => {

    card.style.animation =
        `floatCard 4s ease-in-out ${index * 0.3}s infinite`;

});

const style =
    document.createElement("style");

style.innerHTML = `

@keyframes floatCard {

0%,100%{
transform:translateY(0);
}

50%{
transform:translateY(-6px);
}

}

`;

document.head.appendChild(style);

/* ========================= */
/* PERFORMANCE OPTIMIZATION */
/* ========================= */

window.addEventListener(
    "pageshow",
    () => {

        document.body.classList.add(
            "loaded"
        );

    }
);
