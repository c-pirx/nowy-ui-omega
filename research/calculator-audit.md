# Original Omega MG calculator audit

Audited 2026-09-08. Public sources:
- https://omega-mg.pl/ (calculator markup in saved HTML lines 594–699, server configuration line 1030).
- https://omega-mg.pl/wp-content/plugins/omega-kalkulator/public/js/calculator.js?ver=1.0.3 (unmodified downloaded JS).

Files: calculator-original.html, calculator-original.js, calculator-markup-original.html, calculator-config-original.json. The JSON contains a captured public WordPress nonce: it is evidence only and must not be hardcoded for production.

## Inputs and exact options

| ID suffix (prefix omega-kalk-) | Meaning | Type / values | Default |
|---|---|---|---|
| forma | Forma działalności | select JDG / SPOLKA_ZOO (Spółka z o.o.) | JDG |
| rodzaj | Rodzaj księgowości | select RYCZALT / KPIR / PELNA | RYCZALT |
| dokumenty | Liczba dokumentów / miesiąc | number, min=0, step=1, no max | 0 |
| pracUop | Pracownicy na umowę o pracę | number, min=0, step=1, no max | 0 |
| pracUoz | Pracownicy na zlecenie | number, min=0, step=1, no max | 0 |
| vat | Czy jest w rejestrze VAT? | checkbox | false |
| eksport | Czy robi eksport/import? | checkbox | false |
| imie | Imię | text | empty |
| telefon | Telefon | tel | empty |
| email | E-mail | email | empty |
| privacy | Privacy acknowledgment + personal data consent for quote/contact | required checkbox | false |
| hp | Honeypot, name hp_field | visually offscreen text, autocomplete=off, tabindex=-1 | empty |

SPOLKA_ZOO immediately sets rodzaj=PELNA and disables RYCZALT and KPIR. On switching back to JDG all options are enabled but the selected value stays PELNA. The constraint is also forced again on calculation. Hint: “Dla spółki z o.o. dostępna jest wyłącznie pełna księgowość.”

## Exact pricing

Base matrix in server-delivered config:

| Business type | RYCZALT | KPIR | PELNA |
|---|---:|---:|---:|
| JDG | 150 | 250 | 600 |
| SPOLKA_ZOO | 200 (unreachable UI) | 350 (unreachable UI) | 900 |

Minimum by accounting type: RYCZALT 150, KPIR 250, PELNA 600.

The total document count chooses ONE per-document rate. This is NOT marginal/progressive pricing:

| Total documents | Rate |
|---|---:|
| 0–10 | 0 |
| 11–30 | 8 |
| 31–60 | 6 |
| 61–120 | 5 |
| 121+ | 4 |

Numeric counts are normalized with `Math.max(0, parseInt(value || '0', 10))`. Fees:
- docsCost = selectedRate * Math.max(0, documentCount - 10)
- uopCost = employeesUop * 80
- uozCost = employeesUoz * 50
- vatCost = VAT ? 100 : 0
- exportCost = importExport ? 150 : 0
- subtotal = base + docsCost + uopCost + uozCost + vatCost + exportCost
- total = Math.max(subtotal, minimumForAccountingType)

Display uses Intl.NumberFormat('pl-PL', {style:'currency', currency:'PLN', maximumFractionDigits:0}). Payload total uses Math.round(total). Original markup calls it “Wynik”; it does not explicitly label net/gross, so do not invent VAT treatment.

Boundary examples (JDG, RYCZALT, no employees/extras): 0=150, 10=150, 11=158, 30=310, 31=276, 60=450, 61=405, 120=700, 121=594 PLN. These price drops are real consequences of the original logic and must remain when preservation is required.

Example: JDG/KPIR, 30 documents, 2 UOP, 1 UOZ, VAT and import/export = 250+160+160+50+100+150 = 870 PLN.

## Validation, result, submission

Original “Oblicz” is type=button; its click handler prevents default and runs calculate(). Form has novalidate. Validation occurs in this exact order with alert() and return:
1. Privacy checked.
2. Trimmed name not empty.
3. Phone string has at least 9 ASCII digits (other characters allowed).
4. Trimmed email matches /^[^\s@]+@[^\s@]+\.[^\s@]+$/.

On valid input: normalize counts, calculate, show total + selection badges + disclaimer, then AUTOMATICALLY call sendLead(). There is no separate send/confirm action. Result is visible even if the subsequent network submission fails. No live calculation listeners exist. No submit listener, request deduplication, loading disable, or reset listener exists. Reset uses native form reset and does not clear the visible result/status or re-enforce the disabled options.

Disclaimer: “Szacowana wycena, w celu uzgodnienia szczegółów prosimy o kontakt.”

Request:
- URL: https://omega-mg.pl/wp-admin/admin-ajax.php
- Method: POST
- Body: FormData
- Fetch credentials: same-origin
- action=omega_kalk_lead
- nonce=OmegaKalkData.nonce (WordPress-generated, source page provides it)
- payload keys: imie, telefon, email, forma, rodzaj, dokumenty, pracUop, pracUoz, vat, eksport, privacy, total, hp_field, submitted_at
- contact values trimmed, flags 1/0, numeric counts normalized, submitted_at is new Date().toISOString().

Response succeeds only when parsed JSON has a truthy `success`. On failure it prefers data.data.message, otherwise configured generic send error. Network rejection gives separate connection error. The frontend does not check response.ok. No requests were submitted during audit.

## Privacy text / behavior

Checkbox links to https://omega-mg.pl/polityka-prywatnosci/ in a new tab with noopener. It states that the user has read the policy and consents to personal data processing for preparing a quote and contacting them. The information below the form states administrator Omega MG Monika Glonek, ul. Heleny i Jana Prześlaków 15C, 43-600 Jaworzno, email biuro@omega-mg.pl, quote/contact purpose, voluntary data provision and Article 6(1)(f) GDPR, plus access/rectification/erasure/restriction/complaint rights. This is a source description, not a legal assessment. Calculator JS has no localStorage, sessionStorage, cookies, analytics, or persistence; it sends entered contact/calculator values upon the valid calculation click.

## Integration constraints

A standalone frontend on localhost or another origin cannot assume this WordPress endpoint accepts cross-origin fetches. Read-only OPTIONS request with Origin http://localhost:5173 returned HTTP 403 and no Access-Control-Allow-Origin / Allow-Credentials / Allow-Methods headers. This proves the checked preflight was refused, but was not a POST/CORS delivery test.

The saved nonce is a snapshot and must not be reused indefinitely. Actual production integration needs the site's WordPress plugin supplying a fresh OmegaKalkData object on the same origin, or a reviewed server-side adapter obtaining current configuration/nonce and forwarding the same payload. Only public frontend behavior is available; backend validation, mail transport, storage, anti-spam enforcement, nonce lifetime, and message recipients cannot be established from this source.

For a local redesign, preserve exact pricing + fields and make delivery behavior explicit. Do not show a fake sent confirmation. Do not POST during verification. In local tests mock/intercept outbound submission; validate pricing separately with deterministic boundary cases.
