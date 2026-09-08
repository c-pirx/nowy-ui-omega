<?php

defined( 'ABSPATH' ) || exit;

final class Omega_Core {
	const OPTION = 'omega_core_settings';

	public static function init() {
		add_shortcode( 'omega_calculator', array( __CLASS__, 'shortcode' ) );
		add_action( 'wp_ajax_omega_kalk_lead', array( __CLASS__, 'submit' ) );
		add_action( 'wp_ajax_nopriv_omega_kalk_lead', array( __CLASS__, 'submit' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_post_omega_core_test_email', array( __CLASS__, 'test_email' ) );
		add_action( 'admin_notices', array( __CLASS__, 'admin_notice' ) );
		add_filter( 'script_loader_tag', array( __CLASS__, 'module_script' ), 10, 3 );
	}

	public static function defaults() {
		return array(
			'base_jdg_ryczalt' => 150, 'base_jdg_kpir' => 250, 'base_jdg_pelna' => 600,
			'base_spolka_ryczalt' => 200, 'base_spolka_kpir' => 350, 'base_spolka_pelna' => 900,
			'doc_30' => 8, 'doc_60' => 6, 'doc_120' => 5, 'doc_over' => 4,
			'employee_uop' => 80, 'employee_uoz' => 50, 'vat' => 100, 'export' => 150,
			'min_ryczalt' => 150, 'min_kpir' => 250, 'min_pelna' => 600,
			'recipient' => (string) get_option( 'admin_email' ),
			'from_name' => (string) get_bloginfo( 'name' ),
			'from_email' => (string) get_option( 'admin_email' ),
			'subject' => 'Nowe zapytanie z kalkulatora Omega MG',
			'transport' => 'wordpress', 'smtp_host' => '', 'smtp_port' => 587,
			'smtp_encryption' => 'tls', 'smtp_auth' => 1, 'smtp_username' => '', 'smtp_password' => '',
		);
	}

	public static function settings() {
		return wp_parse_args( get_option( self::OPTION, array() ), self::defaults() );
	}

	public static function rules() {
		$s = self::settings();
		return array(
			'base' => array(
				'JDG' => array( 'RYCZALT' => (float) $s['base_jdg_ryczalt'], 'KPIR' => (float) $s['base_jdg_kpir'], 'PELNA' => (float) $s['base_jdg_pelna'] ),
				'SPOLKA_ZOO' => array( 'RYCZALT' => (float) $s['base_spolka_ryczalt'], 'KPIR' => (float) $s['base_spolka_kpir'], 'PELNA' => (float) $s['base_spolka_pelna'] ),
			),
			'documents' => array(
				array( 'max' => 10, 'price_per_doc' => 0 ), array( 'max' => 30, 'price_per_doc' => (float) $s['doc_30'] ),
				array( 'max' => 60, 'price_per_doc' => (float) $s['doc_60'] ), array( 'max' => 120, 'price_per_doc' => (float) $s['doc_120'] ),
				array( 'max' => null, 'price_per_doc' => (float) $s['doc_over'] ),
			),
			'employees' => array( 'UOP' => (float) $s['employee_uop'], 'UOZ' => (float) $s['employee_uoz'] ),
			'surcharges' => array( 'VAT' => (float) $s['vat'], 'EXPORT' => (float) $s['export'] ),
			'minimums' => array( 'RYCZALT' => (float) $s['min_ryczalt'], 'KPIR' => (float) $s['min_kpir'], 'PELNA' => (float) $s['min_pelna'] ),
		);
	}

	public static function shortcode() {
		$css_version = is_readable( OMEGA_CORE_DIR . 'assets/calculator.css' ) ? (string) filemtime( OMEGA_CORE_DIR . 'assets/calculator.css' ) : OMEGA_CORE_VERSION;
		$js_version  = is_readable( OMEGA_CORE_DIR . 'assets/calculator.js' ) ? (string) filemtime( OMEGA_CORE_DIR . 'assets/calculator.js' ) : OMEGA_CORE_VERSION;
		if ( 'omega' !== get_stylesheet() ) {
			wp_enqueue_style( 'omega-core-calculator', OMEGA_CORE_URL . 'assets/calculator.css', array(), $css_version );
		}
		wp_enqueue_script( 'omega-core-calculator', OMEGA_CORE_URL . 'assets/calculator.js', array(), $js_version, true );
		wp_localize_script( 'omega-core-calculator', 'OmegaKalkData', array(
			'ajax_url' => admin_url( 'admin-ajax.php' ), 'nonce' => wp_create_nonce( 'omega_core_calculator' ), 'rules' => self::rules(),
		) );
		wp_localize_script( 'omega-core-calculator', 'OmegaMGConfirmation', array( 'enabled' => true ) );
		ob_start();
		include OMEGA_CORE_DIR . 'templates/calculator.php';
		return ob_get_clean();
	}

	public static function module_script( $tag, $handle, $src ) {
		if ( 'omega-core-calculator' !== $handle ) return $tag;
		return '<script type="module" src="' . esc_url( $src ) . '"></script>';
	}

	private static function posted_text( $key, $max = 200 ) {
		if ( ! isset( $_POST[ $key ] ) || ! is_string( $_POST[ $key ] ) ) return '';
		$value = sanitize_text_field( wp_unslash( $_POST[ $key ] ) );
		return function_exists( 'mb_substr' ) ? mb_substr( $value, 0, $max ) : substr( $value, 0, $max );
	}

	private static function posted_int( $key, $max = 100000 ) {
		$value = filter_input( INPUT_POST, $key, FILTER_VALIDATE_INT, array( 'options' => array( 'min_range' => 0, 'max_range' => $max ) ) );
		return false === $value || null === $value ? null : (int) $value;
	}

	public static function calculate( $values ) {
		$rules = self::rules();
		$forma = 'SPOLKA_ZOO' === $values['forma'] ? 'SPOLKA_ZOO' : 'JDG';
		$rodzaj = 'SPOLKA_ZOO' === $forma ? 'PELNA' : $values['rodzaj'];
		if ( ! isset( $rules['base'][ $forma ][ $rodzaj ] ) ) return null;
		$per_doc = 0;
		foreach ( $rules['documents'] as $tier ) {
			if ( null === $tier['max'] || $values['dokumenty'] <= $tier['max'] ) { $per_doc = $tier['price_per_doc']; break; }
		}
		$total = $rules['base'][ $forma ][ $rodzaj ]
			+ max( 0, $values['dokumenty'] - 10 ) * $per_doc
			+ $values['pracUop'] * $rules['employees']['UOP']
			+ $values['pracUoz'] * $rules['employees']['UOZ']
			+ ( $values['vat'] ? $rules['surcharges']['VAT'] : 0 )
			+ ( $values['eksport'] ? $rules['surcharges']['EXPORT'] : 0 );
		return max( $total, $rules['minimums'][ $rodzaj ] );
	}

	public static function submit() {
		if ( ! check_ajax_referer( 'omega_core_calculator', 'nonce', false ) ) wp_send_json_error( array( 'message' => 'Sesja formularza wygasła. Odśwież stronę.' ), 403 );
		if ( '' !== self::posted_text( 'hp_field', 100 ) ) wp_send_json_success( array( 'message' => 'Dziękujemy.' ) );
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
		$key = 'omega_rate_' . substr( hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) ), 0, 32 );
		$count = (int) get_transient( $key );
		if ( $count >= 5 ) wp_send_json_error( array( 'message' => 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.' ), 429 );

		$values = array(
			'forma' => self::posted_text( 'forma', 20 ), 'rodzaj' => self::posted_text( 'rodzaj', 20 ),
			'dokumenty' => self::posted_int( 'dokumenty' ), 'pracUop' => self::posted_int( 'pracUop', 10000 ), 'pracUoz' => self::posted_int( 'pracUoz', 10000 ),
			'vat' => '1' === self::posted_text( 'vat', 1 ), 'eksport' => '1' === self::posted_text( 'eksport', 1 ),
		);
		$name = self::posted_text( 'imie', 100 );
		$phone = self::posted_text( 'telefon', 40 );
		$email = sanitize_email( self::posted_text( 'email', 200 ) );
		$message = isset( $_POST['wiadomosc'] ) && is_string( $_POST['wiadomosc'] ) ? sanitize_textarea_field( wp_unslash( $_POST['wiadomosc'] ) ) : '';
		$message = function_exists( 'mb_substr' ) ? mb_substr( $message, 0, 3000 ) : substr( $message, 0, 3000 );
		if ( ! $name || ! is_email( $email ) || strlen( preg_replace( '/\D+/', '', $phone ) ) < 9 || '1' !== self::posted_text( 'privacy', 1 ) || in_array( null, array( $values['dokumenty'], $values['pracUop'], $values['pracUoz'] ), true ) ) {
			wp_send_json_error( array( 'message' => 'Sprawdź wymagane dane formularza.' ), 422 );
		}
		$total = self::calculate( $values );
		if ( null === $total ) wp_send_json_error( array( 'message' => 'Wybrane parametry wyceny są nieprawidłowe.' ), 422 );
		set_transient( $key, $count + 1, 15 * MINUTE_IN_SECONDS );

		$labels = array( 'JDG' => 'Jednoosobowa działalność gospodarcza', 'SPOLKA_ZOO' => 'Spółka z o.o.', 'RYCZALT' => 'Ryczałt', 'KPIR' => 'KPiR', 'PELNA' => 'Pełna księgowość' );
		$lines = array(
			'Nowe zapytanie z kalkulatora Omega MG', '', 'Imię: ' . $name, 'Telefon: ' . $phone, 'E-mail: ' . $email,
			'Forma: ' . ( isset( $labels[ $values['forma'] ] ) ? $labels[ $values['forma'] ] : $values['forma'] ),
			'Księgowość: ' . ( isset( $labels[ 'SPOLKA_ZOO' === $values['forma'] ? 'PELNA' : $values['rodzaj'] ] ) ? $labels[ 'SPOLKA_ZOO' === $values['forma'] ? 'PELNA' : $values['rodzaj'] ] : $values['rodzaj'] ),
			'Dokumenty / miesiąc: ' . $values['dokumenty'], 'Pracownicy UoP: ' . $values['pracUop'], 'Pracownicy UoZ: ' . $values['pracUoz'],
			'VAT: ' . ( $values['vat'] ? 'tak' : 'nie' ), 'Eksport/import: ' . ( $values['eksport'] ? 'tak' : 'nie' ),
			'Wynik wyliczony na serwerze: od ' . number_format_i18n( $total, 0 ) . ' zł netto/mies.', '', 'Wiadomość:', $message ? $message : '(nie dodano)',
		);
		$s = self::settings();
		if ( self::send_mail( $s['recipient'], $s['subject'], implode( "\n", $lines ), $email ) ) wp_send_json_success( array( 'message' => 'Wiadomość została wysłana.' ) );
		wp_send_json_error( array( 'message' => 'Nie udało się wysłać wiadomości.' ), 500 );
	}

	private static function send_mail( $to, $subject, $body, $reply_to = '' ) {
		$s = self::settings();
		$from = function() use ( $s ) { return $s['from_email']; };
		$name = function() use ( $s ) { return $s['from_name']; };
		$smtp = function( $mailer ) use ( $s ) {
			if ( 'smtp' !== $s['transport'] ) return;
			$mailer->isSMTP(); $mailer->Host = $s['smtp_host']; $mailer->Port = (int) $s['smtp_port'];
			$mailer->Timeout = 10;
			$mailer->SMTPAuth = ! empty( $s['smtp_auth'] ); $mailer->Username = $s['smtp_username']; $mailer->Password = $s['smtp_password'];
			$mailer->SMTPSecure = 'none' === $s['smtp_encryption'] ? '' : $s['smtp_encryption']; $mailer->SMTPAutoTLS = 'none' !== $s['smtp_encryption'];
		};
		add_filter( 'wp_mail_from', $from ); add_filter( 'wp_mail_from_name', $name ); add_action( 'phpmailer_init', $smtp );
		$headers = $reply_to && is_email( $reply_to ) ? array( 'Reply-To: ' . $reply_to ) : array();
		$result = wp_mail( $to, $subject, $body, $headers );
		remove_filter( 'wp_mail_from', $from ); remove_filter( 'wp_mail_from_name', $name ); remove_action( 'phpmailer_init', $smtp );
		return $result;
	}

	public static function register_settings() {
		register_setting( 'omega_core', self::OPTION, array( 'type' => 'array', 'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ) ) );
	}

	public static function sanitize_settings( $input ) {
		$old = self::settings(); $out = self::defaults(); $input = is_array( $input ) ? $input : array();
		$numbers = array( 'base_jdg_ryczalt','base_jdg_kpir','base_jdg_pelna','base_spolka_ryczalt','base_spolka_kpir','base_spolka_pelna','doc_30','doc_60','doc_120','doc_over','employee_uop','employee_uoz','vat','export','min_ryczalt','min_kpir','min_pelna' );
		foreach ( $numbers as $key ) $out[ $key ] = isset( $input[ $key ] ) ? max( 0, (float) $input[ $key ] ) : $old[ $key ];
		$out['recipient'] = sanitize_email( isset( $input['recipient'] ) ? $input['recipient'] : $old['recipient'] );
		$out['from_email'] = sanitize_email( isset( $input['from_email'] ) ? $input['from_email'] : $old['from_email'] );
		$out['from_name'] = sanitize_text_field( isset( $input['from_name'] ) ? $input['from_name'] : $old['from_name'] );
		$out['subject'] = sanitize_text_field( isset( $input['subject'] ) ? $input['subject'] : $old['subject'] );
		$out['transport'] = isset( $input['transport'] ) && 'smtp' === $input['transport'] ? 'smtp' : 'wordpress';
		$out['smtp_host'] = sanitize_text_field( isset( $input['smtp_host'] ) ? $input['smtp_host'] : $old['smtp_host'] );
		$out['smtp_port'] = isset( $input['smtp_port'] ) ? min( 65535, max( 1, absint( $input['smtp_port'] ) ) ) : $old['smtp_port'];
		$out['smtp_encryption'] = isset( $input['smtp_encryption'] ) && in_array( $input['smtp_encryption'], array( 'none','tls','ssl' ), true ) ? $input['smtp_encryption'] : 'tls';
		$out['smtp_auth'] = empty( $input['smtp_auth'] ) ? 0 : 1;
		$out['smtp_username'] = sanitize_text_field( isset( $input['smtp_username'] ) ? $input['smtp_username'] : $old['smtp_username'] );
		$out['smtp_password'] = isset( $input['smtp_password'] ) && '' !== $input['smtp_password'] ? sanitize_text_field( $input['smtp_password'] ) : $old['smtp_password'];
		return $out;
	}

	public static function admin_menu() { add_options_page( 'Omega Core', 'Omega Core', 'manage_options', 'omega-core', array( __CLASS__, 'settings_page' ) ); }
	private static function field( $key, $label, $type = 'number' ) {
		$s = self::settings(); $step = 'number' === $type ? ' step="0.01" min="0"' : '';
		printf( '<tr><th scope="row"><label for="omega-%1$s">%2$s</label></th><td><input class="regular-text" id="omega-%1$s" name="%3$s[%1$s]" type="%4$s" value="%5$s"%6$s></td></tr>', esc_attr( $key ), esc_html( $label ), esc_attr( self::OPTION ), esc_attr( $type ), 'password' === $type ? '' : esc_attr( $s[ $key ] ), $step );
	}

	public static function settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) return; $s = self::settings();
		?>
		<div class="wrap"><h1>Omega Core</h1><form action="options.php" method="post"><?php settings_fields( 'omega_core' ); ?>
		<h2>Stawki kalkulatora</h2><table class="form-table"><tbody>
		<?php
		foreach ( array( 'base_jdg_ryczalt'=>'JDG: ryczałt','base_jdg_kpir'=>'JDG: KPiR','base_jdg_pelna'=>'JDG: pełna księgowość','base_spolka_ryczalt'=>'Spółka: ryczałt','base_spolka_kpir'=>'Spółka: KPiR','base_spolka_pelna'=>'Spółka: pełna księgowość','doc_30'=>'Dokumenty 11–30: cena/szt.','doc_60'=>'Dokumenty 31–60: cena/szt.','doc_120'=>'Dokumenty 61–120: cena/szt.','doc_over'=>'Dokumenty powyżej 120: cena/szt.','employee_uop'=>'Pracownik UoP','employee_uoz'=>'Pracownik UoZ','vat'=>'Dopłata VAT','export'=>'Dopłata eksport/import','min_ryczalt'=>'Minimum: ryczałt','min_kpir'=>'Minimum: KPiR','min_pelna'=>'Minimum: pełna księgowość' ) as $key => $label ) self::field( $key, $label );
		?></tbody></table>
		<h2>Wiadomości e-mail</h2><table class="form-table"><tbody>
		<?php self::field( 'recipient', 'Adres odbiorcy', 'email' ); self::field( 'from_name', 'Nazwa nadawcy', 'text' ); self::field( 'from_email', 'Adres nadawcy', 'email' ); self::field( 'subject', 'Temat wiadomości', 'text' ); ?>
		<tr><th scope="row">Transport</th><td><select name="<?php echo esc_attr( self::OPTION ); ?>[transport]"><option value="wordpress" <?php selected( $s['transport'], 'wordpress' ); ?>>WordPress / LocalWP Mailpit</option><option value="smtp" <?php selected( $s['transport'], 'smtp' ); ?>>Własny SMTP</option></select></td></tr>
		<?php self::field( 'smtp_host', 'Host SMTP', 'text' ); self::field( 'smtp_port', 'Port SMTP' ); ?>
		<tr><th scope="row">Szyfrowanie</th><td><select name="<?php echo esc_attr( self::OPTION ); ?>[smtp_encryption]"><?php foreach ( array( 'none'=>'Brak','tls'=>'TLS','ssl'=>'SSL' ) as $value => $label ) printf( '<option value="%s" %s>%s</option>', esc_attr( $value ), selected( $s['smtp_encryption'], $value, false ), esc_html( $label ) ); ?></select></td></tr>
		<tr><th scope="row">Uwierzytelnianie</th><td><label><input type="checkbox" name="<?php echo esc_attr( self::OPTION ); ?>[smtp_auth]" value="1" <?php checked( $s['smtp_auth'] ); ?>> SMTP wymaga logowania</label></td></tr>
		<?php self::field( 'smtp_username', 'Login SMTP', 'text' ); self::field( 'smtp_password', 'Hasło SMTP', 'password' ); ?>
		<tr><th></th><td><p class="description">Puste pole hasła zachowuje dotychczasową wartość.</p></td></tr>
		</tbody></table><?php submit_button( 'Zapisz ustawienia' ); ?></form>
		<hr><h2>Test poczty</h2><form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post"><input type="hidden" name="action" value="omega_core_test_email"><?php wp_nonce_field( 'omega_core_test_email' ); ?><?php submit_button( 'Wyślij wiadomość testową', 'secondary' ); ?></form></div>
		<?php
	}

	public static function test_email() {
		if ( ! current_user_can( 'manage_options' ) ) wp_die( esc_html__( 'Brak uprawnień.', 'omega-core' ) );
		check_admin_referer( 'omega_core_test_email' ); $s = self::settings();
		$ok = self::send_mail( $s['recipient'], 'Test Omega Core', "To jest wiadomość testowa z lokalnej witryny Omega MG.\n\nAdres: " . home_url( '/' ) );
		set_transient( 'omega_core_admin_notice_' . get_current_user_id(), $ok ? 'success' : 'error', MINUTE_IN_SECONDS );
		wp_safe_redirect( admin_url( 'options-general.php?page=omega-core' ) ); exit;
	}

	public static function admin_notice() {
		$key = 'omega_core_admin_notice_' . get_current_user_id(); $notice = get_transient( $key ); if ( ! $notice ) return; delete_transient( $key );
		printf( '<div class="notice notice-%s is-dismissible"><p>%s</p></div>', esc_attr( $notice ), esc_html( 'success' === $notice ? 'Wiadomość testowa została wysłana.' : 'Nie udało się wysłać wiadomości testowej.' ) );
	}
}
