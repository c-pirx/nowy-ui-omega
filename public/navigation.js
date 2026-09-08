// Static, semantic markup can later be rendered by a WordPress menu walker.
// This module only manages disclosures, mobile navigation and anchor focus.
export function initNavigation(doc = document) {
  const win = doc.defaultView;
  const header = doc.querySelector(".site-header");
  if (!header) return;
  const menuButton = header.querySelector(".menu-toggle");
  const menu = header.querySelector("#mobile-navigation");
  const desktop = win.matchMedia("(min-width: 1024px)");
  const dropdowns = [...header.querySelectorAll(".nav-dropdown")].map((item) => ({
    item,
    button: item.querySelector(".nav-disclosure"),
    panel: item.querySelector(".nav-submenu"),
  }));

  function setDropdown(dropdown, open) {
    dropdown.button.setAttribute("aria-expanded", String(open));
    dropdown.panel.hidden = !open;
  }

  function closeDropdowns(except) {
    dropdowns.forEach((dropdown) => {
      if (dropdown !== except) setDropdown(dropdown, false);
    });
  }

  function closeMenu(returnFocus = false) {
    closeDropdowns();
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Otwórz menu");
    doc.body.classList.remove("menu-open");
    if (returnFocus) menuButton.focus();
  }

  dropdowns.forEach((dropdown) => {
    const { item, button, panel } = dropdown;
    const links = [...panel.querySelectorAll("a")];
    function openDropdown() {
      closeDropdowns(dropdown);
      setDropdown(dropdown, true);
    }
    button.addEventListener("click", () => {
      if (panel.hidden) openDropdown();
      else setDropdown(dropdown, false);
    });
    item.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      if (event.target === button) {
        if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
        openDropdown();
        event.preventDefault();
        (event.key === "ArrowDown" ? links[0] : links.at(-1)).focus();
        return;
      }
      const index = links.indexOf(doc.activeElement);
      if (index < 0 || panel.hidden) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0
        : event.key === "End" ? links.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next].focus();
    });
    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) setDropdown(dropdown, false);
    });
  });

  menuButton.addEventListener("click", () => {
    if (!menu.hidden) return closeMenu(true);
    closeDropdowns();
    menu.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Zamknij menu");
    doc.body.classList.add("menu-open");
    menu.querySelector("a").focus();
  });

  header.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  doc.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
    else if (!event.target.closest(".nav-dropdown")) closeDropdowns();
  });
  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const open = dropdowns.find(({ panel }) => !panel.hidden);
      if (open) {
        event.preventDefault();
        setDropdown(open, false);
        open.button.focus();
      } else if (!menu.hidden) {
        event.preventDefault();
        closeMenu(true);
      }
    }
    if (event.key === "Tab" && !menu.hidden) {
      // Include expanded submenu controls, excluding everything hidden on mobile.
      const controls = [...header.querySelectorAll("a, button")].filter(
        (control) => !control.closest("[hidden], .desktop-nav"),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    }
  });
  desktop.addEventListener("change", () => closeMenu());
  win.addEventListener("pagehide", () => closeMenu());

  // Preserve homepage anchor behavior, including links outside the header.
  doc.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const target = doc.getElementById(link.hash.slice(1));
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  });

  // Future page links have no hash: never pass an empty selector to querySelector.
  const anchors = [...header.querySelectorAll('a[href^="#"]')];
  if (win.IntersectionObserver) {
    const observer = new win.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        anchors.forEach((link) => {
          if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    doc.querySelectorAll("main > section[id]").forEach((section) => observer.observe(section));
  }
}
