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

function rewriteMarkup(value) {
  return value
    .replace(/<script\b[^>]*\bsrc=["'](?:\.\/)?app\.js["'][^>]*>\s*<\/script>/gi, "")
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
  ?.replace('class="section calculator-section"', 'class="section calculator-section omega-calculator"');
if (!calculatorMarkup) throw new Error("Nie znaleziono sekcji kalkulatora.");
mainMarkup = rewriteMarkup(mainMarkup.replace(calculatorPattern, `<?php
if ( shortcode_exists( 'omega_calculator' ) ) {
\techo do_shortcode( '[omega_calculator]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
\techo '<section class="section calculator-section" id="kalkulator"><div class="container"><p>Kalkulator jest chwilowo niedostępny.</p></div></section>';
}
?>`));
const footerMarkup = rewriteMarkup(body.slice(mainEnd));

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

// Ikona koszyka w nagłówku: zawsze w sklepie, poza nim tylko gdy koszyk nie jest pusty.
function omega_cart_link() {
\tif ( ! function_exists( 'WC' ) || ! WC()->cart ) return;
\t$count = (int) WC()->cart->get_cart_contents_count();
\t$shop  = wp_doing_ajax() || is_woocommerce() || is_cart() || is_checkout() || is_account_page();
\tprintf(
\t\t'<a class="header-cart" href="%1$s" data-count="%2$d" aria-label="%3$s"%4$s><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5.5 8.5h13l-1 11h-11z" /><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" /></svg><span class="cart-count" aria-hidden="true">%2$d</span></a>',
\t\tesc_url( wc_get_cart_url() ),
\t\t$count,
\t\tesc_attr( sprintf( 'Koszyk, produktów: %d', $count ) ),
\t\t$count || $shop ? '' : ' hidden'
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
\t\t\tdocument.querySelectorAll( '.header-cart' ).forEach( function ( link ) {
\t\t\t\tlink.dataset.count = count;
\t\t\t\tlink.querySelector( '.cart-count' ).textContent = count;
\t\t\t\tlink.setAttribute( 'aria-label', 'Koszyk, produktów: ' + count );
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
\t\t<?php endif; ?>
\t\t<?php woocommerce_content(); ?>
\t</div>
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
await writeFile(join(theme, "index.php"), pagePhp);
await writeFile(join(theme, "404.php"), notFoundPhp);
await writeFile(join(theme, "woocommerce.php"), woocommercePhp);
await writeFile(join(theme, "assets", "css", "site.css"), css
  .replace(/url\((['"]?)assets\//g, "url($1../" ) + `
.content-page { max-width: 900px; }
.content-page h1 { margin-bottom: 28px; font-size: clamp(32px, 3.4vw, 44px); color: var(--brown); }
.header-cart { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; flex-shrink: 0; color: var(--ink); }
.header-cart:hover, .header-cart:focus-visible { color: var(--red); }
.header-cart svg { width: 22px; height: 22px; }
.header-cart .cart-count { position: absolute; top: 1px; right: -2px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--red); color: #fff; font-family: Poppins, sans-serif; font-size: 10px; font-weight: 500; line-height: 18px; text-align: center; }
.header-cart[data-count="0"] .cart-count { display: none; }
.desktop-nav .header-cart { margin-left: -6px; }
.header-inner > .header-cart { display: none; }
@media (max-width: 1023px) { .header-inner > .header-cart { display: inline-flex; margin-left: -6px; } }
.entry-content > * + * { margin-top: 1.25em; }
`);
await writeFile(join(theme, "assets", "js", "main.js"), mainJs);
await cp(join(root, "public", "navigation.js"), join(theme, "assets", "js", "navigation.js"));
await writeFile(join(plugin, "templates", "calculator.php"), `<?php defined( 'ABSPATH' ) || exit; ?>\n${calculatorMarkup}\n`);
await writeFile(join(plugin, "assets", "calculator.js"), `${calculator.trim()}\n\ninitCalculator();\n`);

console.log(`Zbudowano motyw: ${theme}`);
console.log(`Zaktualizowano assety wtyczki: ${plugin}`);
