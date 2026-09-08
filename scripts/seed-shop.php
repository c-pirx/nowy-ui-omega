<?php
/**
 * Polska konfiguracja WooCommerce oraz przykładowe kategorie i produkty.
 * Uruchomienie (LocalWP): wp eval-file scripts/seed-shop.php --path=app/public
 * Skrypt jest idempotentny: istniejące kategorie i produkty aktualizuje po slugu.
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	WP_CLI::error( 'WooCommerce nie jest aktywny.' );
}

require_once ABSPATH . 'wp-admin/includes/image.php';

// Ustawienia sklepu.
$omega_options = array(
	'WPLANG'                          => 'pl_PL',
	'timezone_string'                 => 'Europe/Warsaw',
	'date_format'                     => 'j F Y',
	'time_format'                     => 'H:i',
	'woocommerce_currency'            => 'PLN',
	'woocommerce_currency_pos'        => 'right_space',
	'woocommerce_price_thousand_sep'  => ' ',
	'woocommerce_price_decimal_sep'   => ',',
	'woocommerce_price_num_decimals'  => '2',
	'woocommerce_default_country'     => 'PL',
	'woocommerce_store_address'       => 'ul. Heleny i Jana Prześlaków 15C',
	'woocommerce_store_city'          => 'Jaworzno',
	'woocommerce_store_postcode'      => '43-600',
	'woocommerce_enable_reviews'      => 'no',
	'woocommerce_coming_soon'         => 'no',
	'woocommerce_enable_guest_checkout' => 'yes',
	'woocommerce_permalinks'          => array(
		'product_base'           => '/produkt',
		'category_base'          => 'kategoria-produktu',
		'tag_base'               => 'tag-produktu',
		'attribute_base'         => '',
		'use_verbose_page_rules' => false,
	),
	'woocommerce_onboarding_profile'  => array( 'skipped' => true ),
	'woocommerce_bacs_settings'       => array(
		'enabled'      => 'yes',
		'title'        => 'Przelew bankowy',
		'description'  => 'Dane do przelewu wyślemy w potwierdzeniu zamówienia. Materiały udostępnimy po zaksięgowaniu wpłaty.',
		'instructions' => '',
	),
);
foreach ( $omega_options as $key => $value ) {
	update_option( $key, $value );
}

// Polskie nazwy i adresy stron WooCommerce.
$omega_pages = array(
	'shop'           => array( 'Sklep', 'sklep' ),
	'cart'           => array( 'Koszyk', 'koszyk' ),
	'checkout'       => array( 'Zamówienie', 'zamowienie' ),
	'myaccount'      => array( 'Moje konto', 'moje-konto' ),
	'refund_returns' => array( 'Zwroty i reklamacje', 'zwroty-i-reklamacje' ),
);
foreach ( $omega_pages as $page => $names ) {
	$id = wc_get_page_id( $page );
	if ( $id > 0 ) {
		wp_update_post( array( 'ID' => $id, 'post_title' => $names[0], 'post_name' => $names[1] ) );
	}
}
// WooCommerce zapisał bloki koszyka i zamówienia w języku z chwili instalacji; odtwórz je w aktywnym języku.
foreach ( array( 'cart' => 'get_cart_block_content', 'checkout' => 'get_checkout_block_content' ) as $page => $method ) {
	$id = wc_get_page_id( $page );
	if ( $id > 0 && method_exists( 'WC_Install', $method ) ) {
		$generator = new ReflectionMethod( 'WC_Install', $method );
		$generator->setAccessible( true );
		wp_update_post( array( 'ID' => $id, 'post_content' => $generator->invoke( null ) ) );
	}
}
$shop_id = wc_get_page_id( 'shop' );
if ( $shop_id > 0 && '' === trim( get_post_field( 'post_content', $shop_id ) ) ) {
	wp_update_post( array(
		'ID'           => $shop_id,
		'post_content' => '<p>Materiały, z których na co dzień korzystamy w biurze: e-booki, wzory dokumentów i checklisty. Kupujesz raz, pobierasz od razu po opłaceniu.</p>',
	) );
}
$default_cat = (int) get_option( 'default_product_cat' );
if ( $default_cat ) {
	wp_update_term( $default_cat, 'product_cat', array( 'name' => 'Bez kategorii', 'slug' => 'bez-kategorii' ) );
}

// Kategorie i produkty przykładowe. Zdjęcia pochodzą z assetów motywu.
$omega_catalog = array(
	array(
		'category' => array(
			'name'        => 'E-booki dla księgowych',
			'slug'        => 'e-booki-dla-ksiegowych',
			'description' => 'Praktyczne opracowania dla biur rachunkowych i samodzielnych księgowych. Konkretne procedury zamiast teorii.',
		),
		'product'  => array(
			'name'        => 'KSeF w praktyce biura rachunkowego',
			'slug'        => 'ksef-w-praktyce-biura-rachunkowego',
			'price'       => '89',
			'sale'        => '',
			'short'       => 'E-book PDF, 96 stron. Wdrożenie Krajowego Systemu e-Faktur w biurze krok po kroku: uprawnienia, obieg dokumentów, kontrola i najczęstsze błędy.',
			'description' => "<p>Opracowanie powstało na podstawie wdrożeń w Omega MG i u naszych klientów. Zamiast streszczać przepisy, pokazuje, jak ułożyć pracę biura tak, aby faktury z KSeF trafiały do księgowania bez ręcznego przepisywania.</p>\n<h3>Co znajdziesz w środku</h3>\n<ul>\n<li>Nadawanie i odbieranie uprawnień dla biura i pracowników klienta.</li>\n<li>Obieg faktury od wystawienia do zaksięgowania, z podziałem ról.</li>\n<li>Checklista kontroli faktur odrzuconych i duplikatów.</li>\n<li>Wzory komunikatów do klientów przed startem obowiązkowego KSeF.</li>\n</ul>\n<p>Format: PDF, dostęp natychmiast po opłaceniu. Aktualizacje do końca roku w cenie.</p>",
			'image'       => 'crop-woman-using-calculator-and-taking-notes-on-paper.jpg',
		),
	),
	array(
		'category' => array(
			'name'        => 'E-booki dla przedsiębiorców',
			'slug'        => 'e-booki-dla-przedsiebiorcow',
			'description' => 'Zrozumiałe przewodniki dla osób, które prowadzą firmę i chcą świadomie rozmawiać z księgową.',
		),
		'product'  => array(
			'name'        => 'Pierwsza firma bez stresu. JDG krok po kroku',
			'slug'        => 'pierwsza-firma-bez-stresu',
			'price'       => '59',
			'sale'        => '',
			'short'       => 'E-book PDF, 72 strony. Od rejestracji w CEIDG po pierwszy podatek: formy opodatkowania, ZUS, faktury i terminy, których trzeba pilnować.',
			'description' => "<p>Przewodnik dla osób, które właśnie zakładają jednoosobową działalność albo prowadzą ją od kilku miesięcy i chcą uporządkować podstawy.</p>\n<h3>Co znajdziesz w środku</h3>\n<ul>\n<li>Porównanie ryczałtu, skali i podatku liniowego na przykładach.</li>\n<li>Ulga na start, mały ZUS i preferencyjne składki w praktyce.</li>\n<li>Kalendarz terminów podatkowych na pierwszy rok.</li>\n<li>Lista dokumentów, które co miesiąc dostarczasz do biura.</li>\n</ul>\n<p>Format: PDF, dostęp natychmiast po opłaceniu.</p>",
			'image'       => 'heap-of-american-money-cash-and-vintage-light-box.jpg',
		),
	),
	array(
		'category' => array(
			'name'        => 'Wzory i checklisty',
			'slug'        => 'wzory-i-checklisty',
			'description' => 'Gotowe do użycia pliki DOCX i XLSX, sprawdzone w codziennej pracy biura.',
		),
		'product'  => array(
			'name'        => 'Checklista zamknięcia miesiąca i wzory dokumentów',
			'slug'        => 'checklista-zamkniecia-miesiaca',
			'price'       => '39',
			'sale'        => '',
			'short'       => 'Pakiet 12 plików DOCX i XLSX: checklista zamknięcia miesiąca, wzór umowy zlecenia, ewidencja przebiegu pojazdu i nota korygująca.',
			'description' => "<p>Zestaw dokumentów, które w biurze wykorzystujemy przy comiesięcznym zamykaniu ksiąg u klientów. Każdy plik ma krótką instrukcję wypełniania.</p>\n<h3>Zawartość pakietu</h3>\n<ul>\n<li>Checklista zamknięcia miesiąca dla JDG i spółki z o.o.</li>\n<li>Umowa zlecenia i umowa o dzieło z rachunkiem.</li>\n<li>Ewidencja przebiegu pojazdu oraz kilometrówka w XLSX.</li>\n<li>Nota korygująca i nota księgowa.</li>\n</ul>\n<p>Format: DOCX i XLSX, pliki edytowalne. Dostęp natychmiast po opłaceniu.</p>",
			'image'       => 'crop-payroll-clerk-counting-money-while-sitting-at-table.jpg',
		),
	),
	array(
		'category' => array(
			'name'        => 'Pakiety materiałów',
			'slug'        => 'pakiety-materialow',
			'description' => 'Zestawy e-booków i wzorów w niższej cenie niż osobno.',
		),
		'product'  => array(
			'name'        => 'Pakiet startowy przedsiębiorcy',
			'slug'        => 'pakiet-startowy-przedsiebiorcy',
			'price'       => '129',
			'sale'        => '99',
			'short'       => 'Dwa e-booki i komplet wzorów w jednym pakiecie. Wszystko, czego potrzebujesz w pierwszym roku prowadzenia firmy.',
			'description' => "<p>Pakiet łączy przewodnik „Pierwsza firma bez stresu”, e-book o KSeF oraz pełny zestaw wzorów i checklist. To komplet materiałów, który dajemy nowym klientom biura na start.</p>\n<h3>W pakiecie</h3>\n<ul>\n<li>Pierwsza firma bez stresu. JDG krok po kroku (PDF).</li>\n<li>KSeF w praktyce biura rachunkowego (PDF).</li>\n<li>Checklista zamknięcia miesiąca i wzory dokumentów (DOCX, XLSX).</li>\n</ul>\n<p>Dostęp natychmiast po opłaceniu. Aktualizacje do końca roku w cenie.</p>",
			'image'       => 'dsc_1052-1024x684.jpg',
		),
	),
);

$assets = trailingslashit( get_theme_file_path( '/assets' ) );

foreach ( $omega_catalog as $entry ) {
	$category = $entry['category'];
	$term     = term_exists( $category['slug'], 'product_cat' );
	if ( ! $term ) {
		$term = wp_insert_term( $category['name'], 'product_cat', array( 'slug' => $category['slug'], 'description' => $category['description'] ) );
	} else {
		wp_update_term( (int) $term['term_id'], 'product_cat', array( 'name' => $category['name'], 'description' => $category['description'] ) );
	}
	if ( is_wp_error( $term ) ) {
		WP_CLI::error( $term->get_error_message() );
	}
	$term_id = (int) $term['term_id'];

	$data     = $entry['product'];
	$existing = get_page_by_path( $data['slug'], OBJECT, 'product' );
	$product  = $existing ? wc_get_product( $existing->ID ) : new WC_Product_Simple();
	$product->set_name( $data['name'] );
	$product->set_slug( $data['slug'] );
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'visible' );
	$product->set_regular_price( $data['price'] );
	$product->set_sale_price( $data['sale'] );
	$product->set_short_description( $data['short'] );
	$product->set_description( $data['description'] );
	$product->set_virtual( true );
	$product->set_sold_individually( true );
	$product->set_reviews_allowed( false );
	$product->set_category_ids( array( $term_id ) );
	$product_id = $product->save();

	if ( ! $product->get_image_id() ) {
		$source = $assets . $data['image'];
		if ( ! is_readable( $source ) ) {
			WP_CLI::warning( 'Brak zdjęcia: ' . $source );
		} else {
			$upload = wp_upload_bits( $data['slug'] . '.jpg', null, file_get_contents( $source ) );
			if ( empty( $upload['error'] ) ) {
				$attachment_id = wp_insert_attachment(
					array( 'post_mime_type' => 'image/jpeg', 'post_title' => $data['name'], 'post_status' => 'inherit' ),
					$upload['file'],
					$product_id
				);
				wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );
				$product->set_image_id( $attachment_id );
				$product->save();
			} else {
				WP_CLI::warning( $upload['error'] );
			}
		}
	}

	WP_CLI::log( sprintf( '%s -> %s (#%d, %s zł)', $category['name'], $data['name'], $product_id, $data['sale'] ? $data['sale'] : $data['price'] ) );
}

flush_rewrite_rules();
WP_CLI::success( 'Sklep skonfigurowany po polsku, produkty przykładowe gotowe.' );
