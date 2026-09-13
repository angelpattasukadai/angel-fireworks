# Angel Fireworks billing

## Setup

1. Sign in as Super Admin and open **Shop GST Settings**.
2. Save the prefilled sample details with demo mode on to test. Enter the real registered name, GSTIN, address and state before disabling demo mode.
3. In Catalog, set each product's HSN, GST percentage, item code, selling unit, and whether the price includes GST. Enable stock tracking and enter quantities when ready.
4. Grant staff **Billing & Invoices** permission in Users.

## Workflow

Billing supports item search/code entry, whole-unit quantities, customer details, place of supply, pre-tax discount, and Cash/UPI/Card/Credit/Mixed payment records. Credit defaults to unpaid. It records payments; it does not process UPI/card transactions.

Bills & Payments shows 100 invoices per page, customer/bill search within each page, today's IST sales, outstanding dues, printable invoices, and additional payment collection. Use the browser print dialog to save PDF. Demo invoices carry a visible demo label. Legacy bills retain their original values.

GST uses seller state versus entered place of supply for CGST/SGST or IGST. Tax-inclusive prices are extracted before discount; the discount is allocated across lines before tax. Business and product details are saved with the invoice. GST invoice numbers are consecutive per financial year. No invoice editing/deletion is exposed.

Invoices and stock changes require MongoDB transactions (Atlas or a replica set). Invoice request IDs prevent repeating the same save from decrementing stock twice. Payment request IDs and conditional updates protect against duplicate/concurrent payment collection. No seed/reset command is needed.

## Verification and limits

Run `node --test backend/gst.test.mjs`, build admin, and test a complete bill/payment flow against a separate test MongoDB replica set before real financial use. Live business data was not seeded or used for automated test transactions.

This iteration does not include purchases/suppliers, expense accounting, returns/credit notes, stock movement audit, customer master, GST return filing, e-invoice/IRN integration, cess, exports/SEZ/reverse-charge workflows, digital signatures, offline sync, or multi-warehouse accounting. State and GSTIN fields currently validate format, not registration status. Demo sales are excluded from summary totals, use a separate DM number series, and do not decrement stock. Tax configuration and real invoice particulars need business review before use.
