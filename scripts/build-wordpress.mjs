import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const theme = join(root, "app", "public", "wp-content", "themes", "omega");
const plugin = join(root, "app", "public", "wp-content", "plugins", "omega-core");
const html = (await readFile(join(root, "public", "index.html"), "utf8")).replace(/\r\n/g, "\n");
const css = (await readFile(join(root, "public", "styles.css"), "utf8")).replace(/\r\n/g, "\n");
const app = (await readFile(join(root, "public", "app.js"), "utf8")).replace(/\r\n/g, "\n");
const calculator = (await readFile(join(root, "public", "calculator.js"), "utf8")).replace(/\r\n/g, "\n");

const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
if (!body) throw new Error("Nie znaleziono body w public/index.html.");

const mainStart = body.indexOf('<main id="content">');
const mainEnd = body.indexOf("</main>", mainStart) + "</main>".length;
if (mainStart < 0 || mainEnd < 0) throw new Error("Nie znaleziono głównej treści.");

// Polityka prywatności: strona WordPressa po jej publikacji, do tego czasu obecna strona omega-mg.pl.
const privacyHref = `href="<?php echo esc_url( get_privacy_policy_url() ?: 'https://omega-mg.pl/polityka-prywatnosci/' ); ?>"`;
const privacyPattern = /href="https:\/\/omega-mg\.pl\/polityka-prywatnosci\/"/g;

function rewriteMarkup(value) {
  return value
    .replace(/<script\b[^>]*\bsrc=["'](?:\.\/)?app\.js["'][^>]*>\s*<\/script>/gi, "")
    .replace(privacyPattern, privacyHref)
    .replace(/\b(src|poster)=["'](?:\.\/)?assets\/([^"']+)["']/g, (_m, attr, path) =>
      `${attr}="<?php echo esc_url( get_theme_file_uri( '/assets/${path}' ) ); ?>"`)
    .replace(/\bsrcset="([^"]+)"/g, (_m, set) => {
      const items = set.split(",").map((item) => {
        const [url, descriptor] = item.trim().split(/\s+/, 2);
        const path = url.replace(/^\.\//, "").replace(/^assets\//, "");
        return `<?php echo esc_url( get_theme_file_uri( '/assets/${path}' ) ); ?>${descriptor ? ` ${descriptor}` : ""}`;
      });
      return `srcset="${items.join(", ")}"`;
    })
    // The skip link stays in-page so it works on every template, not only the front page.
    .replace(/href="#(?!content")([a-zA-Z0-9_-]+)"/g, (_m, id) =>
      `href="<?php echo esc_url( home_url( '/#${id}' ) ); ?>"`)
    .replace(/href="(o-mnie|ksiegowosc-dla-jdg|pelna-ksiegowosc-spolek|kadry-i-place|ksef-dla-firm|zmiana-biura-rachunkowego|ksiegowosc-online|baza-wiedzy)"/g, (_m, slug) =>
      `href="<?php echo esc_url( home_url( '/${slug}/' ) ); ?>"`)
    // The shop tab follows the WooCommerce shop page; /sklep/ is the fallback without WooCommerce.
    .replace(/href="sklep"/g,
      `href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/sklep/' ) ); ?>"`)
    .replace(/href="(sklep\/[^"]+)"/g, (_m, slug) =>
      `href="<?php echo esc_url( home_url( '/${slug}/' ) ); ?>"`);
}

// Ikona koszyka WooCommerce: na końcu nawigacji desktopowej i w pasku mobilnym przed przełącznikiem menu.
const headerMarkup = rewriteMarkup(body.slice(0, mainStart))
  .replace("</nav>", "<?php omega_cart_link(); ?>\n        </nav>")
  .replace(/<button\s+class="menu-toggle"/, '<?php omega_cart_link(); ?>\n        <button class="menu-toggle"');
let mainMarkup = body.slice(mainStart, mainEnd);
const calculatorPattern = /<section\s+class="section calculator-section"[\s\S]*?<\/section>/i;
const calculatorMarkup = mainMarkup.match(calculatorPattern)?.[0]
  ?.replace('class="section calculator-section"', 'class="section calculator-section omega-calculator"')
  .replace(privacyPattern, privacyHref);
if (!calculatorMarkup) throw new Error("Nie znaleziono sekcji kalkulatora.");
mainMarkup = rewriteMarkup(mainMarkup.replace(calculatorPattern, `<?php
if ( shortcode_exists( 'omega_calculator' ) ) {
\techo do_shortcode( '[omega_calculator]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
\techo '<section class="section calculator-section" id="kalkulator"><div class="container"><p>Kalkulator jest chwilowo niedostępny.</p></div></section>';
}
?>`));
// Stopka dostaje kolumnę ze stronami sklepu (koszyk, konto, zwroty), których statyczna strona nie ma.
const footerMarkup = rewriteMarkup(body.slice(mainEnd))
  .replace(/(<div>\s*<h3>Kontakt<\/h3>)/, "<?php omega_footer_shop(); ?>\n          $1");

const headerPhp = `<?php defined( 'ABSPATH' ) || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
\t<meta charset="<?php bloginfo( 'charset' ); ?>">
\t<meta name="viewport" content="width=device-width, initial-scale=1">
\t<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
${headerMarkup.trim()}
`;
const footerPhp = `${footerMarkup.trim()}
<?php wp_footer(); ?>
</body>
</html>
`;

const functionsPhp = `<?php
defined( 'ABSPATH' ) || exit;

function omega_setup() {
\tadd_theme_support( 'title-tag' );
\tadd_theme_support( 'post-thumbnails' );
\tadd_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
\tadd_theme_support( 'woocommerce' );
}
add_action( 'after_setup_theme', 'omega_setup' );

function omega_assets() {
\t$css = get_theme_file_path( '/assets/css/site.css' );
\t$js  = get_theme_file_path( '/assets/js/main.js' );
\twp_enqueue_style( 'omega-site', get_theme_file_uri( '/assets/css/site.css' ), array(), (string) filemtime( $css ) );
\twp_enqueue_script( 'omega-site', get_theme_file_uri( '/assets/js/main.js' ), array(), (string) filemtime( $js ), true );
}
add_action( 'wp_enqueue_scripts', 'omega_assets' );

function omega_module_script( $tag, $handle, $src ) {
\tif ( 'omega-site' !== $handle ) return $tag;
\treturn '<script type="module" src="' . esc_url( $src ) . '"></script>';
}
add_filter( 'script_loader_tag', 'omega_module_script', 10, 3 );

function omega_document_title( $title ) {
\treturn is_front_page() ? 'Księgowość Jaworzno – Monika Glonek | Biuro Rachunkowe Omega MG' : $title;
}
add_filter( 'pre_get_document_title', 'omega_document_title' );

function omega_front_page_metadata() {
\techo '<meta name="theme-color" content="#5E4C3B">' . "\\n";
\techo '<link rel="icon" href="' . esc_url( get_theme_file_uri( '/assets/aktualne-cropped.svg' ) ) . '" type="image/svg+xml">' . "\\n";
\tif ( ! is_front_page() ) return;
\techo '<meta name="description" content="Profesjonalne usługi księgowe dla firm i osób prywatnych w Jaworznie! Biuro Rachunkowe Omega Monika Glonek zaprasza!">' . "\\n";
\techo '<link rel="canonical" href="https://omega-mg.pl/">' . "\\n";
\techo '<meta property="og:title" content="Monika Glonek – Biuro Rachunkowe Omega MG">' . "\\n";
\techo '<meta property="og:description" content="Twoja rzetelna księgowość w Jaworznie. Obsługa księgowa, kadrowa i podatkowa.">' . "\\n";
\techo '<meta property="og:type" content="website">' . "\\n";
\techo '<meta property="og:locale" content="pl_PL">' . "\\n";
\techo '<meta property="og:url" content="https://omega-mg.pl/">' . "\\n";
\techo '<meta property="og:image" content="https://omega-mg.pl/wp-content/uploads/2025/08/dsc_1052-scaled.jpg">' . "\\n";
}
add_action( 'wp_head', 'omega_front_page_metadata', 2 );

// WooCommerce: własne style i szablon woocommerce.php zamiast domyślnych arkuszy i paska sortowania.
add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );
add_filter( 'woocommerce_show_page_title', '__return_false' );
add_filter( 'loop_shop_columns', function() { return 3; } );

function omega_woocommerce_setup() {
\tif ( ! class_exists( 'WooCommerce' ) ) return;
\tremove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
\tremove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
\tremove_action( 'woocommerce_archive_description', 'woocommerce_taxonomy_archive_description', 10 );
\tremove_action( 'woocommerce_archive_description', 'woocommerce_product_archive_description', 10 );
\tremove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40 );
\tremove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_product_data_tabs', 10 );
\tadd_action( 'woocommerce_shop_loop_item_title', 'omega_product_eyebrow', 9 );
\tadd_action( 'woocommerce_single_product_summary', 'omega_product_eyebrow', 4 );
\tadd_action( 'woocommerce_after_single_product_summary', 'omega_product_description', 10 );
}
add_action( 'init', 'omega_woocommerce_setup' );

function omega_product_eyebrow() {
\t$categories = wc_get_product_category_list( get_the_ID(), ', ' );
\tif ( '' === $categories ) return;
\t// Na liście produktów eyebrow jest wewnątrz linku, więc bez zagnieżdżonych odnośników.
\techo '<p class="eyebrow product-eyebrow">' . ( is_product() ? wp_kses_post( $categories ) : esc_html( wp_strip_all_tags( $categories ) ) ) . '</p>';
}

function omega_product_description() {
\t$content = get_the_content();
\tif ( '' === trim( $content ) ) return;
\techo '<section class="product-description"><p class="eyebrow"><span class="eyebrow-line"></span>Opis</p><div class="entry-content">' . apply_filters( 'the_content', $content ) . '</div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}

function omega_woocommerce_assets() {
\tif ( ! function_exists( 'is_woocommerce' ) || ! ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() ) ) return;
\t$css = get_theme_file_path( '/assets/css/woocommerce.css' );
\twp_enqueue_style( 'omega-woocommerce', get_theme_file_uri( '/assets/css/woocommerce.css' ), array( 'omega-site' ), (string) filemtime( $css ) );
}
add_action( 'wp_enqueue_scripts', 'omega_woocommerce_assets', 20 );

// Pusty koszyk: własna treść zamiast domyślnej ikonki i siatki bloku WooCommerce.
function omega_empty_cart_block( $content ) {
\t$arrow  = omega_arrow();
\t$markup = '<section class="empty-cart">'
\t\t. '<div class="empty-cart-intro"><p class="eyebrow"><span class="eyebrow-line"></span>Sklep Omega MG</p>'
\t\t. '<h2>Twój koszyk jest pusty<span class="red-dot">.</span></h2>'
\t\t. '<p>Materiały kupujesz raz i pobierasz od razu po opłaceniu. Zajrzyj do sklepu albo wróć na stronę główną.</p>'
\t\t. '<div class="empty-cart-actions"><a class="button" href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '">Przejdź do sklepu' . $arrow . '</a>'
\t\t. '<a class="text-link" href="' . esc_url( home_url( '/' ) ) . '">Strona główna' . $arrow . '</a></div></div>'
\t\t. '<div class="empty-cart-products"><div class="empty-cart-heading"><div><p class="eyebrow">Nowe w sklepie</p><h3>Zacznij od tych materiałów<span class="red-dot">.</span></h3></div>'
\t\t. '<a class="text-link" href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '">Wszystkie produkty' . $arrow . '</a></div>'
\t\t. do_shortcode( '[products limit="3" columns="3" orderby="date" order="DESC"]' ) . '</div></section>';
\treturn preg_replace( '/^(\\s*<div[^>]*>)[\\s\\S]*(<\\/div>\\s*)$/', '$1' . str_replace( '$', '\\\\$', $markup ) . '$2', $content );
}
add_filter( 'render_block_woocommerce/empty-cart-block', 'omega_empty_cart_block' );

// Kasa: krótka informacja nad formularzem, że produkt trafi automatycznie na e-mail. Nie na stronie potwierdzenia ani przy pustym koszyku.
function omega_checkout_badge( $content ) {
\tif ( is_wc_endpoint_url( 'order-received' ) || ! WC()->cart || WC()->cart->is_empty() ) return $content;
\treturn '<p class="checkout-badge"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7.5 9 6 9-6" /></svg><span>Po opłaceniu produkt trafi automatycznie na podany adres e-mail.</span></p>' . $content;
}
add_filter( 'render_block_woocommerce/checkout', 'omega_checkout_badge' );

// Ikona koszyka w nagłówku: zawsze w sklepie, poza nim tylko gdy koszyk nie jest pusty.
// Po najechaniu lub fokusie rozwija się mini-koszyk; na stronach koszyka i zamówienia jest zbędny.
function omega_cart_link() {
\tif ( ! function_exists( 'WC' ) || ! WC()->cart ) return;
\t$count = (int) WC()->cart->get_cart_contents_count();
\t$shop  = wp_doing_ajax() || is_woocommerce() || is_cart() || is_checkout() || is_account_page();
\tprintf(
\t\t'<div class="header-cart" data-count="%2$d"%4$s><a class="header-cart-link" href="%1$s" aria-label="%3$s"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5.5 8.5h13l-1 11h-11z" /><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" /></svg><span class="cart-count" aria-hidden="true">%2$d</span></a>',
\t\tesc_url( wc_get_cart_url() ),
\t\t$count,
\t\tesc_attr( sprintf( 'Koszyk, produktów: %d', $count ) ),
\t\t$count || $shop ? '' : ' hidden'
\t);
\tif ( ! ( is_cart() || is_checkout() ) ) omega_cart_panel();
\techo '</div>';
}

function omega_cart_panel() {
\t$items = WC()->cart->get_cart();
\techo '<div class="header-cart-panel"><div class="header-cart-card"><p class="eyebrow">Koszyk</p>';
\tif ( ! $items ) {
\t\techo '<p class="header-cart-empty">Twój koszyk jest pusty.</p>';
\t} else {
\t\techo '<ul class="header-cart-items">';
\t\tforeach ( $items as $cart_item ) {
\t\t\t$product = $cart_item['data'];
\t\t\tif ( ! $product || ! $product->exists() ) continue;
\t\t\tprintf(
\t\t\t\t'<li>%1$s<div><a href="%2$s">%3$s</a><span>%4$d × %5$s</span></div></li>',
\t\t\t\t$product->get_image( 'woocommerce_gallery_thumbnail' ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
\t\t\t\tesc_url( $product->get_permalink( $cart_item ) ),
\t\t\t\tesc_html( $product->get_name() ),
\t\t\t\t(int) $cart_item['quantity'],
\t\t\t\tWC()->cart->get_product_price( $product ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
\t\t\t);
\t\t}
\t\techo '</ul><p class="header-cart-total"><span>Razem</span><strong>' . WC()->cart->get_cart_subtotal() . '</strong></p>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
\t}
\tprintf(
\t\t'<div class="header-cart-actions"><a class="button button-small" href="%1$s">Zobacz koszyk</a>%2$s</div></div></div>',
\t\tesc_url( wc_get_cart_url() ),
\t\t$items ? '<a class="text-link" href="' . esc_url( wc_get_checkout_url() ) . '">Do kasy</a>' : ''
\t);
}

// Po dodaniu do koszyka przez AJAX WooCommerce podmienia ikonę świeżym HTML.
function omega_cart_fragments( $fragments ) {
\tob_start();
\tomega_cart_link();
\t$fragments['.header-cart'] = ob_get_clean();
\treturn $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'omega_cart_fragments' );

// Blokowy koszyk i zamówienie zmieniają zawartość bez przeładowania; licznik śledzi magazyn wc/store/cart.
function omega_cart_live_count() {
\tif ( ! function_exists( 'is_cart' ) || ! ( is_cart() || is_checkout() ) ) return;
\t?>
\t<script>
\t(function () {
\t\tfunction sync() {
\t\t\tvar store = window.wp && wp.data && wp.data.select( 'wc/store/cart' );
\t\t\tif ( ! store ) return;
\t\t\tvar count = store.getCartData().itemsCount;
\t\t\tdocument.querySelectorAll( '.header-cart' ).forEach( function ( cart ) {
\t\t\t\tcart.dataset.count = count;
\t\t\t\tcart.querySelector( '.cart-count' ).textContent = count;
\t\t\t\tcart.querySelector( '.header-cart-link' ).setAttribute( 'aria-label', 'Koszyk, produktów: ' + count );
\t\t\t} );
\t\t}
\t\twindow.addEventListener( 'load', function () {
\t\t\tif ( window.wp && wp.data ) { wp.data.subscribe( sync ); sync(); }
\t\t} );
\t})();
\t</script>
\t<?php
}
add_action( 'wp_footer', 'omega_cart_live_count', 100 );

// Kolumna „Sklep” w stopce: strony WooCommerce, a zwroty i regulamin dopiero po ich opublikowaniu.
function omega_footer_shop() {
\tif ( ! function_exists( 'wc_get_page_permalink' ) ) return;
\t$links = array(
\t\t'Sklep'      => wc_get_page_permalink( 'shop' ),
\t\t'Koszyk'     => wc_get_cart_url(),
\t\t'Moje konto' => wc_get_page_permalink( 'myaccount' ),
\t);
\tforeach ( array( 'refund_returns', 'terms' ) as $page ) {
\t\t$id = wc_get_page_id( $page );
\t\tif ( $id > 0 && 'publish' === get_post_status( $id ) ) $links[ get_the_title( $id ) ] = get_permalink( $id );
\t}
\techo '<div class="footer-shop"><h3>Sklep</h3><ul>';
\tforeach ( $links as $label => $url ) echo '<li><a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a></li>';
\techo '</ul></div>';
}

// Strzałka zamykająca każdy przycisk i link tekstowy, ta sama co w statycznym markupie.
function omega_arrow() {
\treturn '<span aria-hidden="true"><svg class="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" /></svg></span>';
}

// Baza wiedzy: wpisy WordPressa renderują index.php i single.php, style w blog.css ładowanym tylko tam.
function omega_blog_assets() {
\tif ( ! ( is_home() || is_singular( 'post' ) || is_category() || is_tag() || is_author() || is_date() || is_search() ) ) return;
\t$css = get_theme_file_path( '/assets/css/blog.css' );
\twp_enqueue_style( 'omega-blog', get_theme_file_uri( '/assets/css/blog.css' ), array( 'omega-site' ), (string) filemtime( $css ) );
}
add_action( 'wp_enqueue_scripts', 'omega_blog_assets', 20 );
add_filter( 'excerpt_length', function() { return 24; } );
add_filter( 'excerpt_more', function() { return '…'; } );

function omega_kb_page_url() {
\t$page = (int) get_option( 'page_for_posts' );
\treturn $page ? get_permalink( $page ) : home_url( '/baza-wiedzy/' );
}

function omega_reading_time() {
\t$words = count( preg_split( '/\\s+/u', trim( wp_strip_all_tags( get_the_content() ) ) ) );
\treturn sprintf( '%d min czytania', max( 1, (int) round( $words / 200 ) ) );
}

// Okruszki: Start / Baza wiedzy / bieżąca kategoria. Bez etykiety „Baza wiedzy” jest ostatnim elementem.
function omega_kb_breadcrumb( $label = '', $url = '' ) {
\t$sep = '<span aria-hidden="true">/</span>';
\techo '<nav class="eyebrow kb-breadcrumb" aria-label="Okruszki"><a href="' . esc_url( home_url( '/' ) ) . '">Start</a>' . $sep;
\tif ( '' === $label ) {
\t\techo '<span aria-current="page">Baza wiedzy</span></nav>';
\t\treturn;
\t}
\techo '<a href="' . esc_url( omega_kb_page_url() ) . '">Baza wiedzy</a>' . $sep;
\techo $url ? '<a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>' : '<span aria-current="page">' . esc_html( $label ) . '</span>';
\techo '</nav>';
}

// Karta artykułu na liście, w wynikach wyszukiwania i w sekcji „Czytaj także”.
function omega_post_card( $featured = false ) {
\t$link       = get_permalink();
\t$categories = get_the_category();
\t$category   = $categories ? $categories[0] : null;
\techo '<article class="kb-card' . ( $featured ? ' kb-card-featured' : '' ) . '">';
\techo '<a class="kb-card-media" href="' . esc_url( $link ) . '" tabindex="-1" aria-hidden="true">';
\tif ( has_post_thumbnail() ) {
\t\tthe_post_thumbnail( $featured ? 'large' : 'medium_large' );
\t} else {
\t\techo '<span class="kb-card-placeholder">' . esc_html( mb_substr( $category ? $category->name : get_the_title(), 0, 1 ) ) . '</span>';
\t}
\techo '</a><div class="kb-card-body"><p class="eyebrow">';
\tif ( $category ) echo '<a href="' . esc_url( get_category_link( $category ) ) . '">' . esc_html( $category->name ) . '</a><span aria-hidden="true">·</span>';
\techo '<time datetime="' . esc_attr( get_the_date( 'c' ) ) . '">' . esc_html( get_the_date() ) . '</time></p>';
\techo '<h3><a href="' . esc_url( $link ) . '">' . esc_html( get_the_title() ) . '</a></h3>';
\techo '<p>' . esc_html( get_the_excerpt() ) . '</p>';
\techo '<a class="text-link" href="' . esc_url( $link ) . '">Czytaj artykuł' . omega_arrow() . '</a></div></article>';
}
`;

const woocommercePhp = `<?php get_header(); ?>
<main id="content" class="section shop-page">
\t<div class="container">
\t\t<header class="shop-heading">
\t\t\t<div>
\t\t\t\t<?php woocommerce_breadcrumb( array( 'wrap_before' => '<nav class="eyebrow shop-breadcrumb" aria-label="Okruszki">', 'wrap_after' => '</nav>', 'delimiter' => '<span aria-hidden="true">/</span>', 'home' => 'Start' ) ); ?>
\t\t\t\t<?php if ( ! is_singular( 'product' ) ) : ?>
\t\t\t\t<h1><?php woocommerce_page_title(); ?><span class="red-dot">.</span></h1>
\t\t\t\t<?php endif; ?>
\t\t\t</div>
\t\t\t<?php
\t\t\t$omega_description = is_product_taxonomy() ? term_description() : ( is_shop() ? apply_filters( 'the_content', get_post_field( 'post_content', wc_get_page_id( 'shop' ) ) ) : '' );
\t\t\tif ( '' !== trim( wp_strip_all_tags( $omega_description ) ) ) echo '<div class="shop-description">' . wp_kses_post( $omega_description ) . '</div>';
\t\t\t?>
\t\t</header>
\t\t<?php if ( ! is_singular( 'product' ) ) : ?>
\t\t<nav class="shop-categories" aria-label="Kategorie produktów">
\t\t\t<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"<?php if ( is_shop() ) echo ' aria-current="page"'; ?>>Wszystkie</a>
\t\t\t<?php foreach ( get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true ) ) as $omega_term ) : ?>
\t\t\t<a href="<?php echo esc_url( get_term_link( $omega_term ) ); ?>"<?php if ( is_tax( 'product_cat', $omega_term->slug ) ) echo ' aria-current="page"'; ?>><?php echo esc_html( $omega_term->name ); ?></a>
\t\t\t<?php endforeach; ?>
\t\t</nav>
\t\t<script>document.querySelectorAll( '.shop-categories' ).forEach( function ( nav ) { var active = nav.querySelector( '[aria-current]' ); if ( active ) nav.scrollLeft = active.offsetLeft; } );</script>
\t\t<?php endif; ?>
\t\t<?php woocommerce_content(); ?>
\t</div>
</main>
<?php get_footer(); ?>
`;

// Lista bazy wiedzy: strona wpisów, kategorie, tagi, autor, data i wyszukiwanie (index.php jest dla nich fallbackiem).
const blogIndexPhp = `<?php
get_header();
$omega_title = 'Baza wiedzy';
$omega_crumb = '';
$omega_description = '';
if ( is_home() ) {
\t$omega_page = (int) get_option( 'page_for_posts' );
\tif ( $omega_page ) {
\t\t$omega_title       = get_the_title( $omega_page );
\t\t$omega_description = apply_filters( 'the_content', get_post_field( 'post_content', $omega_page ) );
\t}
} elseif ( is_category() || is_tag() ) {
\t$omega_title       = single_term_title( '', false );
\t$omega_crumb       = $omega_title;
\t$omega_description = term_description();
} elseif ( is_search() ) {
\t$omega_title       = 'Wyniki wyszukiwania';
\t$omega_crumb       = 'Szukaj';
\t$omega_description = '<p>' . sprintf( 'Fraza „%s”, znalezione artykuły: %d.', esc_html( get_search_query() ), (int) $wp_query->found_posts ) . '</p>';
} else {
\t$omega_title       = wp_strip_all_tags( get_the_archive_title() );
\t$omega_crumb       = $omega_title;
\t$omega_description = get_the_archive_description();
}
?>
<main id="content" class="section kb-page">
\t<div class="container">
\t\t<header class="kb-heading">
\t\t\t<div>
\t\t\t\t<?php omega_kb_breadcrumb( $omega_crumb ); ?>
\t\t\t\t<h1><?php echo esc_html( $omega_title ); ?><span class="red-dot">.</span></h1>
\t\t\t</div>
\t\t\t<?php if ( '' !== trim( wp_strip_all_tags( $omega_description ) ) ) echo '<div class="kb-description">' . wp_kses_post( $omega_description ) . '</div>'; ?>
\t\t</header>
\t\t<div class="kb-toolbar">
\t\t\t<nav class="kb-categories" aria-label="Kategorie">
\t\t\t\t<a href="<?php echo esc_url( omega_kb_page_url() ); ?>"<?php if ( is_home() ) echo ' aria-current="page"'; ?>>Wszystkie</a>
\t\t\t\t<?php foreach ( get_terms( array( 'taxonomy' => 'category', 'hide_empty' => true ) ) as $omega_term ) : ?>
\t\t\t\t<a href="<?php echo esc_url( get_term_link( $omega_term ) ); ?>"<?php if ( is_category( $omega_term->term_id ) ) echo ' aria-current="page"'; ?>><?php echo esc_html( $omega_term->name ); ?></a>
\t\t\t\t<?php endforeach; ?>
\t\t\t</nav>
\t\t\t<form class="kb-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
\t\t\t\t<input type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Szukaj w bazie wiedzy" aria-label="Szukaj w bazie wiedzy">
\t\t\t\t<input type="hidden" name="post_type" value="post">
\t\t\t\t<button type="submit" aria-label="Szukaj"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></button>
\t\t\t</form>
\t\t</div>
\t\t<script>document.querySelectorAll( '.kb-categories' ).forEach( function ( nav ) { var active = nav.querySelector( '[aria-current]' ); if ( active ) nav.scrollLeft = active.offsetLeft; } );</script>
\t\t<?php if ( have_posts() ) : ?>
\t\t<div class="kb-grid">
\t\t\t<?php while ( have_posts() ) : the_post(); omega_post_card( is_home() && ! is_paged() && 0 === $wp_query->current_post ); endwhile; ?>
\t\t</div>
\t\t<?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => 'Nowsze artykuły' . omega_arrow(), 'next_text' => 'Starsze artykuły' . omega_arrow(), 'screen_reader_text' => 'Strony bazy wiedzy', 'aria_label' => 'Strony bazy wiedzy' ) ); ?>
\t\t<?php else : ?>
\t\t<div class="kb-empty">
\t\t\t<p>Nic tu jeszcze nie ma. Spróbuj innej frazy albo przejrzyj wszystkie artykuły.</p>
\t\t\t<a class="text-link" href="<?php echo esc_url( omega_kb_page_url() ); ?>">Wszystkie artykuły<?php echo omega_arrow(); ?></a>
\t\t</div>
\t\t<?php endif; ?>
\t</div>
</main>
<?php get_footer(); ?>
`;

const singlePhp = `<?php
get_header();
the_post();
$omega_categories = get_the_category();
$omega_category   = $omega_categories ? $omega_categories[0] : null;
?>
<main id="content" class="kb-single">
\t<article <?php post_class( 'kb-article' ); ?>>
\t\t<header class="kb-hero">
\t\t\t<div class="container">
\t\t\t\t<?php omega_kb_breadcrumb( $omega_category ? $omega_category->name : '', $omega_category ? get_category_link( $omega_category ) : '' ); ?>
\t\t\t\t<h1><?php the_title(); ?><span class="red-dot">.</span></h1>
\t\t\t\t<p class="kb-meta">
\t\t\t\t\t<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
\t\t\t\t\t<span aria-hidden="true">·</span><span><?php echo esc_html( omega_reading_time() ); ?></span>
\t\t\t\t\t<?php if ( $omega_categories ) : ?><span aria-hidden="true">·</span><span><?php echo wp_kses_post( get_the_category_list( ', ' ) ); ?></span><?php endif; ?>
\t\t\t\t</p>
\t\t\t\t<?php if ( has_excerpt() ) : ?><p class="kb-lead"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
\t\t\t</div>
\t\t</header>
\t\t<?php if ( has_post_thumbnail() ) : ?>
\t\t<div class="container kb-cover"><?php the_post_thumbnail( 'large' ); ?></div>
\t\t<?php endif; ?>
\t\t<div class="container kb-body">
\t\t\t<div class="entry-content kb-content"><?php the_content(); ?></div>
\t\t\t<?php the_tags( '<p class="kb-tags"><span class="eyebrow">Tagi</span>', '', '</p>' ); ?>
\t\t\t<nav class="kb-adjacent" aria-label="Sąsiednie artykuły">
\t\t\t\t<div><?php previous_post_link( '%link', '<span class="eyebrow">Poprzedni artykuł</span><span class="kb-adjacent-title">%title</span>' ); ?></div>
\t\t\t\t<div><?php next_post_link( '%link', '<span class="eyebrow">Następny artykuł</span><span class="kb-adjacent-title">%title</span>' ); ?></div>
\t\t\t</nav>
\t\t</div>
\t</article>
\t<?php
\t$omega_related_args = array( 'post__not_in' => array( get_the_ID() ), 'posts_per_page' => 3, 'ignore_sticky_posts' => true, 'no_found_rows' => true );
\t$omega_related      = new WP_Query( $omega_related_args + array( 'category__in' => wp_list_pluck( $omega_categories, 'term_id' ) ) );
\tif ( ! $omega_related->have_posts() ) $omega_related = new WP_Query( $omega_related_args );
\tif ( $omega_related->have_posts() ) :
\t?>
\t<section class="section kb-related" aria-labelledby="kb-related-title">
\t\t<div class="container">
\t\t\t<div class="section-heading">
\t\t\t\t<div>
\t\t\t\t\t<p class="eyebrow"><span class="eyebrow-line"></span>Czytaj także</p>
\t\t\t\t\t<h2 id="kb-related-title">Więcej z bazy wiedzy<span class="red-dot">.</span></h2>
\t\t\t\t</div>
\t\t\t\t<a class="text-link" href="<?php echo esc_url( omega_kb_page_url() ); ?>">Wszystkie artykuły<?php echo omega_arrow(); ?></a>
\t\t\t</div>
\t\t\t<div class="kb-grid">
\t\t\t\t<?php while ( $omega_related->have_posts() ) : $omega_related->the_post(); omega_post_card(); endwhile; wp_reset_postdata(); ?>
\t\t\t</div>
\t\t</div>
\t</section>
\t<?php endif; ?>
\t<section class="section kb-cta" aria-labelledby="kb-cta-title">
\t\t<div class="container kb-cta-inner">
\t\t\t<div>
\t\t\t\t<p class="eyebrow"><span class="eyebrow-line"></span>Masz pytanie?</p>
\t\t\t\t<h2 id="kb-cta-title">Porozmawiajmy o Twojej księgowości<span class="red-dot">.</span></h2>
\t\t\t\t<p>Artykuły opisują zasady ogólne. Jeśli chcesz wiedzieć, jak wyglądają w Twojej firmie, umów krótką rozmowę albo policz orientacyjną cenę obsługi.</p>
\t\t\t</div>
\t\t\t<div class="kb-cta-actions">
\t\t\t\t<a class="button" href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>">Umów rozmowę<?php echo omega_arrow(); ?></a>
\t\t\t\t<a class="text-link" href="<?php echo esc_url( home_url( '/#kalkulator' ) ); ?>">Wycena online<?php echo omega_arrow(); ?></a>
\t\t\t</div>
\t\t</div>
\t</section>
</main>
<?php get_footer(); ?>
`;

const mainJs = app
  .replace('import { initCalculator } from "./calculator.js";\n', "")
  .replace(/const logos = document\.getElementById\("client-logos"\);[\s\S]*?updateCarousel\(\);\n\n/, `const logos = document.getElementById("client-logos");
const prev = document.getElementById("clients-prev");
const next = document.getElementById("clients-next");
if (logos && prev && next) {
  function updateCarousel() {
    prev.disabled = logos.scrollLeft < 4;
    next.disabled = logos.scrollLeft + logos.clientWidth >= logos.scrollWidth - 4;
  }
  function slide(direction) {
    logos.scrollBy({
      left: (direction * logos.clientWidth) / (innerWidth < 768 ? 2 : 4),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }
  prev.addEventListener("click", () => slide(-1));
  next.addEventListener("click", () => slide(1));
  logos.addEventListener("scroll", updateCarousel, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(updateCarousel).observe(logos);
  updateCarousel();
}

`)
  .replace(/const certificateButton = document\.getElementById\("load-certification"\);[\s\S]*?\}\);\n\ninitCalculator\(\);/, `const certificateButton = document.getElementById("load-certification");
const certificateHolder = document.getElementById("certification-widget");
if (certificateButton && certificateHolder) {
  certificateButton.addEventListener("click", () => {
    const open = certificateHolder.hidden;
    certificateHolder.hidden = !open;
    certificateButton.setAttribute("aria-expanded", String(open));
    certificateButton.textContent = open ? "Ukryj certyfikat" : "Pokaż certyfikat";
  });
}`);

const themeStyle = `/*
Theme Name: Omega
Description: Dedykowany motyw strony Omega MG.
Version: 1.0.0
Update URI: https://omega-mg.pl/
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: omega
*/
`;
const pagePhp = `<?php get_header(); ?>
<main id="content" class="section">
\t<div class="container content-page">
\t\t<?php while ( have_posts() ) : the_post(); ?>
\t\t\t<h1><?php the_title(); ?></h1>
\t\t\t<div class="entry-content"><?php the_content(); ?></div>
\t\t<?php endwhile; ?>
\t</div>
</main>
<?php get_footer(); ?>
`;
const notFoundPhp = `<?php get_header(); ?>
<main id="content" class="section">
\t<div class="container content-page">
\t\t<p class="eyebrow">404</p>
\t\t<h1>Nie znaleziono strony.</h1>
\t\t<p>Podany adres nie istnieje lub strona została przeniesiona.</p>
\t\t<p><a class="button" href="<?php echo esc_url( home_url( '/' ) ); ?>">Wróć na stronę główną</a></p>
\t</div>
</main>
<?php get_footer(); ?>
`;

await mkdir(join(theme, "assets", "css"), { recursive: true });
await mkdir(join(theme, "assets", "js"), { recursive: true });
await mkdir(join(plugin, "templates"), { recursive: true });
await mkdir(join(plugin, "assets"), { recursive: true });
await rm(join(theme, "assets", "assets"), { recursive: true, force: true });
await cp(join(root, "public", "assets"), join(theme, "assets"), { recursive: true });
await writeFile(join(theme, "style.css"), themeStyle);
await writeFile(join(theme, "functions.php"), functionsPhp);
await writeFile(join(theme, "header.php"), headerPhp);
await writeFile(join(theme, "footer.php"), footerPhp);
await writeFile(join(theme, "front-page.php"), `<?php get_header(); ?>\n${mainMarkup.trim()}\n<?php get_footer(); ?>\n`);
await writeFile(join(theme, "page.php"), pagePhp);
await writeFile(join(theme, "index.php"), blogIndexPhp);
await writeFile(join(theme, "single.php"), singlePhp);
await writeFile(join(theme, "404.php"), notFoundPhp);
await writeFile(join(theme, "woocommerce.php"), woocommercePhp);
await writeFile(join(theme, "assets", "css", "site.css"), css
  .replace(/url\((['"]?)assets\//g, "url($1../" ) + `
.content-page { max-width: 900px; }
.content-page h1 { margin-bottom: 28px; font-size: clamp(32px, 3.4vw, 44px); color: var(--brown); }
.header-cart { position: relative; display: inline-flex; flex-shrink: 0; }
.header-cart-link { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; color: var(--ink); }
.header-cart:hover .header-cart-link, .header-cart-link:focus-visible { color: var(--red); }
.header-cart-link svg { width: 22px; height: 22px; }
.header-cart .cart-count { position: absolute; top: 1px; right: -2px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--red); color: #fff; font-family: Poppins, sans-serif; font-size: 10px; font-weight: 500; line-height: 18px; text-align: center; }
.header-cart[data-count="0"] .cart-count { display: none; }
.desktop-nav .header-cart { margin-left: -6px; }
.header-inner > .header-cart { display: none; }
.header-cart-panel { position: absolute; top: 100%; right: -8px; z-index: 1; width: 340px; padding-top: 10px; opacity: 0; visibility: hidden; transform: translateY(6px); transition: opacity 0.18s, transform 0.18s, visibility 0s linear 0.18s; white-space: normal; text-align: left; }
.header-cart:hover .header-cart-panel, .header-cart:focus-within .header-cart-panel { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.header-cart-card { padding: 24px; background: #fff; border: 1px solid var(--line); border-radius: var(--radius); box-shadow: 0 16px 48px rgba(94, 76, 59, 0.14); }
.header-cart-card .eyebrow { margin-bottom: 14px; }
.header-cart-empty { font-size: 14px; color: var(--brown); }
.header-cart-items { list-style: none; margin: 0; padding: 0; max-height: 264px; overflow-y: auto; }
.header-cart-items li { display: flex; gap: 14px; align-items: center; padding: 12px 0; border-top: 1px solid var(--line); }
.header-cart-items li:first-child { border-top: 0; padding-top: 0; }
.header-cart-items img { width: 48px; height: 48px; flex-shrink: 0; object-fit: cover; border-radius: var(--radius); }
.header-cart-items div { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.header-cart-items a { font-family: Poppins, sans-serif; font-size: 14px; font-weight: 500; line-height: 1.35; letter-spacing: -0.01em; color: var(--ink); }
.header-cart-items a:hover { color: var(--red); }
.header-cart-items span { font-size: 12px; color: var(--brown); }
.header-cart-total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 12px; color: var(--brown); }
.header-cart-total strong { font-family: Poppins, sans-serif; font-size: 18px; font-weight: 500; letter-spacing: -0.02em; color: var(--ink); }
.header-cart-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 18px; }
.header-cart-actions .button { min-height: 40px; padding: 8px 16px; gap: 14px; font-size: 12px; }
.header-cart-actions .text-link { min-height: 40px; gap: 12px; font-size: 13px; }
@media (max-width: 1023px) { .header-inner > .header-cart { display: inline-flex; margin-left: -6px; } .header-cart-panel { display: none; } }
.entry-content > * + * { margin-top: 1.25em; }
.footer-grid:has(.footer-shop) { grid-template-columns: 1.6fr 1fr 1fr 1fr; }
@media (max-width: 1023px) { .footer-grid:has(.footer-shop) { grid-template-columns: 1.2fr 1fr; } .footer-grid:has(.footer-shop) .footer-brand { grid-row: 1 / 4; } }
@media (max-width: 767px) { .footer-grid:has(.footer-shop) { grid-template-columns: 1fr; } .footer-grid:has(.footer-shop) .footer-brand { grid-row: auto; } }
`);
await writeFile(join(theme, "assets", "js", "main.js"), mainJs);
await cp(join(root, "public", "navigation.js"), join(theme, "assets", "js", "navigation.js"));
await writeFile(join(plugin, "templates", "calculator.php"), `<?php defined( 'ABSPATH' ) || exit; ?>\n${calculatorMarkup}\n`);
await writeFile(join(plugin, "assets", "calculator.js"), `${calculator.trim()}\n\ninitCalculator();\n`);

console.log(`Zbudowano motyw: ${theme}`);
console.log(`Zaktualizowano assety wtyczki: ${plugin}`);
