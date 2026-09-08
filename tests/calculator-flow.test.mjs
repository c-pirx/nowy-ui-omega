import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { JSDOM } from "jsdom";
import { initCalculator, ORIGINAL_RULES } from "../public/calculator.js";

const html = await fs.readFile(
  new URL("../public/index.html", import.meta.url),
  "utf8",
);
const settle = () => new Promise((resolve) => setTimeout(resolve, 5));

function setup(
  t,
  {
    url = "https://quote.example/",
    backend = true,
    policyAccepted = true,
    response,
  } = {},
) {
  const dom = new JSDOM(html, { url });
  for (const [name, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
  })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, {
      value,
      configurable: true,
      writable: true,
    });
    t.after(() =>
      descriptor
        ? Object.defineProperty(globalThis, name, descriptor)
        : delete globalThis[name],
    );
  }
  t.after(() => dom.window.close());
  if (backend) {
    dom.window.OmegaKalkData = {
      rules: ORIGINAL_RULES,
      nonce: "test-only",
      ajax_url: "/wp-admin/admin-ajax.php",
    };
    dom.window.OmegaMGConfirmation = { enabled: true };
  }
  const requests = [];
  t.mock.method(globalThis, "fetch", async (endpoint, options) => {
    requests.push({ endpoint, options });
    return response
      ? response(options)
      : { ok: true, json: async () => ({ success: true }) };
  });
  const { form, contact } = initCalculator();
  const field = (suffix) =>
    dom.window.document.getElementById(`omega-kalk-${suffix}`);
  field("policy").checked = policyAccepted;
  const submit = (target) =>
    target.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true }),
    );
  const fillContact = () => {
    field("confirm").click();
    field("imie").value = "Anna";
    field("telefon").value = "123456789";
    field("email").value = "anna@example.test";
    field("privacy").checked = true;
    field("wiadomosc").value =
      "Proszę o kontakt po 15.\nRozpoczynam działalność.";
  };
  return { dom, form, contact, field, submit, fillContact, requests };
}

test("privacy acknowledgement is unchecked by default, required for calculation, and separate from contact consent", (t) => {
  const { form, field, submit, requests } = setup(t, { policyAccepted: false });
  assert.equal(field("policy").defaultChecked, false);
  assert.equal(field("policy").required, true);
  assert.equal(
    field("policy").closest("label").querySelector("a").href,
    "https://omega-mg.pl/polityka-prywatnosci/",
  );
  submit(form);
  assert.equal(field("result").hidden, true);
  assert.equal(field("policy").getAttribute("aria-invalid"), "true");
  assert.equal(document.activeElement, field("policy"));
  field("policy").click();
  assert.equal(field("policy").getAttribute("aria-invalid"), "false");
  submit(form);
  assert.equal(field("result").hidden, false);
  assert.equal(field("privacy").checked, false);
  assert.equal(requests.length, 0);
  field("edit").click();
  form.reset();
  assert.equal(field("policy").checked, false);
});

test("anonymous quote shows a monthly indicative price before asking for contact, with zero requests", (t) => {
  const { form, contact, field, submit, requests } = setup(t);
  assert.equal(contact.hidden, true);
  assert.equal(form.querySelectorAll("[autocomplete]").length, 0);
  field("rodzaj").value = "PELNA";
  field("pracUoz").value = "1";
  submit(form);
  assert.match(
    field("kwota").textContent.replaceAll("\u00a0", " "),
    /^od 650 zł$/,
  );
  assert.match(field("result").textContent, /netto\/mies\./);
  assert.match(field("result").textContent, /orientacyjna wycena/);
  assert.equal(form.hidden, true);
  assert.equal(field("result").hidden, false);
  assert.equal(contact.hidden, true);
  assert.equal(field("privacy").checked, false);
  assert.equal(field("imie").getAttribute("aria-invalid"), null);
  assert.equal(document.activeElement, field("result"));
  assert.equal(requests.length, 0);
  field("confirm").click();
  assert.equal(contact.hidden, false);
  assert.equal(document.activeElement, field("imie"));
  assert.equal(requests.length, 0);
});

test("only explicit confirmation sends the reviewed inputs, price and optional message; successful sends cannot repeat", async (t) => {
  const { form, contact, field, submit, fillContact, requests } = setup(t);
  field("rodzaj").value = "KPIR";
  field("dokumenty").value = "30";
  field("pracUop").value = "2";
  field("pracUoz").value = "1";
  field("vat").checked = true;
  field("eksport").checked = true;
  submit(form);
  fillContact();
  assert.equal(requests.length, 0);
  submit(contact);
  submit(contact);
  await settle();
  assert.equal(requests.length, 1);
  const values = Object.fromEntries(requests[0].options.body);
  assert.deepEqual(
    Object.fromEntries(
      [
        "forma",
        "rodzaj",
        "dokumenty",
        "pracUop",
        "pracUoz",
        "vat",
        "eksport",
        "total",
      ].map((key) => [key, values[key]]),
    ),
    {
      forma: "JDG",
      rodzaj: "KPIR",
      dokumenty: "30",
      pracUop: "2",
      pracUoz: "1",
      vat: "1",
      eksport: "1",
      total: "870",
    },
  );
  assert.equal(values.wiadomosc, field("wiadomosc").value);
  assert.equal(values.omega_redesign_confirmation, "1");
  assert.equal(values.action, "omega_kalk_lead");
  assert.equal(values.privacy, "1");
  assert.equal(field("contact-status").dataset.state, "success");
  assert.equal(field("send").disabled, true);
  submit(contact);
  assert.equal(requests.length, 1);
});

test("contact validation happens only at confirmation and leaves the result visible", async (t) => {
  const { form, contact, field, submit, requests } = setup(t);
  submit(form);
  field("confirm").click();
  submit(contact);
  await settle();
  assert.equal(requests.length, 0);
  assert.equal(field("imie").getAttribute("aria-invalid"), "true");
  assert.equal(field("privacy").getAttribute("aria-invalid"), "true");
  assert.equal(field("result").hidden, false);
  assert.equal(document.activeElement, field("imie"));
});

test("edit preserves business data, invalidates the old quote and reset restores all defaults", async (t) => {
  const { dom, form, contact, field, submit, fillContact, requests } = setup(t);
  field("forma").value = "SPOLKA_ZOO";
  field("forma").dispatchEvent(
    new dom.window.Event("change", { bubbles: true }),
  );
  field("dokumenty").value = "30";
  submit(form);
  fillContact();
  field("edit").click();
  assert.equal(form.hidden, false);
  assert.equal(field("dokumenty").value, "30");
  assert.equal(contact.hidden, true);
  assert.equal(field("result").hidden, true);
  submit(contact);
  assert.equal(requests.length, 0);
  form.reset();
  await settle();
  assert.equal(field("forma").value, "JDG");
  assert.equal(field("rodzaj").value, "RYCZALT");
  assert.ok([...field("rodzaj").options].every((option) => !option.disabled));
  assert.equal(field("dokumenty").value, "0");
  assert.equal(field("imie").value, "");
  assert.equal(field("wiadomosc").value, "");
  assert.equal(field("privacy").checked, false);
});

test("invalid document counts prevent calculation without requesting personal data", (t) => {
  const { form, field, submit, requests } = setup(t);
  field("dokumenty").value = "-1";
  submit(form);
  assert.equal(field("result").hidden, true);
  assert.equal(field("dokumenty").getAttribute("aria-invalid"), "true");
  assert.equal(field("imie").getAttribute("aria-invalid"), null);
  assert.equal(requests.length, 0);
});

test("local and GitHub Pages previews calculate but never send or claim delivery", async (t) => {
  const { form, contact, field, submit, fillContact, requests } = setup(t, {
    url: "https://example.github.io/omega/",
    backend: false,
  });
  submit(form);
  assert.equal(field("result").hidden, false);
  fillContact();
  submit(contact);
  await settle();
  assert.equal(requests.length, 0);
  assert.equal(field("contact-status").dataset.state, "preview");
  assert.match(field("contact-status").textContent, /nie zostały wysłane/);
});

test("localhost never sends even with WordPress configuration", async (t) => {
  const { form, contact, submit, fillContact, requests } = setup(t, {
    url: "http://localhost:4173/",
  });
  submit(form);
  fillContact();
  submit(contact);
  await settle();
  assert.equal(requests.length, 0);
});

test("missing mail adapter and foreign endpoints cannot silently discard a message", async (t) => {
  const { dom, form, contact, field, submit, fillContact, requests } = setup(t);
  submit(form);
  fillContact();
  dom.window.OmegaMGConfirmation.enabled = false;
  submit(contact);
  await settle();
  assert.equal(requests.length, 0);
  assert.equal(field("contact-status").dataset.state, "error");
  dom.window.OmegaMGConfirmation.enabled = true;
  dom.window.OmegaKalkData.ajax_url = "https://unrelated.example/";
  submit(contact);
  await settle();
  assert.equal(requests.length, 0);
});

test("server rejection keeps the quote and message available for retry and restores the SVG button", async (t) => {
  const { form, contact, field, submit, fillContact } = setup(t, {
    response: () => ({ ok: false, json: async () => ({ success: false }) }),
  });
  submit(form);
  fillContact();
  submit(contact);
  await settle();
  assert.equal(field("contact-status").dataset.state, "error");
  assert.equal(field("result").hidden, false);
  assert.match(field("wiadomosc").value, /Proszę o kontakt/);
  assert.equal(field("send").disabled, false);
  assert.ok(field("send").querySelector("svg.arrow-icon"));
});

test("all decorative arrows use non-focusable SVG paths instead of emoji-capable characters", (t) => {
  const { dom } = setup(t);
  assert.doesNotMatch(dom.window.document.body.textContent, /[↗→←↓↑↘]/u);
  const arrows = [...document.querySelectorAll("svg.arrow-icon")];
  assert.ok(arrows.length >= 20);
  for (const arrow of arrows) {
    assert.equal(arrow.getAttribute("aria-hidden"), "true");
    assert.equal(arrow.getAttribute("focusable"), "false");
    assert.ok(arrow.querySelector("path"));
  }
  assert.equal(
    document.getElementById("clients-prev").getAttribute("aria-label"),
    "Poprzednie logotypy",
  );
});
