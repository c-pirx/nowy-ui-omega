<?php
get_header();
the_post();
$omega_categories = get_the_category();
$omega_category   = $omega_categories ? $omega_categories[0] : null;
?>
<main id="content" class="kb-single">
	<article <?php post_class( 'kb-article' ); ?>>
		<header class="kb-hero">
			<div class="container">
				<?php omega_kb_breadcrumb( $omega_category ? $omega_category->name : '', $omega_category ? get_category_link( $omega_category ) : '' ); ?>
				<h1><?php the_title(); ?><span class="red-dot">.</span></h1>
				<p class="kb-meta">
					<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
					<span aria-hidden="true">·</span><span><?php echo esc_html( omega_reading_time() ); ?></span>
					<?php if ( $omega_categories ) : ?><span aria-hidden="true">·</span><span><?php echo wp_kses_post( get_the_category_list( ', ' ) ); ?></span><?php endif; ?>
				</p>
				<?php if ( has_excerpt() ) : ?><p class="kb-lead"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
			</div>
		</header>
		<?php if ( has_post_thumbnail() ) : ?>
		<div class="container kb-cover"><?php the_post_thumbnail( 'large' ); ?></div>
		<?php endif; ?>
		<div class="container kb-body">
			<div class="entry-content kb-content"><?php the_content(); ?></div>
			<?php the_tags( '<p class="kb-tags"><span class="eyebrow">Tagi</span>', '', '</p>' ); ?>
			<nav class="kb-adjacent" aria-label="Sąsiednie artykuły">
				<div><?php previous_post_link( '%link', '<span class="eyebrow">Poprzedni artykuł</span><span class="kb-adjacent-title">%title</span>' ); ?></div>
				<div><?php next_post_link( '%link', '<span class="eyebrow">Następny artykuł</span><span class="kb-adjacent-title">%title</span>' ); ?></div>
			</nav>
		</div>
	</article>
	<?php
	$omega_related_args = array( 'post__not_in' => array( get_the_ID() ), 'posts_per_page' => 3, 'ignore_sticky_posts' => true, 'no_found_rows' => true );
	$omega_related      = new WP_Query( $omega_related_args + array( 'category__in' => wp_list_pluck( $omega_categories, 'term_id' ) ) );
	if ( ! $omega_related->have_posts() ) $omega_related = new WP_Query( $omega_related_args );
	if ( $omega_related->have_posts() ) :
	?>
	<section class="section kb-related" aria-labelledby="kb-related-title">
		<div class="container">
			<div class="section-heading">
				<div>
					<p class="eyebrow"><span class="eyebrow-line"></span>Czytaj także</p>
					<h2 id="kb-related-title">Więcej z bazy wiedzy<span class="red-dot">.</span></h2>
				</div>
				<a class="text-link" href="<?php echo esc_url( omega_kb_page_url() ); ?>">Wszystkie artykuły<?php echo omega_arrow(); ?></a>
			</div>
			<div class="kb-grid">
				<?php while ( $omega_related->have_posts() ) : $omega_related->the_post(); omega_post_card(); endwhile; wp_reset_postdata(); ?>
			</div>
		</div>
	</section>
	<?php endif; ?>
	<section class="section kb-cta" aria-labelledby="kb-cta-title">
		<div class="container kb-cta-inner">
			<div>
				<p class="eyebrow"><span class="eyebrow-line"></span>Masz pytanie?</p>
				<h2 id="kb-cta-title">Porozmawiajmy o Twojej księgowości<span class="red-dot">.</span></h2>
				<p>Artykuły opisują zasady ogólne. Jeśli chcesz wiedzieć, jak wyglądają w Twojej firmie, umów krótką rozmowę albo policz orientacyjną cenę obsługi.</p>
			</div>
			<div class="kb-cta-actions">
				<a class="button" href="<?php echo esc_url( home_url( '/#kontakt' ) ); ?>">Umów rozmowę<?php echo omega_arrow(); ?></a>
				<a class="text-link" href="<?php echo esc_url( home_url( '/#kalkulator' ) ); ?>">Wycena online<?php echo omega_arrow(); ?></a>
			</div>
		</div>
	</section>
</main>
<?php get_footer(); ?>
