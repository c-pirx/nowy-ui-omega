<?php
/**
 * Porządek w stronach WordPressa: strona przykładowa do kosza, polska nazwa i adres polityki prywatności.
 * Uruchomienie (LocalWP): wp eval-file scripts/seed-pages.php --path=app/public
 * Skrypt jest idempotentny. Niczego nie usuwa trwale: zbędne strony trafiają do kosza.
 */

// Strona przykładowa instalacji WordPressa.
foreach ( array( 'sample-page', 'przykladowa-strona' ) as $slug ) {
	$page = get_page_by_path( $slug, OBJECT, 'page' );
	if ( $page && 'trash' !== $page->post_status ) {
		wp_trash_post( $page->ID );
		WP_CLI::log( 'Strona „' . $page->post_title . '” przeniesiona do kosza.' );
	}
}

// Polityka prywatności zostaje szkicem, dopóki nie trafi do niej treść z omega-mg.pl.
// Stopka i formularze linkują do niej automatycznie po publikacji (get_privacy_policy_url), do tego czasu do obecnej strony.
$privacy_id = (int) get_option( 'wp_page_for_privacy_policy' );
if ( $privacy_id ) {
	wp_update_post( array( 'ID' => $privacy_id, 'post_title' => 'Polityka prywatności', 'post_name' => 'polityka-prywatnosci' ) );
}

$statuses = array( 'publish' => 'opublikowana', 'draft' => 'szkic' );
foreach ( get_posts( array( 'post_type' => 'page', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) as $page ) {
	WP_CLI::log( sprintf( '%-24s /%s/  (%s)', $page->post_title, $page->post_name, $statuses[ $page->post_status ] ?? $page->post_status ) );
}
WP_CLI::success( 'Strony uporządkowane.' );
