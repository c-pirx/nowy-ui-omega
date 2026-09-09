import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { buildAboutPage } from "../scripts/build-about.mjs";
import { initNavigation } from "../public/navigation.js";
import { initCalculator } from "../public/calculator.js";

const root = new URL("../", import.meta.url);
const read = file => readFile(new URL(file, root), "utf8");
const html = await read("public/o-mnie/index.html");
const home = await read("public/index.html");
const app = await read("public/app.js");

test("about page resolves assets, navigation and CTA targets beneath a deployment prefix", async t => {
  const dom = new JSDOM(html, { url: "https://example.com/nowy-ui-omega/o-mnie/" });
  t.after(() => dom.window.close());
  const doc = dom.window.document;
  const homeDoc = new JSDOM(home).window.document;
  t.after(() => homeDoc.defaultView.close());
  assert.equal(doc.querySelectorAll("main > section").length, 9);
  assert.equal(doc.querySelectorAll("h1").length, 1);
  assert.equal(new Set([...doc.querySelectorAll("[id]")].map(el => el.id)).size, doc.querySelectorAll("[id]").length);
  assert.equal(doc.querySelectorAll('header [aria-current="page"]').length, 2);
  assert.equal(doc.querySelector('.skip-link').getAttribute("href"), "#content");
  for (const link of doc.querySelectorAll("a[href]")) {
    if (link.origin !== dom.window.location.origin) continue;
    assert.ok(link.pathname.startsWith("/nowy-ui-omega/"), link.href);
    if (link.hash && link.hash !== "#content") {
      assert.equal(link.pathname, "/nowy-ui-omega/");
      assert.ok(homeDoc.getElementById(link.hash.slice(1)), `Missing target ${link.hash}`);
    }
  }
  for (const el of doc.querySelectorAll("img[src], script[src], link[rel='stylesheet'], link[rel='icon']")) {
    const url = new URL(el.src || el.href);
    assert.ok(url.pathname.startsWith("/nowy-ui-omega/"), url.href);
    await stat(new URL("public/" + url.pathname.replace("/nowy-ui-omega/", ""), root));
  }
  for (const el of doc.querySelectorAll("img[srcset]")) {
    for (const item of el.srcset.split(",")) {
      const path = new URL(item.trim().split(/\s+/)[0], dom.window.location.href).pathname;
      assert.ok(path.startsWith("/nowy-ui-omega/assets/"));
      await stat(new URL("public/" + path.replace("/nowy-ui-omega/", ""), root));
    }
  }
});

test("shared scripts run on a subpage without homepage widgets; mobile menu and certificate still work", t => {
  const dom = new JSDOM(html, { url: "https://example.com/o-mnie/", runScripts: "outside-only" });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.matchMedia = () => Object.assign(new window.EventTarget(), { matches: true });
  window.initNavigation = () => initNavigation(window.document);
  // Calculator has its own no-form guard. Run its real initializer in the page context.
  window.initCalculator = window.eval(`(${initCalculator.toString()})`);
  assert.doesNotThrow(() => window.eval(app.replace(/^import .*;\r?\n/gm, "")));
  const menuButton = window.document.querySelector(".menu-toggle");
  menuButton.click();
  assert.equal(menuButton.getAttribute("aria-expanded"), "true");
  menuButton.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(menuButton.getAttribute("aria-expanded"), "false");
  const button = window.document.querySelector("#load-certification");
  button.click();
  assert.equal(window.document.querySelector("#certification-widget").hidden, false);
  button.click();
  assert.equal(window.document.querySelector("#certification-widget").hidden, true);
  // Also support a shell without the certification panel.
  button.remove();
  window.document.querySelector("#certification-widget").remove();
  assert.doesNotThrow(() => window.eval(`(() => { ${app.replace(/^import .*;\r?\n/gm, "")} })()`));
});

test("about builder is repeatable and takes header/footer changes from the homepage source", async t => {
  const scratch = await mkdtemp(join(tmpdir(), "omega-about-build-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const theme = join(scratch, "theme");
  await Promise.all([mkdir(join(scratch, "pages")), mkdir(join(scratch, "public")), mkdir(join(theme, "assets", "css"), { recursive: true })]);
  await writeFile(join(scratch, "pages", "o-mnie.html"), await read("pages/o-mnie.html"));
  await writeFile(join(scratch, "public", "o-mnie.css"), await read("public/o-mnie.css"));
  const homeHtml = home.replace("</header>", "<!-- shared header update --></header>").replace("</footer>", "<!-- shared footer update --></footer>");
  const options = { root: scratch, theme, homeHtml, rewriteMarkup: value => value };
  await buildAboutPage(options);
  const first = await readFile(join(scratch, "public", "o-mnie", "index.html"), "utf8");
  await buildAboutPage(options);
  assert.equal(await readFile(join(scratch, "public", "o-mnie", "index.html"), "utf8"), first);
  assert.match(first, /shared header update/);
  assert.match(first, /shared footer update/);
  const wp = await read("app/public/wp-content/themes/omega/page-o-mnie.php");
  assert.match(wp, /get_header\(\)/);
  assert.match(wp, /home_url\( '\/#kalkulator' \)/);
  assert.match(wp, /get_theme_file_uri\( '\/assets\/om-office-light\.jpg' \)/);
  assert.doesNotMatch(wp, /(?:src|href)="(?:\.\.\/|assets\/|#kalkulator)/);
});
