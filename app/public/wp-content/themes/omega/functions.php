<?php
defined( 'ABSPATH' ) || exit;

function omega_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'woocommerce' );
}
add_action( 'after_setup_theme', 'omega_setup' );

function omega_assets() {
	$css = get_theme_file_path( '/assets/css/site.css' );
	$js  = get_theme_file_path( '/assets/js/main.js' );
	wp_enqueue_style( 'omega-site', get_theme_file_uri( '/assets/css/site.css' ), array(), (string) filemtime( $css ) );
	wp_enqueue_script( 'omega-site', get_theme_file_uri( '/assets/js/main.js' ), array(), (string) filemtime( $js ), true );
}
add_action( 'wp_enqueue_scripts', 'omega_assets' );

function omega_module_script( $tag, $handle, $src ) {
	if ( 'omega-site' !== $handle ) return $tag;
	return '<script type="module" src="' . esc_url( $src ) . '"></script>';
}
add_filter( 'script_loader_tag', 'omega_module_script', 10, 3 );

function omega_document_title( $title ) {
	return is_front_page() ? 'Księgowość Jaworzno – Monika Glonek | Biuro Rachunkowe Omega MG' : $title;
}
add_filter( 'pre_get_document_title', 'omega_document_title' );

function omega_front_page_metadata() {
	echo '<meta name="theme-color" content="#5E4C3B">' . "\n";
	echo '<link rel="icon" href="' . esc_url( get_theme_file_uri( '/assets/aktualne-cropped.svg' ) ) . '" type="image/svg+xml">' . "\n";
	if ( ! is_front_page() ) return;
	echo '<meta name="description" content="Profesjonalne usługi księgowe dla firm i osób prywatnych w Jaworznie! Biuro Rachunkowe Omega Monika Glonek zaprasza!">' . "\n";
	echo '<link rel="canonical" href="https://omega-mg.pl/">' . "\n";
	echo '<meta property="og:title" content="Monika Glonek – Biuro Rachunkowe Omega MG">' . "\n";
	echo '<meta property="og:description" content="Twoja rzetelna księgowość w Jaworznie. Obsługa księgowa, kadrowa i podatkowa.">' . "\n";
	echo '<meta property="og:type" content="website">' . "\n";
	echo '<meta property="og:locale" content="pl_PL">' . "\n";
	echo '<meta property="og:url" content="https://omega-mg.pl/">' . "\n";
	echo '<meta property="og:image" content="https://omega-mg.pl/wp-content/uploads/2025/08/dsc_1052-scaled.jpg">' . "\n";
}
add_action( 'wp_head', 'omega_front_page_metadata', 2 );

// WooCommerce: własne style i szablon woocommerce.php zamiast domyślnych arkuszy i paska sortowania.
add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );
add_filter( 'woocommerce_show_page_title', '__return_false' );
add_filter( 'loop_shop_columns', function() { return 3; } );

function omega_woocommerce_setup() {
	if ( ! class_exists( 'WooCommerce' ) ) return;
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
	remove_action( 'woocommerce_archive_description', 'woocommerce_taxonomy_archive_description', 10 );
	remove_action( 'woocommerce_archive_description', 'woocommerce_product_archive_description', 10 );
	remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40 );
	remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_product_data_tabs', 10 );
	add_action( 'woocommerce_shop_loop_item_title', 'omega_product_eyebrow', 9 );
	add_action( 'woocommerce_single_product_summary', 'omega_product_eyebrow', 4 );
	add_action( 'woocommerce_after_single_product_summary', 'omega_product_description', 10 );
}
add_action( 'init', 'omega_woocommerce_setup' );

function omega_product_eyebrow() {
	$categories = wc_get_product_category_list( get_the_ID(), ', ' );
	if ( '' === $categories ) return;
	// Na liście produktów eyebrow jest wewnątrz linku, więc bez zagnieżdżonych odnośników.
	echo '<p class="eyebrow product-eyebrow">' . ( is_product() ? wp_kses_post( $categories ) : esc_html( wp_strip_all_tags( $categories ) ) ) . '</p>';
}

function omega_product_description() {
	$content = get_the_content();
	if ( '' === trim( $content ) ) return;
	echo '<section class="product-description"><p class="eyebrow"><span class="eyebrow-line"></span>Opis</p><div class="entry-content">' . apply_filters( 'the_content', $content ) . '</div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}

function omega_woocommerce_assets() {
	if ( ! function_exists( 'is_woocommerce' ) || ! ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() ) ) return;
	$css = get_theme_file_path( '/assets/css/woocommerce.css' );
	wp_enqueue_style( 'omega-woocommerce', get_theme_file_uri( '/assets/css/woocommerce.css' ), array( 'omega-site' ), (string) filemtime( $css ) );
}
add_action( 'wp_enqueue_scripts', 'omega_woocommerce_assets', 20 );

// Pusty koszyk: własna treść zamiast domyślnej ikonki i siatki bloku WooCommerce.
function omega_empty_cart_block( $content ) {
	$arrow  = '<span aria-hidden="true"><svg class="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" /></svg></span>';
	$markup = '<section class="empty-cart">'
		. '<div class="empty-cart-intro"><p class="eyebrow"><span class="eyebrow-line"></span>Sklep Omega MG</p>'
		. '<h2>Twój koszyk jest pusty<span class="red-dot">.</span></h2>'
		. '<p>Materiały kupujesz raz i pobierasz od razu po opłaceniu. Zajrzyj do sklepu albo wróć na stronę główną.</p>'
		. '<div class="empty-cart-actions"><a class="button" href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '">Przejdź do sklepu' . $arrow . '</a>'
		. '<a class="text-link" href="' . esc_url( home_url( '/' ) ) . '">Strona główna' . $arrow . '</a></div></div>'
		. '<div class="empty-cart-products"><div class="empty-cart-heading"><div><p class="eyebrow">Nowe w sklepie</p><h3>Zacznij od tych materiałów<span class="red-dot">.</span></h3></div>'
		. '<a class="text-link" href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '">Wszystkie produkty' . $arrow . '</a></div>'
		. do_shortcode( '[products limit="3" columns="3" orderby="date" order="DESC"]' ) . '</div></section>';
	return preg_replace( '/^(\s*<div[^>]*>)[\s\S]*(<\/div>\s*)$/', '$1' . str_replace( '$', '\\$', $markup ) . '$2', $content );
}
add_filter( 'render_block_woocommerce/empty-cart-block', 'omega_empty_cart_block' );

// Ikona koszyka w nagłówku: zawsze w sklepie, poza nim tylko gdy koszyk nie jest pusty.
// Po najechaniu lub fokusie rozwija się mini-koszyk; na stronach koszyka i zamówienia jest zbędny.
function omega_cart_link() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) return;
	$count = (int) WC()->cart->get_cart_contents_count();
	$shop  = wp_doing_ajax() || is_woocommerce() || is_cart() || is_checkout() || is_account_page();
	printf(
		'<div class="header-cart" data-count="%2$d"%4$s><a class="header-cart-link" href="%1$s" aria-label="%3$s"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5.5 8.5h13l-1 11h-11z" /><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" /></svg><span class="cart-count" aria-hidden="true">%2$d</span></a>',
		esc_url( wc_get_cart_url() ),
		$count,
		esc_attr( sprintf( 'Koszyk, produktów: %d', $count ) ),
		$count || $shop ? '' : ' hidden'
	);
	if ( ! ( is_cart() || is_checkout() ) ) omega_cart_panel();
	echo '</div>';
}

function omega_cart_panel() {
	$items = WC()->cart->get_cart();
	echo '<div class="header-cart-panel"><div class="header-cart-card"><p class="eyebrow">Koszyk</p>';
	if ( ! $items ) {
		echo '<p class="header-cart-empty">Twój koszyk jest pusty.</p>';
	} else {
		echo '<ul class="header-cart-items">';
		foreach ( $items as $cart_item ) {
			$product = $cart_item['data'];
			if ( ! $product || ! $product->exists() ) continue;
			printf(
				'<li>%1$s<div><a href="%2$s">%3$s</a><span>%4$d × %5$s</span></div></li>',
				$product->get_image( 'woocommerce_gallery_thumbnail' ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				esc_url( $product->get_permalink( $cart_item ) ),
				esc_html( $product->get_name() ),
				(int) $cart_item['quantity'],
				WC()->cart->get_product_price( $product ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			);
		}
		echo '</ul><p class="header-cart-total"><span>Razem</span><strong>' . WC()->cart->get_cart_subtotal() . '</strong></p>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
	printf(
		'<div class="header-cart-actions"><a class="button button-small" href="%1$s">Zobacz koszyk</a>%2$s</div></div></div>',
		esc_url( wc_get_cart_url() ),
		$items ? '<a class="text-link" href="' . esc_url( wc_get_checkout_url() ) . '">Do kasy</a>' : ''
	);
}

// Po dodaniu do koszyka przez AJAX WooCommerce podmienia ikonę świeżym HTML.
function omega_cart_fragments( $fragments ) {
	ob_start();
	omega_cart_link();
	$fragments['.header-cart'] = ob_get_clean();
	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'omega_cart_fragments' );

// Blokowy koszyk i zamówienie zmieniają zawartość bez przeładowania; licznik śledzi magazyn wc/store/cart.
function omega_cart_live_count() {
	if ( ! function_exists( 'is_cart' ) || ! ( is_cart() || is_checkout() ) ) return;
	?>
	<script>
	(function () {
		function sync() {
			var store = window.wp && wp.data && wp.data.select( 'wc/store/cart' );
			if ( ! store ) return;
			var count = store.getCartData().itemsCount;
			document.querySelectorAll( '.header-cart' ).forEach( function ( cart ) {
				cart.dataset.count = count;
				cart.querySelector( '.cart-count' ).textContent = count;
				cart.querySelector( '.header-cart-link' ).setAttribute( 'aria-label', 'Koszyk, produktów: ' + count );
			} );
		}
		window.addEventListener( 'load', function () {
			if ( window.wp && wp.data ) { wp.data.subscribe( sync ); sync(); }
		} );
	})();
	</script>
	<?php
}
add_action( 'wp_footer', 'omega_cart_live_count', 100 );
