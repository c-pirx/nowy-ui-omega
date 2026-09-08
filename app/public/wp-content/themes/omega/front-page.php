<?php get_header(); ?>
<main id="content">
      <section class="hero container" id="start" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">
            <span class="eyebrow-line"></span>Biuro rachunkowe · Jaworzno
          </p>
          <h1 id="hero-title">
            Twoja rzetelna<br />
            księgowość<br />
            <span>w Jaworznie.</span>
          </h1>
          <p class="hero-intro">
            Profesjonalna obsługa księgowa i podatkowa<br
              class="desktop-break"
            />
            dla firm oraz osób prywatnych.
          </p>
          <div class="hero-actions">
            <a class="button" href="<?php echo esc_url( home_url( '/#kalkulator' ) ); ?>"
              >Kalkulator księgowości
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
                  <path d="M5 19 19 5M5 5h14v14" /></svg></span></a
            ><a class="text-link" href="<?php echo esc_url( home_url( '/#onas' ) ); ?>"
              >O nas
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
          <a class="hero-contact" href="tel:+48505448081"
            ><svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m7 3 3 5-2.3 2.3a15 15 0 0 0 6 6L16 14l5 3-1 4C10 23 1 14 3 4Z"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
              /></svg
            ><span>Porozmawiajmy<span>+48 505 448 081</span></span></a
          >
        </div>
        <figure class="hero-portrait">
          <img
            src="<?php echo esc_url( get_theme_file_uri( '/assets/dsc_1052-scaled.jpg' ) ); ?>"
            srcset="<?php echo esc_url( get_theme_file_uri( '/assets/dsc_1052-768x513.jpg' ) ); ?> 768w, <?php echo esc_url( get_theme_file_uri( '/assets/dsc_1052-1024x684.jpg' ) ); ?> 1024w, <?php echo esc_url( get_theme_file_uri( '/assets/dsc_1052-1536x1025.jpg' ) ); ?> 1536w, <?php echo esc_url( get_theme_file_uri( '/assets/dsc_1052-scaled.jpg' ) ); ?> 2560w"
            sizes="(max-width: 767px) 100vw, 50vw"
            width="2560"
            height="1709"
            fetchpriority="high"
            alt="Monika Glonek, właścicielka Biura Rachunkowego Omega MG"
          />
          <figcaption>
            <div>
              <strong>Monika Glonek</strong
              ><span>Biuro Rachunkowe Omega MG</span>
            </div>
            <a href="<?php echo esc_url( home_url( '/#onas' ) ); ?>" aria-label="Poznaj Monikę Glonek"
              ><span aria-hidden="true"
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
          </figcaption>
        </figure>
      </section>

      <div class="trust-strip">
        <div class="container trust-inner">
          <p>Wiedza. Profesjonalizm. Rzetelność.</p>
          <a
            href="https://www.cik.org.pl/biuro/omega-monika-glonek-28162"
            target="_blank"
            rel="noopener"
            ><span class="certificate-symbol" aria-hidden="true">✓</span
            ><span>Certyfikat Księgowy <strong>nr 54701/2012</strong></span
            ><span class="trust-arrow" aria-hidden="true"
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
                <path d="M5 19 19 5M5 5h14v14" /></svg></span></a
          ><span class="trust-location">Jaworzno, ul. Prześlaków 15C</span>
        </div>
      </div>

      <section
        class="section container about"
        id="onas"
        aria-labelledby="about-title"
      >
        <div class="about-identity">
          <p class="eyebrow">01 / O mnie</p>
          <h2 id="about-title">
            Monika Glonek<span
              >Biuro rachunkowe<br />
              Omega MG</span
            >
          </h2>
          <figure class="about-photo">
            <img
              src="<?php echo esc_url( get_theme_file_uri( '/assets/dsc_1052-1024x684.jpg' ) ); ?>"
              width="1024"
              height="684"
              loading="lazy"
              alt="Monika Glonek – indywidualne podejście do każdego klienta"
            />
          </figure>
          <div class="about-seal">
            <img
              src="<?php echo esc_url( get_theme_file_uri( '/assets/projekt-bez-nazwy-2.png' ) ); ?>"
              width="1080"
              height="1080"
              loading="lazy"
              alt="Omega Monika Glonek – wiedza, profesjonalizm, rzetelność"
            />
          </div>
        </div>
        <div class="about-story">
          <p class="lead">
            Jako właścicielka Biura Rachunkowego Omega MG, od początku
            działalności stawiam na
            <strong
              >indywidualne podejście, rzetelność i pełne zaangażowanie.</strong
            >
          </p>
          <div class="about-body">
            <p>
              Dzięki wieloletniemu doświadczeniu oraz regularnemu podnoszeniu
              kwalifikacji, oferuję klientom obsługę na najwyższym poziomie –
              zgodną z aktualnymi przepisami prawa i dostosowaną do dynamicznych
              zmian w przepisach podatkowych.
            </p>
            <p>
              Współpracuję z jednoosobowymi działalnościami gospodarczymi,
              spółkami cywilnymi, jawnymi i z o.o., a także z osobami
              fizycznymi. Dla mnie każda firma, niezależnie od wielkości,
              zasługuje na profesjonalne i życzliwe podejście.
            </p>
          </div>
          <a class="text-link" href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>"
            >Skontaktuj się
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
      </section>

      <section
        class="section services"
        id="oferta"
        aria-labelledby="services-title"
      >
        <div class="container">
          <div class="section-heading">
            <div>
              <p class="eyebrow">02 / Usługi</p>
              <h2 id="services-title">
                Zakres naszych usług<span class="red-dot">.</span>
              </h2>
            </div>
            <p>
              Biuro Rachunkowe Omega MG z siedzibą w Jaworznie to miejsce, gdzie
              rzetelność spotyka się z nowoczesnym podejściem do księgowości.
            </p>
          </div>
          <p class="services-intro">
            Od lat wspieramy lokalnych przedsiębiorców oraz osoby fizyczne,
            oferując kompleksową obsługę księgową, kadrową i podatkową,
            dostosowaną do indywidualnych potrzeb każdego klienta.
          </p>
          <div class="featured-services">
            <article class="service-feature">
              <div class="service-photo">
                <img
                  src="<?php echo esc_url( get_theme_file_uri( '/assets/crop-woman-using-calculator-and-taking-notes-on-paper.jpg' ) ); ?>"
                  width="640"
                  height="426"
                  loading="lazy"
                  alt="Praca z dokumentami księgowymi i kalkulatorem"
                /><span class="photo-number" aria-hidden="true">01</span>
              </div>
              <div class="service-feature-copy">
                <h3>
                  Prowadzenie ksiąg<br />
                  rachunkowych
                </h3>
                <p>
                  Zajmuję się kompleksowym prowadzeniem księgowości dla
                  jednoosobowych działalności i firm. Pilnuję poprawności
                  dokumentów, rozliczam przychody i koszty oraz przygotowuję
                  sprawozdania finansowe. Dzięki temu masz pewność, że wszystko
                  jest zgodne z przepisami, a Ty możesz spokojnie skupić się na
                  swoim biznesie.
                </p>
                <a class="text-link" href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>"
                  >Skontaktuj się
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
            </article>
            <article class="service-feature">
              <div class="service-photo">
                <img
                  src="<?php echo esc_url( get_theme_file_uri( '/assets/crop-payroll-clerk-counting-money-while-sitting-at-table.jpg' ) ); ?>"
                  width="640"
                  height="426"
                  loading="lazy"
                  alt="Rozliczenia wynagrodzeń i dokumentacja płacowa"
                /><span class="photo-number" aria-hidden="true">02</span>
              </div>
              <div class="service-feature-copy">
                <h3>Kadry i płace</h3>
                <p>
                  Pomagam w obsłudze kadrowo-płacowej – przygotowuję umowy,
                  prowadzę dokumentację pracowniczą, naliczam wynagrodzenia i
                  rozliczam składki ZUS oraz podatki. Dbam o to, by Twoi
                  pracownicy otrzymywali wypłaty na czas, a wszystkie
                  formalności były w pełni zgodne z obowiązującymi przepisami.
                </p>
                <a class="text-link" href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>"
                  >Skontaktuj się
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
            </article>
          </div>
          <div class="full-services-heading">
            <span class="eyebrow">Kompleksowa obsługa</span>
            <h3>Pełny zakres naszych usług</h3>
          </div>
          <div class="full-services">
            <article>
              <span class="service-index">01</span>
              <div>
                <h4>Pełna księgowość (księgi rachunkowe)</h4>
                <p>
                  Prowadzenie ksiąg handlowych zgodnie z przepisami,
                  sporządzanie bilansów, rachunków zysków i strat, zestawień
                  finansowych.
                </p>
              </div>
            </article>
            <article>
              <span class="service-index">02</span>
              <div>
                <h4>Księga przychodów i rozchodów (KPiR)</h4>
                <p>
                  Obsługa firm jednoosobowych oraz spółek rozliczających się w
                  formie uproszczonej księgowości.
                </p>
              </div>
            </article>
            <article>
              <span class="service-index">03</span>
              <div>
                <h4>Ryczałt ewidencjonowany</h4>
                <p>
                  Prowadzenie ewidencji przychodów, rejestrów VAT, wsparcie w
                  rozliczeniach podatkowych i ZUS.
                </p>
              </div>
            </article>
            <article>
              <span class="service-index">04</span>
              <div>
                <h4>Kadry i płace</h4>
                <p>
                  Sporządzanie list płac, deklaracji ZUS, umów o pracę i umów
                  cywilnoprawnych, pełna obsługa kadrowa.
                </p>
              </div>
            </article>
            <article>
              <span class="service-index">05</span>
              <div>
                <h4>Roczne rozliczenia podatkowe</h4>
                <p>
                  Przygotowanie deklaracji PIT i CIT, obsługa rozliczeń dla osób
                  fizycznych i przedsiębiorców.
                </p>
              </div>
            </article>
            <article>
              <span class="service-index">06</span>
              <div>
                <h4>Pomoc przy zakładaniu działalności gospodarczej</h4>
              </div>
            </article>
            <article class="service-wide">
              <span class="service-index">07</span>
              <div>
                <h4>
                  Pomoc w wyborze formy opodatkowania w ramach prowadzonej
                  księgowości
                </h4>
              </div>
            </article>
          </div>
          <div class="service-bottom">
            <img
              src="<?php echo esc_url( get_theme_file_uri( '/assets/heap-of-american-money-cash-and-vintage-light-box.jpg' ) ); ?>"
              width="640"
              height="426"
              loading="lazy"
              alt="Dokumenty i środki finansowe w pracy biura rachunkowego"
            />
            <p>
              Pełna księgowość, kadry i płace,<br />
              rozliczenia podatkowe.
            </p>
            <a class="text-link" href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>"
              >Skontaktuj się
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
      </section>

      <section
        class="section container why"
        id="dlaczego"
        aria-labelledby="why-title"
      >
        <div class="why-intro">
          <p class="eyebrow">03 / Dlaczego Omega MG</p>
          <h2 id="why-title">
            Doświadczona księgowa to 80% sukcesu Twojej firmy<span
              class="red-dot"
              >.</span
            >
          </h2>
          <p>
            Za sukcesem wielu stabilnych biznesów stoi doświadczona i
            odpowiedzialna księgowa, która nie tylko czuwa nad zgodnością z
            przepisami, ale też aktywnie wspiera rozwój firmy. Takie właśnie
            podejście oferujemy w Biurze Rachunkowym Omega MG w Jaworznie.
          </p>
          <p class="why-note">
            Rzetelna księgowość to 80% sukcesu Twojego biznesu
          </p>
        </div>
        <ol class="why-list">
          <li>
            <span aria-hidden="true">01</span>
            <div>
              <h3>Klient na pierwszym miejscu</h3>
              <p>Indywidualne podejście i elastyczność we współpracy</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <div>
              <h3>Doświadczenie</h3>
              <p>Wieloletnie doświadczenie i znajomość lokalnego rynku</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <div>
              <h3>Terminowość, poufność i rzetelność</h3>
              <p>To podstawa moich działań</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">04</span>
            <div>
              <h3>Transparentność</h3>
              <p>Przejrzyste warunki współpracy i konkurencyjne ceny</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">05</span>
            <div>
              <h3>Wsparcie</h3>
              <p>Stałe wsparcie na każdym etapie prowadzenia działalności</p>
            </div>
          </li>
        </ol>
      </section>

      <?php
if ( shortcode_exists( 'omega_calculator' ) ) {
	echo do_shortcode( '[omega_calculator]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
	echo '<section class="section calculator-section" id="kalkulator"><div class="container"><p>Kalkulator jest chwilowo niedostępny.</p></div></section>';
}
?>

      <section
        class="section container clients"
        id="opinie"
        aria-labelledby="clients-title"
      >
        <div class="clients-heading">
          <div>
            <p class="eyebrow">05 / Współpraca</p>
            <h2 id="clients-title">
              Nasi klienci<span class="red-dot">.</span>
            </h2>
          </div>
          <div class="carousel-controls">
            <button
              type="button"
              id="clients-prev"
              aria-label="Poprzednie logotypy"
              aria-controls="client-logos"
            >
              <svg
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
                <path d="M20 12H4m7-7-7 7 7 7" />
              </svg></button
            ><button
              type="button"
              id="clients-next"
              aria-label="Następne logotypy"
              aria-controls="client-logos"
            >
              <svg
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
                <path d="M4 12h16m-7-7 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div
          class="client-logos"
          id="client-logos"
          role="region"
          aria-label="Logotypy klientów"
          tabindex="0"
        >
          <img
            src="<?php echo esc_url( get_theme_file_uri( '/assets/logo-5.svg' ) ); ?>"
            width="144"
            height="80"
            loading="lazy"
            alt="Logotyp klienta 1"
          /><img
            src="<?php echo esc_url( get_theme_file_uri( '/assets/logo-4.svg' ) ); ?>"
            width="143"
            height="80"
            loading="lazy"
            alt="Logotyp klienta 2"
          /><img
            src="<?php echo esc_url( get_theme_file_uri( '/assets/logo-3.svg' ) ); ?>"
            width="143"
            height="80"
            loading="lazy"
            alt="Logotyp klienta 3"
          /><img
            src="<?php echo esc_url( get_theme_file_uri( '/assets/logo-2.svg' ) ); ?>"
            width="143"
            height="80"
            loading="lazy"
            alt="Logotyp klienta 4"
          /><img
            src="<?php echo esc_url( get_theme_file_uri( '/assets/logo-1.svg' ) ); ?>"
            width="143"
            height="80"
            loading="lazy"
            alt="Logotyp klienta 5"
          />
        </div>
      </section>

      <section
        class="contact-section"
        id="kontakt"
        aria-labelledby="contact-title"
      >
        <div class="container">
          <div class="contact-top">
            <div>
              <p class="eyebrow">06 / Kontakt</p>
              <h2 id="contact-title">Zadzwoń do nas<span>.</span></h2>
            </div>
            <a class="button button-light" href="<?php echo esc_url( home_url( '/#kalkulator' ) ); ?>"
              >Kalkulator księgowości
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
          <div class="contact-grid">
            <div>
              <p class="contact-label">Numer telefonu</p>
              <a class="contact-main-link" href="tel:+48505448081"
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
            <div>
              <p class="contact-label">E-mail</p>
              <a class="contact-main-link" href="mailto:biuro@omega-mg.pl"
                >biuro@omega-mg.pl
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
            <div>
              <p class="contact-label">Adres biura</p>
              <address>
                ul. Heleny i Jana Prześlaków 15C<br />
                43-600 Jaworzno
              </address>
            </div>
          </div>
        </div>
      </section>
    </main>
<?php get_footer(); ?>
