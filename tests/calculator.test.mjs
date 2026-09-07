import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote, ORIGINAL_RULES } from '../public/calculator.js';

const jdg = { forma: 'JDG', rodzaj: 'RYCZALT', dokumenty: 0, pracUop: 0, pracUoz: 0, vat: false, eksport: false };

test('retains original non-progressive document tiers and all boundary price drops', () => {
  const fixtures = [[0, 150], [10, 150], [11, 158], [30, 310], [31, 276], [60, 450], [61, 405], [120, 700], [121, 594], [500, 2110]];
  for (const [dokumenty, expected] of fixtures) {
    assert.equal(calculateQuote({ ...jdg, dokumenty }).total, expected, `${dokumenty} documents`);
  }
});

test('retains all JDG base amounts and forces full accounting for a limited company', () => {
  for (const [rodzaj, expected] of [['RYCZALT', 150], ['KPIR', 250], ['PELNA', 600]]) {
    assert.equal(calculateQuote({ ...jdg, rodzaj }).total, expected);
    const company = calculateQuote({ ...jdg, forma: 'SPOLKA_ZOO', rodzaj });
    assert.equal(company.total, 900);
    assert.equal(company.inputs.rodzaj, 'PELNA');
  }
});

test('combines document, employment, VAT and foreign trade charges unchanged', () => {
  const quote = calculateQuote({ ...jdg, rodzaj: 'KPIR', dokumenty: 30, pracUop: 2, pracUoz: 1, vat: true, eksport: true });
  assert.equal(quote.total, 870);
  assert.deepEqual([quote.base, quote.docsCost, quote.uopCost, quote.uozCost, quote.vatCost, quote.exportCost], [250, 160, 160, 50, 100, 150]);
});

test('normalizes blank, negative and fractional count inputs as the original calculator does', () => {
  const quote = calculateQuote({ ...jdg, dokumenty: '30.9', pracUop: '-3', pracUoz: '' });
  assert.equal(quote.total, 310);
  assert.equal(quote.inputs.dokumenty, 30);
  assert.equal(quote.inputs.pracUop, 0);
  assert.equal(quote.inputs.pracUoz, 0);
});

test('uses supplied WordPress rules and accounting minimums as authoritative', () => {
  const rules = structuredClone(ORIGINAL_RULES);
  rules.base.JDG.RYCZALT = 200;
  rules.documents[1].price_per_doc = 10;
  rules.minimums.RYCZALT = 450;
  assert.equal(calculateQuote({ ...jdg, dokumenty: 30 }, rules).total, 450);
  rules.minimums.RYCZALT = 150;
  assert.equal(calculateQuote({ ...jdg, dokumenty: 30 }, rules).total, 400);
});
