export const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export function calculate(items, discountAmount, interstate) {
  const base = items.map((i) => {
    if (!Number.isFinite(i.rate) || i.rate < 0 || !Number.isSafeInteger(i.quantity) || i.quantity < 1 || !Number.isFinite(i.gstRate) || i.gstRate < 0 || i.gstRate > 100) throw new Error('Invalid item price, quantity or GST rate.');
    return { ...i, gross: round(i.rate * i.quantity / (i.priceIncludesTax ? 1 + i.gstRate / 100 : 1)) };
  });
  const subtotal = round(base.reduce((s, i) => s + i.gross, 0));
  const discount = round(discountAmount);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal) throw new Error('Discount must be within the pre-tax subtotal.');
  let remaining = discount;
  let cumulative = 0;
  const lines = base.map((i, index) => {
    cumulative = round(cumulative + i.gross);
    const allocated = round(discount - remaining);
    const lineDiscount = index === base.length - 1 ? remaining : round((subtotal ? round(discount * cumulative / subtotal) : 0) - allocated);
    remaining = round(remaining - lineDiscount);
    let taxableAmount, cgstAmount, sgstAmount, igstAmount, gstAmount, total;
    if (i.priceIncludesTax) {
      // Keep the customer-facing line total exact (rate × qty, no paise drift) and derive the tax
      // from inside it, so a cash bill shows clean amounts.
      total = round(i.rate * i.quantity - lineDiscount);
      taxableAmount = round(total / (1 + i.gstRate / 100));
      gstAmount = round(total - taxableAmount);
      igstAmount = interstate ? gstAmount : 0;
      cgstAmount = interstate ? 0 : round(gstAmount / 2);
      sgstAmount = interstate ? 0 : round(gstAmount - cgstAmount);
    } else {
      taxableAmount = round(i.gross - lineDiscount);
      cgstAmount = interstate ? 0 : round(taxableAmount * i.gstRate / 200);
      sgstAmount = cgstAmount;
      igstAmount = interstate ? round(taxableAmount * i.gstRate / 100) : 0;
      gstAmount = round(cgstAmount + sgstAmount + igstAmount);
      total = round(taxableAmount + gstAmount);
    }
    return { ...i, discountAmount: lineDiscount, taxableAmount, cgstAmount, sgstAmount, igstAmount, gstAmount, total };
  });
  const sum = (field) => round(lines.reduce((s, i) => s + i[field], 0));
  return { items: lines, subtotal, discountAmount: discount, taxableAmount: sum('taxableAmount'), cgstAmount: sum('cgstAmount'), sgstAmount: sum('sgstAmount'), igstAmount: sum('igstAmount'), gstAmount: sum('gstAmount'), grandTotal: sum('total') };
}
