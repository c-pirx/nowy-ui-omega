<?php
/**
 * Plugin Name: Omega Core
 * Description: Kalkulator wyceny Omega MG oraz konfiguracja wysyłki e-mail i SMTP.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Omega MG
 * Text Domain: omega-core
 */

defined( 'ABSPATH' ) || exit;

define( 'OMEGA_CORE_VERSION', '1.0.0' );
define( 'OMEGA_CORE_DIR', plugin_dir_path( __FILE__ ) );
define( 'OMEGA_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once OMEGA_CORE_DIR . 'includes/class-omega-core.php';

Omega_Core::init();
