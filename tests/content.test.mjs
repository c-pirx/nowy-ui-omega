import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = file => fs.readFile(new URL(file, root), 'utf8');
const [html, css, original, contentJSON, manifestJSON] = await Promise.all([
  'public/index.html', 'public/styles.css', 'research/original.html',
  'research/content.json', 'research/asset-manifest.json',
].map(read));
const source = JSON.parse(contentJSON);
const manifest = JSON.parse(manifestJSON);

// Allow typography, case, punctuation and layout changes; preserve every word.
function words(value) {
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&nbsp;|&amp;/g, ' ').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
const pageWords = words(html);
const preserved = value => assert.ok(pageWords.includes(words(value)), `Missing source text: ${value}`);
// Relative paths let the exact same assets work under a WordPress plugin mount.
const assetReferences = new Set([
  ...html.matchAll(/(?:src|href)=["'](?:\.\/|\/)?(assets\/[^"'?]+)/g),
  ...css.matchAll(/url\(["']?(?:\.\/|\/)?(assets\/[^"')?]+)/g),
].map(match => '/' + match[1]));

test('preserves the full original biography, service descriptions and five reasons', () => {
  const { about, services, reasons, footer } = source.sections;
  [about.lead, ...about.paragraphs, services.intro, footer.body,
    ...services.featured.flatMap(service => [service.title, service.body]),
    ...services.full.items.flatMap(service => [service.title, service.body].filter(Boolean)),
    reasons.title, reasons.body,
    ...reasons.items.flatMap(reason => [reason.title, reason.body]),
  ].forEach(preserved);
});

test('preserves tax-form selection as an independent service, separate from starting a company', () => {
  const headings = [...html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)].map(match => words(match[1]));
  for (const service of source.sections.services.full.items) {
    assert.ok(headings.includes(words(service.title)), `Service must remain independently labeled: ${service.title}`);
  }
});

test('retains all five original photographs and both original Omega logo variants', () => {
  const paths = [
    '/assets/dsc_1052-scaled.jpg',
    '/assets/crop-woman-using-calculator-and-taking-notes-on-paper.jpg',
    '/assets/crop-payroll-clerk-counting-money-while-sitting-at-table.jpg',
    '/assets/heap-of-american-money-cash-and-vintage-light-box.jpg',
    '/assets/bg-01-free-img.jpg',
    '/assets/aktualne-cropped.svg', '/assets/projekt-bez-nazwy-2.png',
  ];
  for (const path of paths) assert.ok(assetReferences.has(path), `Missing original photograph/logo: ${path}`);
});

test('keeps all five source client logos in their original sequence', () => {
  const rendered = [...html.matchAll(/<img\b[^>]*src="(?:\.\/|\/)?(assets\/logo-\d\.svg)"/g)].map(match => '/' + match[1]);
  assert.deepEqual(rendered, source.sections.clients.images.map(image => image.src));
  assert.ok(html.includes('id="opinie"'), 'The original Opinie menu target must remain available');
});

test('preserves exact company identifiers, usable contact links and privacy destination', () => {
  const contact = source.contact;
  [contact.name, contact.phone, contact.email, ...contact.addressLines,
    contact.nip, contact.regon, contact.certificate].forEach(preserved);
  assert.ok(html.includes(`href="${contact.phoneHref}"`));
  assert.ok(html.includes(`href="mailto:${contact.email}"`));
  assert.ok(html.includes(`href="${source.privacyUrl}"`));
});

test('retains the original calculator consent and complete data-processing notice', () => {
  const consent = original.match(/Zapoznałem\/-am się z[\s\S]*?<\/span>/)?.[0];
  assert.ok(consent, 'Original consent not found in audit snapshot');
  preserved(consent);
  let notice = original.match(/<div class="pp-rodo"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(notice, 'Original privacy notice not found in audit snapshot');
  notice = notice.replace(/<span\b[^>]*data-cfemail="[^"]+"[^>]*>[\s\S]*?<\/span>/g, source.contact.email);
  preserved(notice);
});

test('retains every fact from the original C.I.K. certificate in an accessible native panel', () => {
  const certificate = source.certificationWidget;
  [certificate.title, ...certificate.criteria, ...certificate.additional].forEach(preserved);
  assert.ok(html.includes(`href="${certificate.profileUrl}"`));
  assert.ok(assetReferences.has(certificate.logo), 'Use the original C.I.K. logo');
});

test('all archived source assets retain their exact bytes and provenance', async () => {
  for (const asset of [...manifest.assets, ...manifest.fonts]) {
    const bytes = await fs.readFile(new URL(asset.local, root));
    assert.equal(bytes.length, asset.bytes, `Size changed: ${asset.local}`);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256, `Source bytes changed: ${asset.local}`);
    assert.ok(asset.source.startsWith('https://'), `Missing source URL: ${asset.local}`);
  }
});

test('keeps the original description and canonical while correcting the page language and heading outline', () => {
  assert.ok(html.includes('<html lang="pl">'));
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.ok(html.includes(`content="${source.description}"`));
  assert.ok(html.includes('rel="canonical" href="https://omega-mg.pl/"'));
  for (const href of ['#onas', '#oferta', '#opinie', '#kontakt', '#kalkulator']) {
    assert.ok(html.includes(`href="${href}"`));
    assert.ok(html.includes(`id="${href.slice(1)}"`));
  }
});

test('provides the same Open Sans family with the official Polish-capable Latin Extended subset', () => {
  const extended = manifest.fonts.find(font => font.family === 'Open Sans' && font.subset === 'latin-ext');
  assert.ok(extended, 'Source manifest needs a Polish-capable Open Sans font');
  assert.ok(assetReferences.has(extended.webPath), 'Load Latin Extended so Polish glyphs do not fall back to another typeface');
});
