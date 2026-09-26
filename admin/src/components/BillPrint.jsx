import React from 'react';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import logo from '../assets/logo1.png';

const money = (n) => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const offPct = (i) => (i.mrp && i.mrp > i.rate ? Math.round((1 - i.rate / i.mrp) * 100) : 0);

// Printable bill / estimate. Uses id="invoice-print" so the shared @media print CSS isolates it.
export default function BillPrint({ doc, kind = 'invoice' }) {
  if (!doc) return null;
  const isEstimate = kind === 'estimate';
  const number = isEstimate ? doc.estimateNumber : doc.invoiceNumber;
  const shopName = (doc.business?.name || 'Angel Fireworks').replace(/\s*[—–-]\s*demo\s*$/i, '');
  const normalTotal = doc.items.reduce((s, i) => s + (i.mrp || i.rate) * i.quantity, 0);
  const posLine = [doc.placeOfSupplyName, doc.customerPincode].filter(Boolean).join(' - ');

  return (
    <Box id="invoice-print" sx={{ bgcolor: 'white', color: '#111', p: 3, borderRadius: '12px', '& th, & td': { color: '#111', borderColor: '#ddd' } }}>
      {/* Shop header (our details) — centered */}
      <Box sx={{ textAlign: 'center', mb: 1.5 }}>
        <Box component="img" src={logo} alt="Angel Fireworks" sx={{ height: 96 }} />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{shopName}</Typography>
        <Typography sx={{ fontSize: '0.85rem' }}>{doc.business?.address}</Typography>
        <Typography sx={{ fontSize: '0.85rem' }}>GSTIN: {doc.business?.gstin || 'Not configured'}{doc.business?.phone ? ` · Ph: ${doc.business.phone}` : ''}</Typography>
      </Box>
      <Box sx={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', py: 0.8, textAlign: 'center', fontWeight: 800, letterSpacing: 1, mb: 1.5 }}>
        {isEstimate ? 'ESTIMATE / QUOTATION — Not a Tax Invoice' : (doc.business?.gstin ? 'TAX INVOICE' : 'SALES RECEIPT')}
      </Box>

      {/* Customer (left) + meta (right) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 210 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#666', mb: 0.3 }}>{isEstimate ? 'ESTIMATE FOR' : 'BILL TO'}</Typography>
          <Typography sx={{ fontWeight: 700 }}>{doc.customerName}</Typography>
          {(doc.customerPhone || doc.customerAltPhone) && <Typography sx={{ fontSize: '0.85rem' }}>Ph: {[doc.customerPhone, doc.customerAltPhone].filter(Boolean).join(' / ')}</Typography>}
          {doc.customerAddress && <Typography sx={{ fontSize: '0.85rem', whiteSpace: 'pre-line' }}>{doc.customerAddress}</Typography>}
          {posLine && <Typography sx={{ fontSize: '0.85rem' }}>{posLine}</Typography>}
          {doc.customerGstin && <Typography sx={{ fontSize: '0.85rem' }}>GSTIN: {doc.customerGstin}</Typography>}
        </Box>
        <Box sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
          <Typography sx={{ fontSize: '0.85rem' }}><strong>{isEstimate ? 'Estimate No' : 'Bill No'}:</strong> {number}</Typography>
          <Typography sx={{ fontSize: '0.85rem' }}><strong>Date:</strong> {new Date(doc.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</Typography>
          <Typography sx={{ fontSize: '0.85rem' }}><strong>Place of supply:</strong> {doc.placeOfSupplyName} ({doc.placeOfSupply})</Typography>
        </Box>
      </Box>

      {/* Items */}
      <Table size="small">
        <TableHead><TableRow>{['S.No', 'Item', 'Normal Rate', 'Discount Rate', 'Off %', 'Qty', 'Amount'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{doc.items.map((i, n) => (
          <TableRow key={n}>
            <TableCell>{n + 1}</TableCell>
            <TableCell>{i.name}{i.tamilName ? <><br /><span style={{ fontSize: '0.85em', color: '#555' }}>{i.tamilName}</span></> : ''}</TableCell>
            <TableCell>{i.mrp && i.mrp > i.rate ? <span style={{ textDecoration: 'line-through', color: '#777' }}>{money(i.mrp)}</span> : money(i.mrp || i.rate)}</TableCell>
            <TableCell>{money(i.rate)}</TableCell>
            <TableCell>{offPct(i) ? `${offPct(i)}%` : '-'}</TableCell>
            <TableCell>{i.quantity} {i.unit}</TableCell>
            <TableCell>{money(i.total)}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>

      {/* Totals */}
      <Box sx={{ textAlign: 'right', mt: 2 }}>
        <Typography>Total (Normal Rate): {money(normalTotal)}</Typography>
        {normalTotal > doc.grandTotal && <Typography sx={{ color: '#c00', fontWeight: 700 }}>You Save: {money(normalTotal - doc.grandTotal)}</Typography>}
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{isEstimate ? 'Estimated Total' : 'Discount Total'}: {money(doc.grandTotal)}</Typography>
        {!isEstimate && <Typography>Paid: {money(doc.paidAmount)}</Typography>}
        {!isEstimate && <Typography>Balance due: {money(doc.dueAmount)}</Typography>}
      </Box>
      {!isEstimate && doc.status === 'Paid' && <Typography sx={{ textAlign: 'right', mt: 1, fontWeight: 800, color: '#1a7f37', letterSpacing: 1 }}>✓ PAID IN FULL</Typography>}

      {doc.note && <Typography sx={{ mt: 2 }}><strong>Note:</strong> {doc.note}</Typography>}

      {isEstimate
        ? <Typography sx={{ mt: 3, fontStyle: 'italic', fontSize: '0.85rem' }}>This is an estimate only. Prices and availability are subject to change until a tax invoice is issued.</Typography>
        : <>
            {doc.payments?.length > 0 && <><Typography sx={{ mt: 2 }}>Payment history</Typography>{doc.payments.map((p, i) => <Typography key={i} variant="body2">{new Date(p.date).toLocaleDateString('en-IN')} · {p.method} · {money(p.amount)}</Typography>)}</>}
            {doc.business?.gstin && <Typography sx={{ mt: 5, textAlign: 'right' }}>For {shopName}<br /><br />Authorized signatory</Typography>}
          </>}
    </Box>
  );
}

// Shared print CSS string — include once on any page that renders a BillPrint.
export const PRINT_STYLE = `@media print { body * { visibility: hidden !important; } #invoice-print, #invoice-print * { visibility: visible !important; } .MuiDialog-container { display: block !important; height: auto !important; } .MuiDialog-paper { position: absolute !important; top: 0; left: 0; margin: 0 !important; max-height: none !important; max-width: none !important; width: 100% !important; box-shadow: none !important; overflow: visible !important; } .MuiDialogContent-root { overflow: visible !important; padding: 0 !important; } .MuiDialogTitle-root, .MuiDialogActions-root { display: none !important; } #invoice-print { width: 100%; box-sizing: border-box; border-radius: 0 !important; } }`;
