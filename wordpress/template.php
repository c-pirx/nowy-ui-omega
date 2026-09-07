<?php
/** Body-only import keeps the active WordPress SEO, consent and plugin hooks. */
defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html lang="pl-PL" <?php echo is_rtl() ? 'dir="rtl"' : 'dir="ltr"'; ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'omega-mg-redesign' ); ?>>
<?php wp_body_open(); ?>
<?php
// Trusted plugin-owned build output. Escaping the entire body would destroy the page.
echo omega_mg_redesign_body(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
wp_footer();
?>
</body>
</html>
