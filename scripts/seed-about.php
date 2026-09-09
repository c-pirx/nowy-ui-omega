<?php
/**
 * Tworzy stronę O mnie; istniejącą stronę (treść, status i metadane) pozostawia bez zmian.
 * wp eval-file scripts/seed-about.php --path=app/public
 */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
    exit;
}
$page = get_page_by_path( 'o-mnie', OBJECT, 'page' );
if ( $page ) {
    WP_CLI::success( sprintf( 'Strona O mnie już istnieje (ID %d, status %s). Bez zmian.', $page->ID, $page->post_status ) );
    return;
}
$page_id = wp_insert_post( array(
    'post_type' => 'page',
    'post_title' => 'O mnie',
    'post_name' => 'o-mnie',
    'post_status' => 'publish',
    'post_content' => '',
), true );
if ( is_wp_error( $page_id ) ) {
    WP_CLI::error( $page_id->get_error_message() );
}
WP_CLI::success( sprintf( 'Utworzono stronę O mnie (ID %d). Treść renderuje szablon page-o-mnie.php.', $page_id ) );
