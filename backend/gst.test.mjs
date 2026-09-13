import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../shared/gst.mjs';
const item = { rate: 100, quantity: 2, gstRate: 18, priceIncludesTax: false };
test('intrastate discount reduces taxable value before equal tax split', () => {
  const bill = calculate([item], 20, false);
  assert.equal(bill.taxableAmount, 180); assert.equal(bill.cgstAmount, 16.2); assert.equal(bill.sgstAmount, 16.2); assert.equal(bill.grandTotal, 212.4);
});
test('tax-inclusive interstate price extracts GST', () => {
  const bill = calculate([{ ...item, rate: 118, priceIncludesTax: true }], 0, true);
  assert.equal(bill.subtotal, 200); assert.equal(bill.igstAmount, 36); assert.equal(bill.grandTotal, 236); assert.equal(bill.cgstAmount, 0);
});
test('mixed rates conserve total discount and line totals', () => {
  const bill = calculate([item, { ...item, rate: 55.55, gstRate: 5 }], 37.17, false);
  assert.equal(Math.round(bill.items.reduce((s, i) => s + i.discountAmount, 0) * 100), 3717);
  assert.equal(Math.round((bill.taxableAmount + bill.gstAmount) * 100), Math.round(bill.grandTotal * 100));
});
test('invalid discounts, quantities and rates are rejected', () => {
  for (const value of [-1, Infinity, NaN, 201]) assert.throws(() => calculate([item], value, false));
  assert.throws(() => calculate([{ ...item, quantity: -1 }], 0, false));
  assert.throws(() => calculate([{ ...item, rate: Infinity }], 0, false));
});
test('small lines and large discounts never produce negative taxable amounts', () => {
  const items = Array.from({ length: 200 }, () => ({ ...item, rate: 0.01, quantity: 1 }));
  const bill = calculate(items, 1.99, false);
  assert.ok(bill.items.every((i) => i.taxableAmount >= 0)); assert.equal(bill.taxableAmount, 0.01);
});
