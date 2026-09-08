/** Pricing and payload follow the public Omega Kalkulator 1.0.3 source. */
export const ORIGINAL_RULES = Object.freeze({
  base: {
    JDG: { RYCZALT: 150, KPIR: 250, PELNA: 600 },
    SPOLKA_ZOO: { RYCZALT: 200, KPIR: 350, PELNA: 900 },
  },
  documents: [
    { max: 10, price_per_doc: 0 },
    { max: 30, price_per_doc: 8 },
    { max: 60, price_per_doc: 6 },
    { max: 120, price_per_doc: 5 },
    { max: null, price_per_doc: 4 },
  ],
  employees: { UOP: 80, UOZ: 50 },
  surcharges: { VAT: 100, EXPORT: 150 },
  minimums: { RYCZALT: 150, KPIR: 250, PELNA: 600 },
});

function count(value) {
  const parsed = Number.parseInt(value || "0", 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function selected(value) {
  return value === true || value === 1 || value === "1";
}

function validRules(rules) {
  return Boolean(
    rules?.base &&
      Array.isArray(rules.documents) &&
      rules.documents.length &&
      rules.employees &&
      rules.surcharges &&
      rules.minimums,
  );
}

/** The document tier applies to every billable document, after 10 free documents. */
export function calculateQuote(values, rules = ORIGINAL_RULES) {
  if (!validRules(rules)) throw new Error("Brak aktualnych zasad wyceny.");
  const inputs = {
    forma: values.forma === "SPOLKA_ZOO" ? "SPOLKA_ZOO" : "JDG",
    rodzaj: values.rodzaj || "RYCZALT",
    dokumenty: count(values.dokumenty),
    pracUop: count(values.pracUop),
    pracUoz: count(values.pracUoz),
    vat: selected(values.vat),
    eksport: selected(values.eksport),
  };
  if (inputs.forma === "SPOLKA_ZOO") inputs.rodzaj = "PELNA";
  if (!Object.hasOwn(rules.base[inputs.forma] || {}, inputs.rodzaj)) {
    throw new Error("Wybrany rodzaj księgowości jest niedostępny.");
  }
  const tier = rules.documents.find(
    ({ max }) =>
      max === null ||
      max === "" ||
      max === undefined ||
      inputs.dokumenty <= Number.parseInt(max, 10),
  );
  const perDoc = Number.parseFloat(tier?.price_per_doc) || 0;
  const base = Number.parseFloat(rules.base[inputs.forma][inputs.rodzaj]) || 0;
  const docsCost = perDoc * Math.max(0, inputs.dokumenty - 10);
  const uopCost =
    inputs.pracUop * (Number.parseFloat(rules.employees.UOP) || 0);
  const uozCost =
    inputs.pracUoz * (Number.parseFloat(rules.employees.UOZ) || 0);
  const vatCost = inputs.vat ? Number.parseFloat(rules.surcharges.VAT) || 0 : 0;
  const exportCost = inputs.eksport
    ? Number.parseFloat(rules.surcharges.EXPORT) || 0
    : 0;
  const minimum = Number.parseFloat(rules.minimums[inputs.rodzaj]) || 0;
  const total = Math.max(
    base + docsCost + uopCost + uozCost + vatCost + exportCost,
    minimum,
  );
  return {
    total,
    base,
    docsCost,
    uopCost,
    uozCost,
    vatCost,
    exportCost,
    minimum,
    perDoc,
    inputs,
  };
}

const CONFIG_ERROR =
  "Kalkulator jest chwilowo niedostępny. Skontaktuj się z biurem pod numerem +48 505 448 081.";
const formatPLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

export function initCalculator() {
  const field = (suffix) => document.getElementById(`omega-kalk-${suffix}`);
  const form = field("form");
  if (!form || form.dataset.calculatorInitialized) return null;
  const contact = field("contact");
  const result = field("result");
  const status = field("status");
  const contactStatus = field("contact-status");
  const send = field("send");
  const confirm = field("confirm");
  const edit = field("edit");
  if (
    !contact ||
    !result ||
    !status ||
    !contactStatus ||
    !send ||
    !confirm ||
    !edit
  )
    return null;
  form.dataset.calculatorInitialized = "true";
  const config = () => window.OmegaKalkData || {};
  const isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const numericFields = ["dokumenty", "pracUop", "pracUoz"];
  const contactFields = ["imie", "telefon", "email", "wiadomosc", "privacy"];
  const initialSendNodes = [...send.childNodes];
  const defaultSelectValue = (select) =>
    [...select.options].find((option) => option.defaultSelected)?.value ||
    select.options[0]?.value;
  const defaultForma = defaultSelectValue(field("forma"));
  const defaultRodzaj = defaultSelectValue(field("rodzaj"));
  let quote = null;
  let busy = false;
  let sent = false;

  function setStatus(text, state = "") {
    for (const region of [status, contactStatus]) {
      region.textContent = "";
      region.dataset.state = "";
    }
    const region = contact.hidden ? status : contactStatus;
    region.textContent = text;
    region.dataset.state = state;
  }

  function setError(suffix, text) {
    const input = field(suffix);
    const error = document.querySelector(`[data-error-for="${input.id}"]`);
    input.setAttribute("aria-invalid", text ? "true" : "false");
    if (!error) return;
    error.textContent = text;
    error.hidden = !text;
    error.id ||= `${input.id}-error`;
    const descriptions = new Set(
      (input.getAttribute("aria-describedby") || "").split(" ").filter(Boolean),
    );
    descriptions.add(error.id);
    input.setAttribute("aria-describedby", [...descriptions].join(" "));
  }

  function enforceAccountingOptions() {
    const isCompany = field("forma").value === "SPOLKA_ZOO";
    const accounting = field("rodzaj");
    if (isCompany) accounting.value = "PELNA";
    for (const option of accounting.options)
      option.disabled = isCompany && option.value !== "PELNA";
    field("rodzaj-hint").textContent = isCompany
      ? "Dla spółki z o.o. dostępna jest wyłącznie pełna księgowość."
      : "";
  }

  function numericError(suffix) {
    const input = field(suffix);
    const value = Number(input.value);
    if (
      input.validity.badInput ||
      !Number.isSafeInteger(value) ||
      input.validity.stepMismatch
    )
      return "Wpisz pełną liczbę, np. 0, 1 lub 30.";
    if (value < 0 || input.validity.rangeUnderflow)
      return "Liczba nie może być mniejsza niż 0.";
    return "";
  }

  function validate(failures) {
    for (const [suffix, error] of failures) setError(suffix, error);
    const first = failures.find(([, error]) => error);
    if (!first) return true;
    setStatus(first[1], "error");
    field(first[0]).focus();
    return false;
  }

  function hideConfirmation() {
    contact.hidden = true;
    confirm.hidden = false;
    confirm.setAttribute("aria-expanded", "false");
  }

  function invalidateQuote() {
    quote = null;
    sent = false;
    result.hidden = true;
    hideConfirmation();
    send.disabled = false;
    send.replaceChildren(...initialSendNodes);
    setStatus("");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (busy || form.hidden) return;
    if (
      !validate([
        ...numericFields.map((suffix) => [suffix, numericError(suffix)]),
        [
          "policy",
          field("policy").checked
            ? ""
            : "Potwierdź zapoznanie się z polityką prywatności.",
        ],
      ])
    )
      return;
    enforceAccountingOptions();
    const data = config();
    // Static previews (including GitHub Pages) calculate without a backend.
    // A WordPress configuration must supply its current rules.
    const rules = validRules(data.rules)
      ? data.rules
      : !window.OmegaKalkData || isLocal
        ? ORIGINAL_RULES
        : null;
    try {
      quote = calculateQuote(
        {
          forma: field("forma").value,
          rodzaj: field("rodzaj").value,
          dokumenty: field("dokumenty").value,
          pracUop: field("pracUop").value,
          pracUoz: field("pracUoz").value,
          vat: field("vat").checked,
          eksport: field("eksport").checked,
        },
        rules,
      );
      if (!Number.isFinite(quote.total)) throw new Error("Invalid total");
    } catch {
      quote = null;
      setStatus(CONFIG_ERROR, "error");
      return;
    }
    field("kwota").textContent = `od ${formatPLN.format(quote.total)}`;
    const names = {
      JDG: "JDG",
      SPOLKA_ZOO: "Spółka z o.o.",
      RYCZALT: "Ryczałt",
      KPIR: "KPiR",
      PELNA: "Pełna księgowość",
    };
    field("breakdown").textContent = [
      names[quote.inputs.forma],
      names[quote.inputs.rodzaj],
      `${quote.inputs.dokumenty} dok. / mies.`,
      `UoP: ${quote.inputs.pracUop}`,
      `UoZ: ${quote.inputs.pracUoz}`,
      `VAT: ${quote.inputs.vat ? "tak" : "nie"}`,
      `Eksport/import: ${quote.inputs.eksport ? "tak" : "nie"}`,
    ].join(" · ");
    setStatus("");
    form.hidden = true;
    result.hidden = false;
    result.focus();
  });

  confirm.addEventListener("click", () => {
    if (!quote || busy || sent) return;
    contact.hidden = false;
    confirm.setAttribute("aria-expanded", "true");
    confirm.hidden = true;
    field("imie").focus();
  });

  edit.addEventListener("click", () => {
    if (busy) return;
    invalidateQuote();
    form.hidden = false;
    field("forma").focus();
  });

  function destination(data) {
    if (!data.ajax_url || !data.nonce) return null;
    try {
      const url = new URL(data.ajax_url, location.href);
      return url.origin === location.origin &&
        ["http:", "https:"].includes(url.protocol)
        ? url.href
        : null;
    } catch {
      return null;
    }
  }

  contact.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || sent || !quote || contact.hidden) return;
    if (
      !validate([
        ["imie", field("imie").value.trim() ? "" : "Podaj imię."],
        [
          "telefon",
          (field("telefon").value.match(/\d/g) || []).length >= 9
            ? ""
            : "Telefon powinien zawierać przynajmniej 9 cyfr.",
        ],
        [
          "email",
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field("email").value.trim())
            ? ""
            : "Podaj poprawny adres e-mail.",
        ],
        [
          "wiadomosc",
          field("wiadomosc").value.length <= 3000
            ? ""
            : "Wiadomość może mieć maksymalnie 3000 znaków.",
        ],
        [
          "privacy",
          field("privacy").checked
            ? ""
            : "Aby wysłać wynik, zaakceptuj zgodę na przetwarzanie danych.",
        ],
      ])
    )
      return;
    const data = config();
    const endpoint = destination(data);
    if (isLocal || !window.OmegaKalkData) {
      setStatus(
        "Tryb podglądu: formularz jest poprawny. Wynik, dane kalkulatora i wiadomość nie zostały wysłane. Wysyłka będzie dostępna po podłączeniu WordPressa.",
        "preview",
      );
      return;
    }
    if (!endpoint || !window.OmegaMGConfirmation?.enabled) {
      setStatus(
        "Wysyłka jest chwilowo niedostępna. Twoja wycena pozostaje widoczna. Skontaktuj się z biurem pod numerem +48 505 448 081.",
        "error",
      );
      return;
    }
    // Preserve the reviewed quote, rather than recalculating from hidden fields.
    const payload = {
      action: "omega_kalk_lead",
      nonce: data.nonce,
      omega_redesign_confirmation: "1",
      imie: field("imie").value.trim(),
      telefon: field("telefon").value.trim(),
      email: field("email").value.trim(),
      wiadomosc: field("wiadomosc").value.trim(),
      ...quote.inputs,
      vat: quote.inputs.vat ? 1 : 0,
      eksport: quote.inputs.eksport ? 1 : 0,
      privacy: 1,
      total: Math.round(quote.total),
      hp_field: field("hp").value || "",
      submitted_at: new Date().toISOString(),
    };
    const body = new FormData();
    for (const [key, value] of Object.entries(payload))
      body.append(key, String(value));
    const controls = [
      ...contact.querySelectorAll("input, textarea, button"),
      edit,
      confirm,
    ].map((control) => [control, control.disabled]);
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);
    busy = true;
    for (const [control] of controls) control.disabled = true;
    contact.setAttribute("aria-busy", "true");
    send.textContent = "Wysyłam…";
    setStatus("Wysyłam wynik do potwierdzenia…", "sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body,
        credentials: "same-origin",
        signal: controller.signal,
      });
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw error;
      }
      if (response.ok && responseData?.success) {
        sent = true;
        setStatus(
          "Dziękujemy! Wynik i wiadomość zostały wysłane do biura do potwierdzenia. Skontaktujemy się z Tobą.",
          "success",
        );
      } else {
        setStatus(
          responseData?.data?.message ||
            "Nie udało się wysłać zapytania. Spróbuj ponownie lub skontaktuj się z biurem telefonicznie.",
          "error",
        );
      }
    } catch {
      setStatus(
        timedOut
          ? "Przekroczono czas oczekiwania. Nie mamy potwierdzenia wysyłki. Skontaktuj się z biurem telefonicznie."
          : "Błąd połączenia. Nie mamy potwierdzenia wysyłki. Spróbuj ponownie później lub skontaktuj się z biurem.",
        "error",
      );
    } finally {
      clearTimeout(timeout);
      busy = false;
      contact.removeAttribute("aria-busy");
      for (const [control, disabled] of controls) control.disabled = disabled;
      send.replaceChildren(...initialSendNodes);
      if (sent) {
        send.disabled = true;
        send.textContent = "Wysłano do potwierdzenia";
      }
    }
  });

  enforceAccountingOptions();
  form.addEventListener("input", (event) => {
    if (busy) return;
    invalidateQuote();
    const suffix = event.target.id?.replace("omega-kalk-", "");
    if ([...numericFields, "policy"].includes(suffix)) setError(suffix, "");
  });
  form.addEventListener("change", () => {
    if (!busy) {
      invalidateQuote();
      enforceAccountingOptions();
    }
  });
  contact.addEventListener("input", (event) => {
    if (busy || sent) return;
    const suffix = event.target.id?.replace("omega-kalk-", "");
    if (contactFields.includes(suffix)) setError(suffix, "");
    setStatus("");
  });
  form.addEventListener("reset", (event) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    invalidateQuote();
    contact.reset();
    for (const suffix of [...numericFields, "policy", ...contactFields])
      setError(suffix, "");
    // Wait until the browser performs reset's native default action.
    setTimeout(() => {
      field("forma").value = defaultForma;
      field("rodzaj").value = defaultRodzaj;
      enforceAccountingOptions();
    }, 0);
  });
  return { form, contact };
}
