<?php get_header(); ?>
<main id="content" class="section">
	<div class="container content-page">
		<p class="eyebrow">404</p>
		<h1>Nie znaleziono strony.</h1>
		<p>Podany adres nie istnieje lub strona została przeniesiona.</p>
		<p><a class="button" href="<?php echo esc_url( home_url( '/' ) ); ?>">Wróć na stronę główną</a></p>
	</div>
</main>
<?php get_footer(); ?>
