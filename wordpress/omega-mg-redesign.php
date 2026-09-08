<?php
/**
 * Plugin Name: Omega MG — odświeżona strona główna
 * Description: Odwracalny szablon strony głównej. Zachowuje istniejący WordPress, treść Elementor oraz serwerowy kalkulator Omega MG.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Omega MG
 * Text Domain: omega-mg-redesign
 */

defined( 'ABSPATH' ) || exit;

define( 'OMEGA_MG_REDESIGN_DIR', plugin_dir_path( __FILE__ ) );
define( 'OMEGA_MG_REDESIGN_URL', plugin_dir_url( __FILE__ ) );

add_action( 'admin_menu', 'omega_mg_redesign_admin_menu' );
add_action( 'admin_init', 'omega_mg_redesign_register_settings' );
add_filter( 'template_include', 'omega_mg_redesign_template', 99 );
add_action( 'wp_ajax_omega_kalk_lead', 'omega_mg_redesign_prepare_confirmation', -9999 );
add_action( 'wp_ajax_nopriv_omega_kalk_lead', 'omega_mg_redesign_prepare_confirmation', -9999 );

/** Extend the original handler's email, after that handler validates the request.
 * The original plugin still owns nonce/consent checks, delivery and the response.
 * Merely posting an extra field would otherwise risk silently losing the message.
 */
function omega_mg_redesign_prepare_confirmation() {
	if ( ! get_option( 'omega_mg_redesign_enabled', false ) || ! isset( $_POST['omega_redesign_confirmation'] ) || '1' !== $_POST['omega_redesign_confirmation'] ) {
		return;
	}
	add_filter( 'wp_mail', 'omega_mg_redesign_confirmation_mail', 20 );
}

function omega_mg_redesign_confirmation_mail( $mail ) {
	$lines = array( '', 'Wynik kalkulatora do potwierdzenia', 'Orientacyjna wycena klienta, wymaga potwierdzenia przez biuro.' );
	$labels = array(
		'forma' => 'Forma działalności', 'rodzaj' => 'Rodzaj księgowości',
		'dokumenty' => 'Dokumenty / miesiąc', 'pracUop' => 'Pracownicy UoP',
		'pracUoz' => 'Pracownicy UoZ', 'vat' => 'VAT (1 = tak, 0 = nie)',
		'eksport' => 'Eksport/import (1 = tak, 0 = nie)',
	);
	foreach ( $labels as $key => $label ) {
		if ( isset( $_POST[ $key ] ) && is_string( $_POST[ $key ] ) ) {
			$lines[] = $label . ': ' . sanitize_text_field( wp_unslash( substr( $_POST[ $key ], 0, 100 ) ) );
		}
	}
	if ( isset( $_POST['total'] ) && is_string( $_POST['total'] ) && is_numeric( $_POST['total'] ) ) {
		$lines[] = 'Wynik pokazany klientowi: od ' . number_format_i18n( (float) $_POST['total'], 0 ) . ' zł netto/mies.';
	}
	$message = isset( $_POST['wiadomosc'] ) && is_string( $_POST['wiadomosc'] ) ? sanitize_textarea_field( wp_unslash( $_POST['wiadomosc'] ) ) : '';
	$message = function_exists( 'mb_substr' ) ? mb_substr( $message, 0, 3000 ) : substr( $message, 0, 3000 );
	$lines[] = '';
	$lines[] = 'Wiadomość klienta:';
	$lines[] = '' !== $message ? $message : '(nie dodano wiadomości)';
	$appendix = implode( "\n", $lines );
	$headers = isset( $mail['headers'] ) ? $mail['headers'] : '';
	$headers = is_array( $headers ) ? implode( "\n", $headers ) : $headers;
	$content_type = apply_filters( 'wp_mail_content_type', 'text/plain' );
	if ( preg_match( '/Content-Type:\s*([^;\r\n]+)/i', $headers, $match ) ) {
		$content_type = trim( $match[1] );
	}
	if ( false !== stripos( $content_type, 'text/html' ) ) {
		$appendix = '<div>' . nl2br( esc_html( $appendix ) ) . '</div>';
		if ( false !== stripos( $mail['message'], '</body>' ) ) {
			$mail['message'] = preg_replace_callback( '~</body>~i', static function () use ( $appendix ) { return $appendix . '</body>'; }, $mail['message'], 1 );
			return $mail;
		}
	}
	$mail['message'] .= "\n" . $appendix;
	return $mail;
}

function omega_mg_redesign_admin_menu() {
	add_options_page( 'Omega MG — redesign', 'Omega MG — redesign', 'manage_options', 'omega-mg-redesign', 'omega_mg_redesign_settings_page' );
}

function omega_mg_redesign_register_settings() {
	register_setting( 'omega_mg_redesign', 'omega_mg_redesign_enabled', array(
		'type'              => 'boolean',
		'default'           => false,
		'sanitize_callback' => 'omega_mg_redesign_boolean',
	) );
}

function omega_mg_redesign_boolean( $value ) {
	return ! empty( $value );
}

function omega_mg_redesign_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1>Omega MG — odświeżona strona główna</h1>
		<p>Włączenie zastępuje wyłącznie publiczny szablon strony głównej. Oryginalna treść, Elementor, pozostałe podstrony i wtyczka kalkulatora pozostają w WordPressie.</p>
		<p>Najpierw sprawdź kopię testową strony z aktywną wtyczką <code>omega-kalkulator</code>. Dane i nonce kalkulatora muszą pochodzić z jej bieżącej konfiguracji.</p>
		<form action="options.php" method="post">
			<?php settings_fields( 'omega_mg_redesign' ); ?>
			<input type="hidden" name="omega_mg_redesign_enabled" value="0">
			<label><input type="checkbox" name="omega_mg_redesign_enabled" value="1" <?php checked( (bool) get_option( 'omega_mg_redesign_enabled', false ) ); ?>> Włącz odświeżony szablon strony głównej</label>
			<?php submit_button(); ?>
		</form>
		<p>Aby przywrócić poprzedni wygląd, wyłącz powyższą opcję lub dezaktywuj tę wtyczkę, a następnie wyczyść pamięć podręczną strony.</p>
	</div>
	<?php
}

/** Select the replacement only when its files and original front-page post are available. */
function omega_mg_redesign_template( $template ) {
	if ( is_admin() || ! is_front_page() || is_feed() || is_embed() || is_preview() || ! get_option( 'omega_mg_redesign_enabled', false ) ) {
		return $template;
	}
	foreach ( array( 'public/index.html', 'public/styles.css', 'public/app.js', 'public/calculator.js', 'template.php' ) as $relative_path ) {
		if ( ! is_readable( OMEGA_MG_REDESIGN_DIR . $relative_path ) ) {
			return $template;
		}
	}
	$document = file_get_contents( OMEGA_MG_REDESIGN_DIR . 'public/index.html' );
	if ( ! is_string( $document ) || ! preg_match( '~<body\b[^>]*>(.*?)</body>~is', $document, $match ) ) {
		return $template;
	}

	$post = get_queried_object();
	if ( ! ( $post instanceof WP_Post ) || post_password_required( $post ) ) {
		return $template;
	}

	$GLOBALS['omega_mg_redesign_body'] = $match[1];
	$GLOBALS['omega_mg_redesign_original_post'] = $post;
	add_action( 'wp_enqueue_scripts', 'omega_mg_redesign_enqueue', PHP_INT_MAX );
	add_action( 'wp_print_styles', 'omega_mg_redesign_dequeue_styles', PHP_INT_MAX );
	add_action( 'wp_print_scripts', 'omega_mg_redesign_transfer_calculator', PHP_INT_MAX );
	// WP's footer printer runs at priority 10; transfer just before it.
	add_action( 'wp_print_footer_scripts', 'omega_mg_redesign_transfer_calculator', 9 );
	add_action( 'wp_print_footer_scripts', 'omega_mg_redesign_dequeue_styles', 9 );
	add_filter( 'script_loader_tag', 'omega_mg_redesign_module_tag', 10, 3 );
	return OMEGA_MG_REDESIGN_DIR . 'template.php';
}

/** Run after normal plugin asset registration, before WordPress prints those assets. */
function omega_mg_redesign_prime_original_content() {
	static $primed = false;
	if ( $primed || empty( $GLOBALS['omega_mg_redesign_original_post'] ) ) {
		return;
	}
	$primed = true;
	$post = $GLOBALS['omega_mg_redesign_original_post'];
	// Elementor resolves its document through get_the_ID(), so explicitly provide
	// the front-page context and restore every WordPress post global afterwards.
	$post_globals = array( 'post', 'id', 'authordata', 'currentday', 'currentmonth', 'page', 'pages', 'multipage', 'more', 'numpages' );
	$saved_globals = array();
	foreach ( $post_globals as $name ) {
		$saved_globals[ $name ] = array( array_key_exists( $name, $GLOBALS ), isset( $GLOBALS[ $name ] ) ? $GLOBALS[ $name ] : null );
	}
	// Standard the_content filters invoke the existing Elementor/shortcode pipeline.
	// Its output is discarded; its current script registration and nonce are retained.
	// No guessed shortcode, nonce action, database update or alternate AJAX handler.
	$buffer_level = ob_get_level();
	ob_start();
	try {
		$GLOBALS['post'] = $post;
		setup_postdata( $post );
		apply_filters( 'the_content', $post->post_content );
	} catch ( Throwable $error ) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'Omega MG redesign: original content could not supply calculator configuration. ' . $error->getMessage() );
		}
	} finally {
		while ( ob_get_level() > $buffer_level ) {
			ob_end_clean();
		}
		foreach ( $saved_globals as $name => $saved ) {
			if ( $saved[0] ) {
				$GLOBALS[ $name ] = $saved[1];
			} else {
				unset( $GLOBALS[ $name ] );
			}
		}
	}
}

function omega_mg_redesign_enqueue() {
	omega_mg_redesign_prime_original_content();
	wp_enqueue_style( 'omega-mg-redesign', OMEGA_MG_REDESIGN_URL . 'public/styles.css', array(), (string) filemtime( OMEGA_MG_REDESIGN_DIR . 'public/styles.css' ) );
	wp_enqueue_script( 'omega-mg-redesign', OMEGA_MG_REDESIGN_URL . 'public/app.js', array(), (string) filemtime( OMEGA_MG_REDESIGN_DIR . 'public/app.js' ), true );
	wp_add_inline_script( 'omega-mg-redesign', 'window.OmegaMGConfirmation = { enabled: true };', 'before' );
	omega_mg_redesign_transfer_calculator();
	omega_mg_redesign_dequeue_styles();
}

/** Remove only known page-layout CSS; consent, SEO and third-party plugin hooks remain. */
function omega_mg_redesign_dequeue_styles() {
	$handles = array(
		'astra-theme-css', 'astra-google-fonts',
		'hfe-style', 'hfe-widgets-style', 'hfe-elementor-icons', 'hfe-icons-list',
		'hfe-social-icons', 'hfe-social-share-icons-brands', 'hfe-social-share-icons-fontawesome', 'hfe-nav-menu-icons',
		'elementor-frontend', 'elementor-post-333', 'elementor-post-127', 'elementor-post-479',
		'elementor-gf-local-roboto', 'elementor-gf-local-robotoslab',
		'widget-heading', 'widget-divider', 'widget-image', 'widget-icon-list', 'widget-icon-box',
		'widget-image-carousel', 'widget-social-icons', 'e-animation-grow', 'e-animation-pulse', 'e-apple-webkit', 'swiper', 'e-swiper',
	);
	foreach ( $handles as $handle ) {
		wp_dequeue_style( $handle );
	}
}

/** Preserve fresh, server-authored config attached to the original calculator handle. */
function omega_mg_redesign_transfer_calculator() {
	static $transferred = array();
	$scripts = wp_scripts();
	$fragments = array();
	$data = $scripts->get_data( 'omega-kalk-js', 'data' );
	if ( is_string( $data ) ) {
		$fragments[] = $data;
	}
	foreach ( array( 'before', 'after' ) as $position ) {
		$inline = $scripts->get_data( 'omega-kalk-js', $position );
		if ( is_array( $inline ) ) {
			$fragments = array_merge( $fragments, $inline );
		}
	}
	foreach ( $fragments as $fragment ) {
		if ( ! is_string( $fragment ) || false === strpos( $fragment, 'OmegaKalkData' ) ) {
			continue;
		}
		$key = hash( 'sha256', $fragment );
		if ( ! isset( $transferred[ $key ] ) && wp_add_inline_script( 'omega-mg-redesign', $fragment, 'before' ) ) {
			$transferred[ $key ] = true;
		}
	}
	wp_dequeue_script( 'omega-kalk-js' );
}

function omega_mg_redesign_module_tag( $tag, $handle, $src ) {
	if ( 'omega-mg-redesign' !== $handle ) {
		return $tag;
	}
	// WordPress may pass inline-before + external + inline-after as one string.
	// Only the matching external entry is a module; inline configuration must stay
	// classic JavaScript so `var OmegaKalkData` remains visible on window.
	return preg_replace_callback( '~<script\b[^>]*>~i', function ( $match ) use ( $src ) {
		$opening_tag = $match[0];
		if ( ! preg_match( '~\ssrc\s*=\s*(?:"([^"]*)"|\x27([^\x27]*)\x27)~i', $opening_tag, $source ) ) {
			return $opening_tag;
		}
		$source_url = isset( $source[2] ) && '' !== $source[2] ? $source[2] : $source[1];
		if ( html_entity_decode( $source_url, ENT_QUOTES, 'UTF-8' ) !== html_entity_decode( $src, ENT_QUOTES, 'UTF-8' ) ) {
			return $opening_tag;
		}
		// Retain nonce, integrity, defer and all other existing attributes.
		$opening_tag = preg_replace( '~\s+type\s*=\s*("[^"]*"|\x27[^\x27]*\x27)~i', '', $opening_tag );
		return preg_replace( '~^<script\b~i', '<script type="module"', $opening_tag, 1 );
	}, $tag );
}

/** Rewrite only bundled asset references; business, privacy and anchor links stay intact. */
function omega_mg_redesign_asset_url( $path ) {
	$relative = preg_replace( '~^(?:\./|/)~', '', $path );
	if ( preg_match( '~^assets/[a-zA-Z0-9_./%?=&+#-]+$~', $relative ) && false === strpos( $relative, '..' ) ) {
		return OMEGA_MG_REDESIGN_URL . 'public/' . $relative;
	}
	return $path;
}

function omega_mg_redesign_body() {
	$body = isset( $GLOBALS['omega_mg_redesign_body'] ) ? $GLOBALS['omega_mg_redesign_body'] : '';
	// The module is enqueued above; keeping the static tag would execute it twice.
	$body = preg_replace( '~<script\b[^>]*\bsrc=["\x27](?:\./|/)?app\.js(?:\?[^"\x27]*)?["\x27][^>]*>\s*</script>~i', '', $body );
	$body = preg_replace_callback( '~\b(src|href|poster)=("|\x27)(.*?)\2~is', function ( $match ) {
		return $match[1] . '=' . $match[2] . esc_url( omega_mg_redesign_asset_url( $match[3] ) ) . $match[2];
	}, $body );
	$body = preg_replace_callback( '~\bsrcset=("|\x27)(.*?)\1~is', function ( $match ) {
		$items = explode( ',', $match[2] );
		foreach ( $items as &$item ) {
			$parts = preg_split( '~\s+~', trim( $item ), 2 );
			$item = esc_url( omega_mg_redesign_asset_url( $parts[0] ) ) . ( isset( $parts[1] ) ? ' ' . esc_attr( $parts[1] ) : '' );
		}
		unset( $item );
		return 'srcset=' . $match[1] . implode( ', ', $items ) . $match[1];
	}, $body );
	return $body;
}
