<footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a
              class="brand"
              href="<?php echo esc_url( home_url( '/#start' ) ); ?>"
              aria-label="Omega MG – początek strony"
              ><img
                src="<?php echo esc_url( get_theme_file_uri( '/assets/aktualne-cropped.svg' ) ); ?>"
                width="76"
                height="76"
                loading="lazy"
                alt="Omega Monika Glonek"
              /><span class="brand-name"
                >OMEGA MG<span>Monika Glonek</span></span
              ></a
            >
            <p>
              Profesjonalna obsługa księgowa i podatkowa dla firm oraz osób
              prywatnych – Omega MG Monika Glonek
            </p>
          </div>
          <div>
            <h3>Usługi</h3>
            <ul>
              <li><a href="<?php echo esc_url( home_url( '/#oferta' ) ); ?>">Prowadzenie ksiąg rachunkowych</a></li>
              <li><a href="<?php echo esc_url( home_url( '/#oferta' ) ); ?>">Kadry i płace</a></li>
              <li><a href="<?php echo esc_url( home_url( '/#oferta' ) ); ?>">Obsługa ZUS</a></li>
              <li><a href="<?php echo esc_url( home_url( '/#oferta' ) ); ?>">Rozliczenia podatkowe</a></li>
            </ul>
          </div>
          <div>
            <h3>Kontakt</h3>
            <ul>
              <li><a href="tel:+48505448081">+48 505 448 081</a></li>
              <li><a href="mailto:biuro@omega-mg.pl">biuro@omega-mg.pl</a></li>
              <li>
                <address>
                  ul. Heleny i Jana Prześlaków 15C<br />
                  43-600 Jaworzno
                </address>
              </li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>
            NIP: 6321808677 <span>REGON: 243006460</span
            ><span>Certyfikat Księgowy nr 54701/2012</span>
          </p>
          <a href="https://omega-mg.pl/polityka-prywatnosci/"
            >Polityka prywatności
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
        <div class="certification">
          <a
            href="https://www.cik.org.pl/biuro/omega-monika-glonek-28162"
            target="_blank"
            rel="noopener"
            >Certyfikowane Biuro Rachunkowe · C.I.K.
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
          ><button
            type="button"
            id="load-certification"
            aria-expanded="false"
            aria-controls="certification-widget"
          >
            Pokaż certyfikat
          </button>
          <div id="certification-widget" hidden>
            <div class="certification-title">
              <img
                src="<?php echo esc_url( get_theme_file_uri( '/assets/cik-widget-logo.png' ) ); ?>"
                width="50"
                height="50"
                loading="lazy"
                alt="Centrum Informacji Księgowej"
              />
              <h3>Certyfikowane Biuro Rachunkowe</h3>
            </div>
            <h4>Kryteria C.I.K.</h4>
            <ul>
              <li>Uprawnienia: Certyfikat Księgowy nr 54701/2012</li>
              <li>Ubezpieczenie OC: Leadenhall</li>
              <li>Brak zaległości finansowych w BIG</li>
              <li>Nienaganna opinia</li>
              <li>Licencjonowany program księgowy: InsERT</li>
              <li>Min. 2 lata doświadczenia (od 2017-08-02)</li>
            </ul>
            <h4>Dodatkowe informacje</h4>
            <p>Ostatnia weryfikacja wiedzy podatkowej: 2026 - czerwiec</p>
            <a
              class="text-link"
              href="https://www.cik.org.pl/biuro/omega-monika-glonek-28162"
              target="_blank"
              rel="noopener"
              >Sprawdź aktualny certyfikat
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
      </div>
    </footer>
    <a
      class="mobile-call"
      href="tel:+48505448081"
      aria-label="Zadzwoń do Omega MG: +48 505 448 081"
      ><svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m7 3 3 5-2.3 2.3a15 15 0 0 0 6 6L16 14l5 3-1 4C10 23 1 14 3 4Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        /></svg
    ></a>
<?php wp_footer(); ?>
</body>
</html>
