<?php
defined( 'ABSPATH' ) || exit;

function omega_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
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
