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
  assert.match(footer, /wp_footer\(\)/);
  assert.doesNotMatch(main, /initCalculator|calculator\.js/);
  assert.match(main, /if \(logos && prev && next\)/);
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
});
