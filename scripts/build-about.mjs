import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

export const aboutMetadata = {
  title: "O mnie – Monika Glonek | Omega MG",
  description: "Poznaj Monikę Glonek, właścicielkę Omega MG. Doświadczenie w księgowości od 2006 roku, certyfikat nr 54701/2012. Jaworzno i obsługa online.",
};

// Keep every static URL relative to the deployment root, including GitHub Pages.
export function aboutStaticUrls(markup) {
  return markup
    .replace(/\b(href|src)="(?![a-z][a-z\d+.-]*:|\/\/)([^"]+)"/gi, (match, attr, url) => {
      if (url === "#content") return match;
      if (url === "o-mnie") return `${attr}="./"`;
      return `${attr}="../${url}"`;
    })
    .replace(/\bsrcset="([^"]+)"/g, (_match, value) =>
      `srcset="${value.split(",").map(item => "../" + item.trim()).join(", ")}"`);
}

export async function buildAboutPage({ root, theme, homeHtml, rewriteMarkup }) {
  const source = (await readFile(join(root, "pages", "o-mnie.html"), "utf8")).replace(/\r\n/g, "\n");
  if (!source.startsWith('<main id="content"') || !source.trimEnd().endsWith("</main>")) {
    throw new Error("pages/o-mnie.html musi zawierać główną treść podstrony.");
  }
  const arrow = '<svg class="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" /></svg>';
  const main = source.replace(/<span data-om-arrow><\/span>/g, `<span aria-hidden="true">${arrow}</span>`);
  const shell = homeHtml.match(/<body\b[^>]*>([\s\S]*?)<main id="content">[\s\S]*?<\/main>([\s\S]*?)<\/body>/);
  let head = homeHtml.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  if (!shell || !head) throw new Error("Nie znaleziono wspólnego nagłówka i stopki strony głównej.");
  head = head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${aboutMetadata.title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]+/, `$1${aboutMetadata.description}`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]+/, `$1${aboutMetadata.title}`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]+/, `$1${aboutMetadata.description}`)
    .replace(/https:\/\/omega-mg\.pl\/(?=")/g, "https://omega-mg.pl/o-mnie/")
    + '    <link rel="stylesheet" href="o-mnie.css" />\n';
  const header = shell[1].replace(/href="o-mnie"/g, 'href="o-mnie" aria-current="page"');
  const document = `<!doctype html>\n<html lang="pl">\n<head>${aboutStaticUrls(head)}</head>\n<body>${aboutStaticUrls(header)}${aboutStaticUrls(main)}${aboutStaticUrls(shell[2])}</body>\n</html>\n`;
  await mkdir(join(root, "public", "o-mnie"), { recursive: true });
  await writeFile(join(root, "public", "o-mnie", "index.html"), document);
  await writeFile(join(theme, "page-o-mnie.php"), `<?php get_header(); ?>\n${rewriteMarkup(main)}\n<?php get_footer(); ?>\n`);
  await copyFile(join(root, "public", "o-mnie.css"), join(theme, "assets", "css", "o-mnie.css"));
}
