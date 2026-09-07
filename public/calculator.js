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

const MESSAGES = {
  privacy_required:
    "Aby skorzystać z kalkulatora, zaakceptuj politykę prywatności.",
  name_required: "Podaj imię.",
  phone_required: "Telefon powinien zawierać przynajmniej 9 cyfr.",
  email_required: "Podaj poprawny adres e-mail.",
  sending: "Wysyłam zgłoszenie…",
  success:
    "Dziękujemy! Wysłaliśmy zapytanie do biura. Skontaktujemy się wkrótce.",
  error_send:
    "Nie udało się wysłać wiadomości. Spróbuj ponownie lub skontaktuj się telefonicznie.",
  error_network: "Błąd połączenia przy wysyłce. Spróbuj ponownie później.",
  error_timeout:
    "Przekroczono czas oczekiwania na odpowiedź. Nie mamy potwierdzenia wysyłki. Skontaktuj się z biurem telefonicznie.",
  hint_spolka: "Dla spółki z o.o. dostępna jest wyłącznie pełna księgowość.",
  disclaimer:
    "Szacowana wycena, w celu uzgodnienia szczegółów prosimy o kontakt.",
};

const PREVIEW_MESSAGE =
  "Podgląd: wycena została obliczona. Zapytanie nie zostało wysłane.";
const CONFIG_ERROR =
  "Kalkulator jest chwilowo niedostępny. Skontaktuj się z biurem pod numerem +48 505 448 081.";
const formatPLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

export function initCalculator() {
  const form = document.getElementById("omega-kalk-form");
  if (!form || form.dataset.calculatorInitialized) return null;
  form.dataset.calculatorInitialized = "true";
  form.noValidate = true;
  const field = (suffix) => document.getElementById(`omega-kalk-${suffix}`);
  const button = field("oblicz");
  const result = field("result") || field("wynik");
  const status = field("status");
  const requiredFields = [
    "forma",
    "rodzaj",
    "dokumenty",
    "pracUop",
    "pracUoz",
    "vat",
    "eksport",
    "imie",
    "telefon",
    "email",
    "privacy",
    "hp",
  ];
  if (
    !button ||
    !result ||
    !status ||
    requiredFields.some((name) => !field(name))
  ) {
    if (status) status.textContent = CONFIG_ERROR;
    return null;
  }

  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  result.setAttribute("aria-live", "polite");
  const isPreview =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const config = () => window.OmegaKalkData || {};
  const message = (key) => config().i18n?.[key] || MESSAGES[key];
  const initialButtonNodes = [...button.childNodes];
  const defaultSelectValue = (select) =>
    [...select.options].find((option) => option.defaultSelected)?.value ||
    select.options[0]?.value;
  const defaultForma = defaultSelectValue(field("forma"));
  const defaultRodzaj = defaultSelectValue(field("rodzaj"));
  const numericFields = ["dokumenty", "pracUop", "pracUoz"];
  const validatedFields = [
    "privacy",
    "imie",
    "telefon",
    "email",
    ...numericFields,
  ];
  let busy = false;
  let revision = 0;

  function setStatus(text, state = "") {
    status.textContent = text;
    status.dataset.state = state;
  }

  function setError(suffix, text) {
    const input = field(suffix);
    const error = form.querySelector(`[data-error-for="${input.id}"]`);
    input.setAttribute("aria-invalid", text ? "true" : "false");
    if (error) {
      error.textContent = text;
      error.hidden = !text;
      if (!error.id) error.id = `${input.id}-error`;
      const descriptions = new Set(
        (input.getAttribute("aria-describedby") || "")
          .split(" ")
          .filter(Boolean),
      );
      descriptions.add(error.id);
      input.setAttribute("aria-describedby", [...descriptions].join(" "));
    }
  }

  function enforceAccountingOptions() {
    const isCompany = field("forma").value === "SPOLKA_ZOO";
    const accounting = field("rodzaj");
    if (isCompany) accounting.value = "PELNA";
    for (const option of accounting.options)
      option.disabled = isCompany && option.value !== "PELNA";
    const hint = field("rodzaj-hint");
    if (hint) hint.textContent = isCompany ? message("hint_spolka") : "";
  }

  function numericError(suffix) {
    const input = field(suffix);
    const value = input.value.trim();
    const numericValue = Number(value);
    if (
      input.validity.badInput ||
      (value !== "" &&
        (!Number.isFinite(numericValue) || !Number.isInteger(numericValue)))
    ) {
      return "Wpisz pełną liczbę, np. 0, 1 lub 30.";
    }
    if (numericValue < 0 || input.validity.rangeUnderflow)
      return "Liczba nie może być mniejsza niż 0.";
    if (input.validity.stepMismatch)
      return "Wpisz pełną liczbę, np. 0, 1 lub 30.";
    return "";
  }

  function validateForm() {
    const failures = [
      ["privacy", field("privacy").checked ? "" : message("privacy_required")],
      ["imie", field("imie").value.trim() ? "" : message("name_required")],
      [
        "telefon",
        (field("telefon").value.match(/\d/g) || []).length >= 9
          ? ""
          : message("phone_required"),
      ],
      [
        "email",
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field("email").value.trim())
          ? ""
          : message("email_required"),
      ],
      ...numericFields.map((suffix) => [suffix, numericError(suffix)]),
    ];
    for (const [suffix, error] of failures) setError(suffix, error);
    const first = failures.find(([, error]) => error);
    if (first) {
      setStatus(first[1], "error");
      field(first[0]).focus();
      return false;
    }
    return true;
  }

  function showQuote(quote) {
    const label = document.createElement("p");
    label.className = "calculator-result-label";
    label.textContent = "Orientacyjny koszt obsługi";
    const price = document.createElement("p");
    price.className = "calculator-result-price";
    price.id = "omega-kalk-kwota";
    price.textContent = formatPLN.format(quote.total);
    const details = document.createElement("p");
    details.className = "calculator-result-details";
    details.id = "omega-kalk-breakdown";
    const names = {
      JDG: "JDG",
      SPOLKA_ZOO: "Spółka z o.o.",
      RYCZALT: "Ryczałt",
      KPIR: "KPiR",
      PELNA: "Pełna księgowość",
    };
    details.textContent = [
      names[quote.inputs.forma],
      names[quote.inputs.rodzaj],
      `${quote.inputs.dokumenty} dok. / mies.`,
      quote.inputs.pracUop ? `${quote.inputs.pracUop} UoP` : "",
      quote.inputs.pracUoz ? `${quote.inputs.pracUoz} UoZ` : "",
      quote.inputs.vat ? "VAT" : "",
      quote.inputs.eksport ? "Eksport/import" : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const disclaimer = document.createElement("p");
    disclaimer.className = "calculator-result-disclaimer";
    disclaimer.textContent = message("disclaimer");
    result.replaceChildren(label, price, details, disclaimer);
    result.hidden = false;
    result.classList.remove("ok-hidden");
  }

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

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    result.hidden = true;
    if (!validateForm()) return;
    enforceAccountingOptions();
    const data = config();
    const rules = validRules(data.rules)
      ? data.rules
      : isPreview
        ? ORIGINAL_RULES
        : null;
    const endpoint = destination(data);
    if (!rules || (!isPreview && !endpoint)) {
      setStatus(CONFIG_ERROR, "error");
      return;
    }

    let quote;
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
    } catch {
      setStatus(CONFIG_ERROR, "error");
      return;
    }
    showQuote(quote);
    if (isPreview) {
      setStatus(PREVIEW_MESSAGE, "preview");
      return;
    }

    const payload = {
      action: "omega_kalk_lead",
      nonce: data.nonce,
      imie: field("imie").value.trim(),
      telefon: field("telefon").value.trim(),
      email: field("email").value.trim(),
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
    const requestRevision = ++revision;
    const controls = [
      ...form.querySelectorAll("input, select, button, textarea"),
    ].map((control) => [control, control.disabled]);
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);
    busy = true;
    for (const [control] of controls) control.disabled = true;
    form.setAttribute("aria-busy", "true");
    button.setAttribute("aria-busy", "true");
    button.textContent = message("sending");
    setStatus(message("sending"), "sending");
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
      if (requestRevision !== revision) return;
      if (response.ok && responseData?.success)
        setStatus(message("success"), "success");
      else
        setStatus(
          responseData?.data?.message || message("error_send"),
          "error",
        );
    } catch {
      if (requestRevision === revision)
        setStatus(
          message(timedOut ? "error_timeout" : "error_network"),
          "error",
        );
    } finally {
      clearTimeout(timeoutId);
      busy = false;
      for (const [control, wasDisabled] of controls)
        control.disabled = wasDisabled;
      form.removeAttribute("aria-busy");
      button.removeAttribute("aria-busy");
      button.replaceChildren(...initialButtonNodes);
    }
  }

  enforceAccountingOptions();
  field("forma").addEventListener("change", enforceAccountingOptions);
  button.addEventListener("click", submit);
  form.addEventListener("submit", submit);
  function handleEdit(event) {
    if (busy) return;
    const suffix = event.target.id?.replace("omega-kalk-", "");
    if (!requiredFields.includes(suffix)) return;
    result.hidden = true;
    setStatus("");
    if (validatedFields.includes(suffix)) setError(suffix, "");
  }
  form.addEventListener("input", handleEdit);
  form.addEventListener("change", handleEdit);
  form.addEventListener("reset", (event) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    revision += 1;
    result.hidden = true;
    setStatus("");
    for (const suffix of validatedFields) setError(suffix, "");
    // Reset's native default action can follow a microtask checkpoint. Wait for
    // the next task and restore the accounting default even if it was disabled.
    setTimeout(() => {
      field("forma").value = defaultForma;
      field("rodzaj").value = defaultRodzaj;
      enforceAccountingOptions();
    }, 0);
  });
  return { form };
}
