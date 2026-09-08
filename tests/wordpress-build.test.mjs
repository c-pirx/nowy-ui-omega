import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFile(new URL(path, root), "utf8");

test("WordPress theme is native, self-contained and keeps the approved sections", async () => {
  const [front, header, footer, functions, main] = await Promise.all([
    read("app/public/wp-content/themes/omega/front-page.php"),
    read("app/public/wp-content/themes/omega/header.php"),
    read("app/public/wp-content/themes/omega/footer.php"),
    read("app/public/wp-content/themes/omega/functions.php"),
    read("app/public/wp-content/themes/omega/assets/js/main.js"),
  ]);
  for (const id of ["start", "onas", "oferta", "dlaczego", "opinie", "kontakt"])
    assert.match(front + header + footer, new RegExp(`id="${id}"`));
  assert.match(front, /do_shortcode\( '\[omega_calculator\]' \)/);
  assert.doesNotMatch(front + functions, /file_get_contents|public\/index\.html/);
  assert.match(header, /wp_head\(\)/);
  assert.match(header, /class="skip-link" href="#content"/);
  const woocommerce = await read("app/public/wp-content/themes/omega/woocommerce.php");
  assert.match(woocommerce, /woocommerce_content\(\)/);
  assert.match(functions, /woocommerce_enqueue_styles.*__return_empty_array/);
  assert.equal((header.match(/omega_cart_link\(\)/g) || []).length, 2);
  assert.match(functions, /woocommerce_add_to_cart_fragments/);
  assert.match(functions, /header-cart-panel/);
  assert.match(functions, /render_block_woocommerce\/empty-cart-block/);
  assert.match(footer, /wp_footer\(\)/);
  // Stopka: kolumna sklepu i polityka prywatności ze strony WordPressa po jej publikacji.
  assert.match(footer, /omega_footer_shop\(\)/);
  assert.match(functions, /function omega_footer_shop/);
  assert.doesNotMatch(front + header + footer, /href="https:\/\/omega-mg\.pl\/polityka-prywatnosci\/"/);
  assert.match(footer, /get_privacy_policy_url\(\)/);
  assert.doesNotMatch(main, /initCalculator|calculator\.js/);
  assert.match(main, /if \(logos && prev && next\)/);
  // Baza wiedzy: lista w index.php, artykuł w single.php, style tylko na tych stronach.
  const [index, single, blogCss] = await Promise.all([
    read("app/public/wp-content/themes/omega/index.php"),
    read("app/public/wp-content/themes/omega/single.php"),
    read("app/public/wp-content/themes/omega/assets/css/blog.css"),
  ]);
  assert.match(index, /omega_post_card\(/);
  assert.match(index, /the_posts_pagination\(/);
  assert.match(index, /name="post_type" value="post"/);
  assert.match(single, /the_content\(\)/);
  assert.match(single, /kb-related/);
  assert.doesNotMatch(single, /comments_template/);
  assert.match(functions, /wp_enqueue_style\( 'omega-blog'.*blog\.css/);
  assert.match(functions, /function omega_post_card/);
  assert.match(main, /\.kb-card/);
  for (const selector of [".kb-card-featured", ".kb-categories", ".kb-content", ".kb-adjacent"])
    assert.match(blogCss, new RegExp(selector.replace(".", "\\.") + "\\s*[{,]"));
});

test("Omega Core owns calculator UI, server validation and SMTP settings", async () => {
  const [plugin, template, script, style] = await Promise.all([
    read("app/public/wp-content/plugins/omega-core/includes/class-omega-core.php"),
    read("app/public/wp-content/plugins/omega-core/templates/calculator.php"),
    read("app/public/wp-content/plugins/omega-core/assets/calculator.js"),
    read("app/public/wp-content/plugins/omega-core/assets/calculator.css"),
  ]);
  assert.match(template, /id="omega-kalk-form"/);
  assert.match(script, /initCalculator\(\);\s*$/);
  assert.match(style, /\.omega-calculator/);
  for (const marker of ["check_ajax_referer", "self::calculate", "get_transient", "phpmailer_init", "smtp_password"])
    assert.match(plugin, new RegExp(marker.replace("::", "\\:\\:")));
  assert.doesNotMatch(plugin, /omega-mg-redesign|omega-kalkulator/);
  // Wpisy w panelu nazywają się „Baza wiedzy”.
  assert.match(plugin, /post_type_labels_post/);
  assert.match(plugin, /\$menu\[5\]\[0\] = 'Baza wiedzy'/);
});
