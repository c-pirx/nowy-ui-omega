<?php defined( 'ABSPATH' ) || exit; ?>
<section
        class="section calculator-section omega-calculator"
        id="kalkulator"
        aria-labelledby="calculator-title"
      >
        <div class="container calculator-layout">
          <div class="calculator-intro">
            <p class="eyebrow">04 / Kalkulator</p>
            <h2 id="calculator-title">
              Kalkulator usług księgowych<span class="red-dot">.</span>
            </h2>
            <p>Orientacyjna wycena obsługi Twojej firmy.</p>
            <ol class="calculator-steps">
              <li><span>01</span>Twoja działalność</li>
              <li><span>02</span>Dokumenty i pracownicy</li>
              <li><span>03</span>Wynik i potwierdzenie</li>
            </ol>
            <div class="calculator-contact">
              <p>Wolisz porozmawiać?</p>
              <a href="tel:+48505448081"
                >+48 505 448 081
                <span aria-hidden="true"
                  ><svg
                    class="arrow-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M5 19 19 5M5 5h14v14" /></svg></span
              ></a>
            </div>
          </div>
          <div class="calculator-workspace">
            <form id="omega-kalk-form" novalidate>
              <fieldset class="form-group">
                <legend><span>01</span> Twoja działalność</legend>
                <div class="form-grid two">
                  <div class="field">
                    <label for="omega-kalk-forma">Forma działalności</label
                    ><select id="omega-kalk-forma" name="forma">
                      <option value="JDG">JDG</option>
                      <option value="SPOLKA_ZOO">Spółka z o.o.</option>
                    </select>
                  </div>
                  <div class="field">
                    <label for="omega-kalk-rodzaj">Rodzaj księgowości</label
                    ><select
                      id="omega-kalk-rodzaj"
                      name="rodzaj"
                      aria-describedby="omega-kalk-rodzaj-hint"
                    >
                      <option value="RYCZALT">Ryczałt</option>
                      <option value="KPIR">KPiR</option>
                      <option value="PELNA">Pełna księgowość</option></select
                    ><small
                      id="omega-kalk-rodzaj-hint"
                      class="field-hint"
                      aria-live="polite"
                    ></small>
                  </div>
                </div>
              </fieldset>
              <fieldset class="form-group">
                <legend><span>02</span> Dokumenty i pracownicy</legend>
                <div class="form-grid three">
                  <div class="field">
                    <label for="omega-kalk-dokumenty"
                      >Liczba dokumentów <span>/ miesiąc</span></label
                    ><input
                      id="omega-kalk-dokumenty"
                      name="dokumenty"
                      type="number"
                      min="0"
                      step="1"
                      value="0"
                      placeholder="np. 30"
                      inputmode="numeric"
                    /><small
                      data-error-for="omega-kalk-dokumenty"
                      class="field-error"
                    ></small>
                  </div>
                  <div class="field">
                    <label for="omega-kalk-pracUop"
                      >Pracownicy <span>na umowę o pracę</span></label
                    ><input
                      id="omega-kalk-pracUop"
                      name="pracUop"
                      type="number"
                      min="0"
                      step="1"
                      value="0"
                      placeholder="np. 2"
                      inputmode="numeric"
                    /><small
                      data-error-for="omega-kalk-pracUop"
                      class="field-error"
                    ></small>
                  </div>
                  <div class="field">
                    <label for="omega-kalk-pracUoz"
                      >Pracownicy <span>na zlecenie</span></label
                    ><input
                      id="omega-kalk-pracUoz"
                      name="pracUoz"
                      type="number"
                      min="0"
                      step="1"
                      value="0"
                      placeholder="np. 1"
                      inputmode="numeric"
                    /><small
                      data-error-for="omega-kalk-pracUoz"
                      class="field-error"
                    ></small>
                  </div>
                </div>
                <fieldset class="extra-conditions">
                  <legend>Dodatkowe warunki</legend>
                  <div class="checkbox-row">
                    <label class="checkbox"
                      ><input
                        type="checkbox"
                        id="omega-kalk-vat"
                        name="vat"
                      /><span>Czy jest w rejestrze VAT?</span></label
                    ><label class="checkbox"
                      ><input
                        type="checkbox"
                        id="omega-kalk-eksport"
                        name="eksport"
                      /><span>Czy robi eksport/import?</span></label
                    >
                  </div>
                </fieldset>
              </fieldset>
              <div class="consent">
                <label class="checkbox">
                  <input
                    id="omega-kalk-policy"
                    name="policy"
                    type="checkbox"
                    required
                  />
                  <span
                    >Zapoznałem/-am się z
                    <a
                      href="<?php echo esc_url( get_privacy_policy_url() ?: 'https://omega-mg.pl/polityka-prywatnosci/' ); ?>"
                      target="_blank"
                      rel="noopener"
                      >Polityką prywatności</a
                    >
                    <span aria-hidden="true">*</span></span
                  >
                </label>
                <small
                  data-error-for="omega-kalk-policy"
                  class="field-error"
                ></small>
              </div>
              <div class="form-actions">
                <button class="button" type="submit" id="omega-kalk-oblicz">
                  Oblicz cenę
                  <span aria-hidden="true"
                    ><svg
                      class="arrow-icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M5 19 19 5M5 5h14v14" /></svg
                  ></span>
                </button>
                <button class="reset-button" type="reset">Wyczyść</button>
              </div>
              <p class="submit-note">
                Oblicz anonimowo, bez podawania danych kontaktowych. Cena jest
                orientacyjna.
              </p>
            </form>
            <div
              id="omega-kalk-result"
              class="calculator-result"
              role="region"
              aria-label="Wynik kalkulacji"
              tabindex="-1"
              hidden
            >
              <p class="calculator-result-label">Orientacyjny koszt obsługi</p>
              <p class="calculator-result-price">
                <span id="omega-kalk-kwota"></span> <small>netto/mies.</small>
              </p>
              <p
                id="omega-kalk-breakdown"
                class="calculator-result-details"
              ></p>
              <p class="calculator-result-disclaimer">
                To orientacyjna wycena. Ostateczną cenę potwierdzimy po poznaniu
                szczegółów Twojej działalności.
              </p>
              <div class="result-actions">
                <button
                  id="omega-kalk-confirm"
                  class="button button-white"
                  type="button"
                  aria-controls="omega-kalk-contact"
                  aria-expanded="false"
                >
                  Wyślij wynik do potwierdzenia
                  <span aria-hidden="true"
                    ><svg
                      class="arrow-icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M5 19 19 5M5 5h14v14" /></svg
                  ></span>
                </button>
                <button id="omega-kalk-edit" class="result-edit" type="button">
                  Zmień dane
                </button>
              </div>
            </div>
            <form
              id="omega-kalk-contact"
              class="calculator-contact-form"
              novalidate
              hidden
            >
              <fieldset class="form-group">
                <legend><span>03</span> Potwierdź wycenę</legend>
                <p class="confirmation-intro">
                  Zostaw kontakt do siebie. Wynik i dane z kalkulatora dołączymy
                  automatycznie.
                </p>
                <div class="form-grid two">
                  <div class="field">
                    <label for="omega-kalk-imie"
                      >Imię <span aria-hidden="true">*</span></label
                    ><input
                      id="omega-kalk-imie"
                      name="imie"
                      type="text"
                      placeholder="np. Anna"
                      autocomplete="given-name"
                      required
                    /><small
                      data-error-for="omega-kalk-imie"
                      class="field-error"
                    ></small>
                  </div>
                  <div class="field">
                    <label for="omega-kalk-telefon"
                      >Telefon <span aria-hidden="true">*</span></label
                    ><input
                      id="omega-kalk-telefon"
                      name="telefon"
                      type="tel"
                      placeholder="np. 622 233 123"
                      autocomplete="tel"
                      aria-describedby="phone-hint"
                      required
                    /><small id="phone-hint" class="field-hint"
                      >Wpisz min. 9 cyfr</small
                    ><small
                      data-error-for="omega-kalk-telefon"
                      class="field-error"
                    ></small>
                  </div>
                  <div class="field field-full">
                    <label for="omega-kalk-email"
                      >E-mail <span aria-hidden="true">*</span></label
                    ><input
                      id="omega-kalk-email"
                      name="email"
                      type="email"
                      placeholder="np. anna@example.com"
                      autocomplete="email"
                      required
                    /><small
                      data-error-for="omega-kalk-email"
                      class="field-error"
                    ></small>
                  </div>
                  <div class="field field-full">
                    <label for="omega-kalk-wiadomosc"
                      >Wiadomość
                      <span class="optional-label">(opcjonalnie)</span></label
                    >
                    <textarea
                      id="omega-kalk-wiadomosc"
                      name="wiadomosc"
                      rows="4"
                      maxlength="3000"
                      placeholder="Co jeszcze powinniśmy wiedzieć o Twojej firmie?"
                    ></textarea>
                    <small
                      data-error-for="omega-kalk-wiadomosc"
                      class="field-error"
                    ></small>
                  </div>
                </div>
              </fieldset>
              <div class="consent">
                <label class="checkbox"
                  ><input
                    id="omega-kalk-privacy"
                    name="privacy"
                    type="checkbox"
                    required
                  /><span
                    >Zapoznałem/-am się z
                    <a
                      href="<?php echo esc_url( get_privacy_policy_url() ?: 'https://omega-mg.pl/polityka-prywatnosci/' ); ?>"
                      target="_blank"
                      rel="noopener"
                      >Polityką prywatności</a
                    >
                    i wyrażam zgodę na przetwarzanie moich danych osobowych w
                    celu przygotowania wyceny oraz kontaktu zwrotnego.</span
                  ></label
                ><small
                  data-error-for="omega-kalk-privacy"
                  class="field-error"
                ></small>
              </div>
              <input
                class="honeypot"
                type="text"
                id="omega-kalk-hp"
                name="hp_field"
                tabindex="-1"
                autocomplete="off"
                aria-hidden="true"
              />
              <div class="form-actions">
                <button class="button" type="submit" id="omega-kalk-send">
                  Wyślij do potwierdzenia
                  <span aria-hidden="true"
                    ><svg
                      class="arrow-icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M5 19 19 5M5 5h14v14" /></svg
                  ></span>
                </button>
                <span class="required-note">* Pola wymagane</span>
              </div>
              <p
                id="omega-kalk-contact-status"
                role="status"
                aria-live="polite"
              ></p>
              <div class="privacy-note">
                <p>
                  <strong>Informacja o przetwarzaniu danych:</strong>
                  Administratorem danych jest Omega MG Monika Glonek, ul. Heleny
                  i Jana Prześlaków 15C, 43-600 Jaworzno, e-mail:
                  <a href="mailto:biuro@omega-mg.pl">biuro@omega-mg.pl</a>. Dane
                  podane w formularzu przetwarzamy wyłącznie w celu
                  przygotowania orientacyjnej wyceny i kontaktu zwrotnego (art.
                  6 ust. 1 lit. f RODO). Podanie danych jest dobrowolne. Masz
                  prawo dostępu do danych, ich sprostowania, usunięcia,
                  ograniczenia przetwarzania oraz wniesienia skargi do Prezesa
                  UODO. Szczegóły w
                  <a href="<?php echo esc_url( get_privacy_policy_url() ?: 'https://omega-mg.pl/polityka-prywatnosci/' ); ?>"
                    >Polityce prywatności</a
                  >.
                </p>
              </div>
            </form>
            <p id="omega-kalk-status" role="status" aria-live="polite"></p>
            <noscript
              ><p>
                Do obliczenia wyceny potrzebna jest obsługa JavaScript.
                Skontaktuj się z biurem:
                <a href="tel:+48505448081">+48 505 448 081</a>.
              </p></noscript
            >
          </div>
        </div>
      </section>
