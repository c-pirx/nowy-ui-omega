<?php defined( 'ABSPATH' ) || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="<?php echo esc_url( home_url( '/#content' ) ); ?>">Przejdź do treści</a>
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="<?php echo esc_url( home_url( '/#start' ) ); ?>" aria-label="Omega MG – strona główna">
          <img
            src="<?php echo esc_url( get_theme_file_uri( '/assets/aktualne-cropped.svg' ) ); ?>"
            width="72"
            height="72"
            alt="Omega Monika Glonek"
          />
          <span class="brand-name">OMEGA MG<span>Biuro rachunkowe</span></span>
        </a>
        <nav class="desktop-nav" aria-label="Nawigacja główna">
          <a class="nav-link" href="<?php echo esc_url( home_url( '/o-mnie/' ) ); ?>">O MNIE</a>
          <div class="nav-dropdown">
            <button class="nav-link nav-disclosure" type="button" aria-expanded="false" aria-controls="desktop-services">
              USŁUGI <svg class="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <ul class="nav-submenu" id="desktop-services" hidden>
              <li><a href="<?php echo esc_url( home_url( '/ksiegowosc-dla-jdg/' ) ); ?>">JDG</a></li>
              <li><a href="<?php echo esc_url( home_url( '/pelna-ksiegowosc-spolek/' ) ); ?>">Spółki z o.o.</a></li>
              <li><a href="<?php echo esc_url( home_url( '/kadry-i-place/' ) ); ?>">Kadry i płace</a></li>
              <li><a href="<?php echo esc_url( home_url( '/ksef-dla-firm/' ) ); ?>">KSeF</a></li>
              <li><a href="<?php echo esc_url( home_url( '/zmiana-biura-rachunkowego/' ) ); ?>">Zmiana biura</a></li>
              <li><a href="<?php echo esc_url( home_url( '/ksiegowosc-online/' ) ); ?>">Księgowość online</a></li>
            </ul>
          </div>
          <div class="nav-dropdown">
            <button class="nav-link nav-disclosure" type="button" aria-expanded="false" aria-controls="desktop-shop">
              SKLEP <svg class="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <ul class="nav-submenu" id="desktop-shop" hidden>
              <li><a href="<?php echo esc_url( home_url( '/sklep/e-booki-dla-ksiegowych/' ) ); ?>">E-booki dla księgowych</a></li>
              <li><a href="<?php echo esc_url( home_url( '/sklep/e-booki-dla-przedsiebiorcow/' ) ); ?>">E-booki dla przedsiębiorców</a></li>
              <li><a href="<?php echo esc_url( home_url( '/sklep/wzory-i-checklisty/' ) ); ?>">Wzory i checklisty</a></li>
              <li><a href="<?php echo esc_url( home_url( '/sklep/pakiety-materialow/' ) ); ?>">Pakiety materiałów</a></li>
            </ul>
          </div>
          <a class="nav-link" href="<?php echo esc_url( home_url( '/baza-wiedzy/' ) ); ?>">BAZA WIEDZY</a>
        <a class="button button-small header-calculator" href="<?php echo esc_url( home_url( '/#kalkulator' ) ); ?>"
          >Kalkulator
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
          <a class="nav-link" href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>">KONTAKT</a>
        </nav>
        <a class="button button-small header-calculator mobile-header-calculator" href="<?php echo esc_url( home_url( '/#kalkulator' ) ); ?>">
          Kalkulator
          <span aria-hidden="true"><svg class="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" /></svg></span>
        </a>
        <button
          class="menu-toggle"
          aria-controls="mobile-navigation"
          aria-expanded="false"
          aria-label="Otwórz menu"
        >
          <span></span><span></span>
        </button>
      </div>
      <nav
        class="mobile-nav"
        id="mobile-navigation"
        aria-label="Nawigacja mobilna"
        hidden
      >
        <a href="<?php echo esc_url( home_url( '/o-mnie/' ) ); ?>">O MNIE</a>
        <div class="nav-dropdown">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-controls="mobile-services">
            USŁUGI <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <ul class="nav-submenu" id="mobile-services" hidden>
            <li><a href="<?php echo esc_url( home_url( '/ksiegowosc-dla-jdg/' ) ); ?>">JDG</a></li>
            <li><a href="<?php echo esc_url( home_url( '/pelna-ksiegowosc-spolek/' ) ); ?>">Spółki z o.o.</a></li>
            <li><a href="<?php echo esc_url( home_url( '/kadry-i-place/' ) ); ?>">Kadry i płace</a></li>
            <li><a href="<?php echo esc_url( home_url( '/ksef-dla-firm/' ) ); ?>">KSeF</a></li>
            <li><a href="<?php echo esc_url( home_url( '/zmiana-biura-rachunkowego/' ) ); ?>">Zmiana biura</a></li>
            <li><a href="<?php echo esc_url( home_url( '/ksiegowosc-online/' ) ); ?>">Księgowość online</a></li>
          </ul>
        </div>
        <div class="nav-dropdown">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-controls="mobile-shop">
            SKLEP <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <ul class="nav-submenu" id="mobile-shop" hidden>
            <li><a href="<?php echo esc_url( home_url( '/sklep/e-booki-dla-ksiegowych/' ) ); ?>">E-booki dla księgowych</a></li>
            <li><a href="<?php echo esc_url( home_url( '/sklep/e-booki-dla-przedsiebiorcow/' ) ); ?>">E-booki dla przedsiębiorców</a></li>
            <li><a href="<?php echo esc_url( home_url( '/sklep/wzory-i-checklisty/' ) ); ?>">Wzory i checklisty</a></li>
            <li><a href="<?php echo esc_url( home_url( '/sklep/pakiety-materialow/' ) ); ?>">Pakiety materiałów</a></li>
          </ul>
        </div>
        <a href="<?php echo esc_url( home_url( '/baza-wiedzy/' ) ); ?>">BAZA WIEDZY</a>
        <a href="<?php echo esc_url( home_url( '/#kalkulator' ) ); ?>"
          >Kalkulator
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
        <a href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>">KONTAKT</a>
        <a class="mobile-phone" href="tel:+48505448081">+48 505 448 081</a>
      </nav>
    </header>
