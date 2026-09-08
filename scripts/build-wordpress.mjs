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
    .replace(/href="#([a-zA-Z0-9_-]+)"/g, (_m, id) =>
      `href="<?php echo esc_url( home_url( '/#${id}' ) ); ?>"`)
    .replace(/href="(o-mnie|ksiegowosc-dla-jdg|pelna-ksiegowosc-spolek|kadry-i-place|ksef-dla-firm|zmiana-biura-rachunkowego|ksiegowosc-online|baza-wiedzy)"/g, (_m, slug) =>
      `href="<?php echo esc_url( home_url( '/${slug}/' ) ); ?>"`)
    .replace(/href="(sklep\/[^"]+)"/g, (_m, slug) =>
      `href="<?php echo esc_url( home_url( '/${slug}/' ) ); ?>"`);
}

const headerMarkup = rewriteMarkup(body.slice(0, mainStart));
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
await writeFile(join(theme, "assets", "css", "site.css"), css
  .replace(/url\((['"]?)assets\//g, "url($1../" ) + `
.content-page { max-width: 900px; }
.content-page h1 { margin-bottom: 28px; }
.entry-content > * + * { margin-top: 1.25em; }
`);
await writeFile(join(theme, "assets", "js", "main.js"), mainJs);
await cp(join(root, "public", "navigation.js"), join(theme, "assets", "js", "navigation.js"));
await writeFile(join(plugin, "templates", "calculator.php"), `<?php defined( 'ABSPATH' ) || exit; ?>\n${calculatorMarkup}\n`);
await writeFile(join(plugin, "assets", "calculator.js"), `${calculator.trim()}\n\ninitCalculator();\n`);

console.log(`Zbudowano motyw: ${theme}`);
console.log(`Zaktualizowano assety wtyczki: ${plugin}`);
