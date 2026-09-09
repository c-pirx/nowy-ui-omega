import { initCalculator } from "./calculator.js";
import { initNavigation } from "./navigation.js";

initNavigation();

const logos = document.getElementById("client-logos");
const prev = document.getElementById("clients-prev");
const next = document.getElementById("clients-next");
if (logos && prev && next) {
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
  if (window.ResizeObserver) new ResizeObserver(updateCarousel).observe(logos);
  updateCarousel();
}

// Original C.I.K. content in an accessible, keyboard-operated inline panel.
const certificateButton = document.getElementById("load-certification");
const certificateHolder = document.getElementById("certification-widget");
if (certificateButton && certificateHolder) {
  certificateButton.addEventListener("click", () => {
    const open = certificateHolder.hidden;
    certificateHolder.hidden = !open;
    certificateButton.setAttribute("aria-expanded", String(open));
    certificateButton.textContent = open
      ? "Ukryj certyfikat"
      : "Pokaż certyfikat";
  });
}

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
  // Baza wiedzy (WordPress): selektory bez trafień na statycznej stronie są nieszkodliwe.
  register(".kb-heading, .kb-toolbar, .kb-hero, .kb-cover, .kb-cta-inner > div");
  register(".kb-card", 55);
  register(".kb-adjacent > div, .kb-cta-actions", 65);
  register(".om-hero-heading, .om-portrait, .om-hero-body", 45);
  register(".om-story, .om-section-heading, .om-centered, .om-photo, .om-cta-inner");
  register(".om-proof-grid article, .om-timeline li, .om-education-grid article, .om-specialty-grid article, .om-principles-grid article", 55);

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
