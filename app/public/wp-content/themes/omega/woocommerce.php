<?php get_header(); ?>
<main id="content" class="section shop-page">
	<div class="container">
		<header class="shop-heading">
			<div>
				<?php woocommerce_breadcrumb( array( 'wrap_before' => '<nav class="eyebrow shop-breadcrumb" aria-label="Okruszki">', 'wrap_after' => '</nav>', 'delimiter' => '<span aria-hidden="true">/</span>', 'home' => 'Start' ) ); ?>
				<?php if ( ! is_singular( 'product' ) ) : ?>
				<h1><?php woocommerce_page_title(); ?><span class="red-dot">.</span></h1>
				<?php endif; ?>
			</div>
			<?php
			$omega_description = is_product_taxonomy() ? term_description() : ( is_shop() ? apply_filters( 'the_content', get_post_field( 'post_content', wc_get_page_id( 'shop' ) ) ) : '' );
			if ( '' !== trim( wp_strip_all_tags( $omega_description ) ) ) echo '<div class="shop-description">' . wp_kses_post( $omega_description ) . '</div>';
			?>
		</header>
		<?php if ( ! is_singular( 'product' ) ) : ?>
		<nav class="shop-categories" aria-label="Kategorie produktów">
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"<?php if ( is_shop() ) echo ' aria-current="page"'; ?>>Wszystkie</a>
			<?php foreach ( get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true ) ) as $omega_term ) : ?>
			<a href="<?php echo esc_url( get_term_link( $omega_term ) ); ?>"<?php if ( is_tax( 'product_cat', $omega_term->slug ) ) echo ' aria-current="page"'; ?>><?php echo esc_html( $omega_term->name ); ?></a>
			<?php endforeach; ?>
		</nav>
		<script>document.querySelectorAll( '.shop-categories' ).forEach( function ( nav ) { var active = nav.querySelector( '[aria-current]' ); if ( active ) nav.scrollLeft = active.offsetLeft; } );</script>
		<?php endif; ?>
		<?php woocommerce_content(); ?>
	</div>
</main>
<?php get_footer(); ?>
