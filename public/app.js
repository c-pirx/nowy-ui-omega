import { initCalculator } from "./calculator.js";

const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#mobile-navigation");
function closeMenu(returnFocus = false) {
  menu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Otwórz menu");
  document.body.classList.remove("menu-open");
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
  document.body.classList.toggle("menu-open", open);
});
menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (menu.hidden) return;
  if (event.key === "Escape") closeMenu(true);
  if (event.key === "Tab") {
    const links = [...menu.querySelectorAll("a")];
    if (!event.shiftKey && document.activeElement === links.at(-1)) {
      event.preventDefault();
      menuButton.focus();
    } else if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault();
      links.at(-1).focus();
    }
  }
});
const desktop = matchMedia("(min-width: 1024px)");
desktop.addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

// Keep keyboard focus with the section reached through an anchor.
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener("click", () => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }),
);
const navigationLinks = [
  ...document.querySelectorAll(".desktop-nav a, .header-calculator"),
];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) {
        navigationLinks.forEach((link) =>
          link.hash === "#" + entry.target.id
            ? link.setAttribute("aria-current", "location")
            : link.removeAttribute("aria-current"),
        );
      }
  },
  { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
);
navigationLinks.forEach((link) => {
  const target = document.querySelector(link.hash);
  if (target) sectionObserver.observe(target);
});

const logos = document.getElementById("client-logos");
const prev = document.getElementById("clients-prev");
const next = document.getElementById("clients-next");
function updateCarousel() {
  prev.disabled = logos.scrollLeft < 4;
  next.disabled = logos.scrollLeft + logos.clientWidth >= logos.scrollWidth - 4;
}
function slide(direction) {
  logos.scrollBy({
    left: (direction * logos.clientWidth) / (innerWidth < 768 ? 2 : 4),
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}
prev.addEventListener("click", () => slide(-1));
next.addEventListener("click", () => slide(1));
logos.addEventListener("scroll", updateCarousel, { passive: true });
new ResizeObserver(updateCarousel).observe(logos);
updateCarousel();

// Original C.I.K. content in an accessible, keyboard-operated inline panel.
const certificateButton = document.getElementById("load-certification");
certificateButton.addEventListener("click", () => {
  const holder = document.getElementById("certification-widget");
  const open = holder.hidden;
  holder.hidden = !open;
  certificateButton.setAttribute("aria-expanded", String(open));
  certificateButton.textContent = open
    ? "Ukryj certyfikat"
    : "Pokaż certyfikat";
});

initCalculator();

// One quiet entrance per element. Content stays visible if motion is unsupported.
function initEntranceMotion() {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if (
    reducedMotion.matches ||
    !Element.prototype.animate ||
    !window.IntersectionObserver
  ) return;

  const animations = new Map();
  const revealGroups = new Map();
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

  function reveal(element, delay = 0, portrait = false) {
    if (reducedMotion.matches || element.contains(document.activeElement)) return;
    const animation = element.animate(
      [
        { opacity: portrait ? 0.45 : 0, transform: `translateY(${portrait ? 8 : 14}px)` },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: portrait ? 780 : 620, delay, easing, fill: "backwards" },
    );
    animations.set(element, animation);
    const cleanup = () => animations.delete(element);
    animation.addEventListener("finish", cleanup, { once: true });
    animation.addEventListener("cancel", cleanup, { once: true });
  }

  // Keep the header immediately usable; give the opening composition a soft rhythm.
  const hero = document.querySelector(".hero");
  if (hero && scrollY < 80 && (!location.hash || location.hash === "#start")) {
    [".eyebrow", "h1", ".hero-intro", ".hero-actions", ".hero-contact"].forEach(
      (selector, index) => {
        const element = hero.querySelector(selector);
        if (element?.getClientRects().length) reveal(element, index * 45);
      },
    );
    const portrait = hero.querySelector(".hero-portrait");
    if (portrait) reveal(portrait, 65, true);
  }

  function register(selector, stagger = 0) {
    document.querySelectorAll(selector).forEach((element, index) => {
      revealGroups.set(element, stagger ? (index % 2) * stagger : 0);
    });
  }

  register(".about-identity, .about-story", 85);
  register(".section-heading, .full-services-heading, .why-intro");
  register(".service-feature", 85);
  register(".full-services article", 55);
  register(".why-list li", 45);
  register(".calculator-intro, .clients-heading, .contact-top");
  register(".client-logos, .contact-grid > div", 65);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        // A small look-ahead starts the reveal just before an element enters view.
        if (entry.boundingClientRect.bottom > 0) {
          reveal(entry.target, revealGroups.get(entry.target));
        }
        revealGroups.delete(entry.target);
      });
    },
    { rootMargin: "0px 0px 48px 0px", threshold: 0 },
  );
  revealGroups.forEach((_, element) => observer.observe(element));

  function finishMotion() {
    observer.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    revealGroups.clear();
  }

  // Keyboard focus must never land on a fading or delayed control.
  document.addEventListener("focusin", (event) => {
    animations.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
    revealGroups.forEach((_, element) => {
      if (element.contains(event.target)) {
        observer.unobserve(element);
        revealGroups.delete(element);
      }
    });
  });
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) finishMotion();
  });
  window.addEventListener("beforeprint", finishMotion);
  window.addEventListener("pagehide", finishMotion, { once: true });
}

initEntranceMotion();
