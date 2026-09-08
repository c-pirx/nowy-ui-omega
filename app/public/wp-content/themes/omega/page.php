<?php get_header(); ?>
<main id="content" class="section">
	<div class="container content-page">
		<?php while ( have_posts() ) : the_post(); ?>
			<h1><?php the_title(); ?></h1>
			<div class="entry-content"><?php the_content(); ?></div>
		<?php endwhile; ?>
	</div>
</main>
<?php get_footer(); ?>
