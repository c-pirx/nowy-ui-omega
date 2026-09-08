<?php
get_header();
$omega_title = 'Baza wiedzy';
$omega_crumb = '';
$omega_description = '';
if ( is_home() ) {
	$omega_page = (int) get_option( 'page_for_posts' );
	if ( $omega_page ) {
		$omega_title       = get_the_title( $omega_page );
		$omega_description = apply_filters( 'the_content', get_post_field( 'post_content', $omega_page ) );
	}
} elseif ( is_category() || is_tag() ) {
	$omega_title       = single_term_title( '', false );
	$omega_crumb       = $omega_title;
	$omega_description = term_description();
} elseif ( is_search() ) {
	$omega_title       = 'Wyniki wyszukiwania';
	$omega_crumb       = 'Szukaj';
	$omega_description = '<p>' . sprintf( 'Fraza „%s”, znalezione artykuły: %d.', esc_html( get_search_query() ), (int) $wp_query->found_posts ) . '</p>';
} else {
	$omega_title       = wp_strip_all_tags( get_the_archive_title() );
	$omega_crumb       = $omega_title;
	$omega_description = get_the_archive_description();
}
?>
<main id="content" class="section kb-page">
	<div class="container">
		<header class="kb-heading">
			<div>
				<?php omega_kb_breadcrumb( $omega_crumb ); ?>
				<h1><?php echo esc_html( $omega_title ); ?><span class="red-dot">.</span></h1>
			</div>
			<?php if ( '' !== trim( wp_strip_all_tags( $omega_description ) ) ) echo '<div class="kb-description">' . wp_kses_post( $omega_description ) . '</div>'; ?>
		</header>
		<div class="kb-toolbar">
			<nav class="kb-categories" aria-label="Kategorie">
				<a href="<?php echo esc_url( omega_kb_page_url() ); ?>"<?php if ( is_home() ) echo ' aria-current="page"'; ?>>Wszystkie</a>
				<?php foreach ( get_terms( array( 'taxonomy' => 'category', 'hide_empty' => true ) ) as $omega_term ) : ?>
				<a href="<?php echo esc_url( get_term_link( $omega_term ) ); ?>"<?php if ( is_category( $omega_term->term_id ) ) echo ' aria-current="page"'; ?>><?php echo esc_html( $omega_term->name ); ?></a>
				<?php endforeach; ?>
			</nav>
			<form class="kb-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<input type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Szukaj w bazie wiedzy" aria-label="Szukaj w bazie wiedzy">
				<input type="hidden" name="post_type" value="post">
				<button type="submit" aria-label="Szukaj"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></button>
			</form>
		</div>
		<script>document.querySelectorAll( '.kb-categories' ).forEach( function ( nav ) { var active = nav.querySelector( '[aria-current]' ); if ( active ) nav.scrollLeft = active.offsetLeft; } );</script>
		<?php if ( have_posts() ) : ?>
		<div class="kb-grid">
			<?php while ( have_posts() ) : the_post(); omega_post_card( is_home() && ! is_paged() && 0 === $wp_query->current_post ); endwhile; ?>
		</div>
		<?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => 'Nowsze artykuły' . omega_arrow(), 'next_text' => 'Starsze artykuły' . omega_arrow(), 'screen_reader_text' => 'Strony bazy wiedzy', 'aria_label' => 'Strony bazy wiedzy' ) ); ?>
		<?php else : ?>
		<div class="kb-empty">
			<p>Nic tu jeszcze nie ma. Spróbuj innej frazy albo przejrzyj wszystkie artykuły.</p>
			<a class="text-link" href="<?php echo esc_url( omega_kb_page_url() ); ?>">Wszystkie artykuły<?php echo omega_arrow(); ?></a>
		</div>
		<?php endif; ?>
	</div>
</main>
<?php get_footer(); ?>
