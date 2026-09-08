import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { initNavigation } from "../public/navigation.js";

const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
function setup(t, mutate = () => {}) {
  const dom = new JSDOM(html, { url: "https://c-pirx.github.io/nowy-ui-omega/" });
  t.after(() => dom.window.close());
  const media = new dom.window.EventTarget();
  dom.window.matchMedia = () => media;
  const observed = [];
  const observers = [];
  dom.window.IntersectionObserver = class {
    constructor(callback) { observers.push(callback); }
    observe(element) { observed.push(element.id); }
  };
  const doc = dom.window.document;
  mutate(doc);
  initNavigation(doc);
  const key = (element, value, shiftKey = false) => element.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true }),
  );
  return { doc, media, observed, observers, key };
}

test("dropdowns open with arrows, move focus, and close with Escape", (t) => {
  const { doc, key } = setup(t);
  const button = doc.querySelector('[aria-controls="desktop-services"]');
  const panel = doc.getElementById("desktop-services");
  const links = [...panel.querySelectorAll("a")];
  button.focus();
  key(button, "ArrowDown");
  assert.equal(panel.hidden, false);
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.equal(doc.activeElement, links[0]);
  key(links[0], "End");
  assert.equal(doc.activeElement, links.at(-1));
  key(links.at(-1), "ArrowDown");
  assert.equal(doc.activeElement, links[0]);
  key(links[0], "Escape");
  assert.equal(panel.hidden, true);
  assert.equal(button.getAttribute("aria-expanded"), "false");
  assert.equal(doc.activeElement, button);
});

test("only one dropdown opens; leaving it by focus or outside click closes it", (t) => {
  const { doc } = setup(t);
  const services = doc.querySelector('[aria-controls="desktop-services"]');
  const shop = doc.querySelector('[aria-controls="desktop-shop"]');
  services.click();
  shop.click();
  assert.equal(doc.getElementById("desktop-services").hidden, true);
  assert.equal(doc.getElementById("desktop-shop").hidden, false);
  shop.focus();
  doc.querySelector('.desktop-nav > a[href="baza-wiedzy"]').focus();
  assert.equal(doc.getElementById("desktop-shop").hidden, true);
  services.click();
  doc.querySelector("h1").click();
  assert.equal(doc.getElementById("desktop-services").hidden, true);
});

test("mobile menu supports nested disclosures, focus wrapping, and two-step Escape", (t) => {
  const { doc, key } = setup(t);
  const toggle = doc.querySelector(".menu-toggle");
  const menu = doc.getElementById("mobile-navigation");
  toggle.click();
  assert.equal(menu.hidden, false);
  assert.equal(doc.activeElement, menu.querySelector("a"));
  assert.equal(doc.body.classList.contains("menu-open"), true);
  const services = doc.querySelector('[aria-controls="mobile-services"]');
  services.click();
  key(services, "Escape");
  assert.equal(doc.getElementById("mobile-services").hidden, true);
  assert.equal(menu.hidden, false);
  const last = menu.querySelector(".mobile-phone");
  last.focus();
  key(last, "Tab");
  assert.equal(doc.activeElement, doc.querySelector(".brand"));
  key(doc.activeElement, "Tab", true);
  assert.equal(doc.activeElement, last);
  key(last, "Escape");
  assert.equal(menu.hidden, true);
  assert.equal(doc.activeElement, toggle);
  assert.equal(doc.body.classList.contains("menu-open"), false);
});

test("calculator/contact anchor navigation closes mobile menu and focuses original section", (t) => {
  const { doc } = setup(t);
  for (const hash of ["#kalkulator", "#kontakt"]) {
    doc.querySelector(".menu-toggle").click();
    doc.querySelector(`#mobile-navigation a[href="${hash}"]`).click();
    assert.equal(doc.getElementById("mobile-navigation").hidden, true);
    assert.equal(doc.activeElement, doc.querySelector(hash));
    assert.equal(doc.body.classList.contains("menu-open"), false);
  }
});

test("switching viewport closes mobile menu and all nested panels", (t) => {
  const { doc, media } = setup(t);
  doc.querySelector(".menu-toggle").click();
  doc.querySelector('[aria-controls="mobile-shop"]').click();
  media.dispatchEvent(new doc.defaultView.Event("change"));
  assert.equal(doc.getElementById("mobile-navigation").hidden, true);
  assert.equal(doc.getElementById("mobile-shop").hidden, true);
  assert.equal(doc.body.classList.contains("menu-open"), false);
});

test("future links preserve the Pages prefix, match between menus, and do not break section tracking", (t) => {
  const { doc, observed } = setup(t);
  const futureLinks = (selector) => [...doc.querySelectorAll(`${selector} a`)]
    .filter((link) => !link.hash && link.protocol === "https:");
  const desktop = futureLinks(".desktop-nav");
  const mobile = futureLinks(".mobile-nav");
  assert.equal(desktop.length, 12);
  assert.deepEqual(desktop.map((link) => link.href), mobile.map((link) => link.href));
  for (const link of desktop) {
    assert.ok(link.pathname.startsWith("/nowy-ui-omega/"));
    assert.ok(!link.pathname.includes("#"));
  }
  assert.ok(observed.includes("kalkulator"));
  assert.ok(observed.includes("kontakt"));
  assert.ok(observed.includes("opinie"));
});

test("WordPress absolute same-page anchors keep focus management and section tracking", (t) => {
  const site = "https://c-pirx.github.io/nowy-ui-omega/";
  const { doc, observers } = setup(t, (d) => {
    for (const link of d.querySelectorAll('a[href^="#"]')) link.setAttribute("href", site + link.getAttribute("href"));
    // Header link as rendered on a subpage: another pathname, so not a same-page anchor.
    d.querySelector('.desktop-nav a[href$="#kontakt"]').setAttribute("href", `${site}o-mnie/#kontakt`);
  });
  const anchor = doc.querySelector('.desktop-nav a[href$="#kalkulator"]');
  const subpageLink = doc.querySelector('.desktop-nav a[href$="#kontakt"]');
  anchor.click();
  assert.equal(doc.activeElement, doc.getElementById("kalkulator"));
  observers[0]([{ isIntersecting: true, target: doc.getElementById("kalkulator") }]);
  assert.equal(anchor.getAttribute("aria-current"), "location");
  observers[0]([{ isIntersecting: true, target: doc.getElementById("kontakt") }]);
  assert.equal(anchor.getAttribute("aria-current"), null);
  assert.equal(subpageLink.getAttribute("aria-current"), null);
});
