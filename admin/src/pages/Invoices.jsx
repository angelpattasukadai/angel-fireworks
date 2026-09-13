import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import api from '../api';

const money = (n) => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

export default function Invoices() {
  const [rows, setRows] = useState([]), [page, setPage] = useState(0), [search, setSearch] = useState('');
  const [summary, setSummary] = useState({}), [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(''), [method, setMethod] = useState('Cash');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function load() {
    setBusy(true); setError('');
    try {
      const [invoices, totals] = await Promise.all([api.get(`/invoices?page=${page}`), api.get('/invoices/summary/today')]);
      setRows(invoices.data); setSummary(totals.data);
    } catch (e) { setError(e.response?.data?.error || 'Unable to load bills. Try again.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, [page]);
  async function collect() {
    setBusy(true); setError('');
    try {
      const { data } = await api.post(`/invoices/${selected._id}/payments`, { amount, method, requestId });
      setSelected(data); setAmount(''); setRequestId(crypto.randomUUID()); await load();
    } catch (e) { setError(e.response?.data?.error || 'Payment result uncertain. Retry without changing the amount.'); }
    finally { setBusy(false); }
  }
  const visible = rows.filter((r) => `${r.invoiceNumber} ${r.customerName} ${r.customerPhone}`.toLowerCase().includes(search.toLowerCase()));
  return <Container maxWidth="xl" sx={{ py: 4 }}>
    <Typography variant="h3" sx={{ mb: 3 }}>Bills & Payments</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
      {[['Today’s sales (IST)', money(summary.sales)], ['Today’s bills', summary.invoiceCount || 0], ['All outstanding dues', money(summary.totalDue)]].map(([label, value]) => <Paper key={label} sx={{ p: 3, flex: 1, minWidth: 180 }}><Typography>{label}</Typography><Typography variant="h5">{value}</Typography></Paper>)}
    </Box>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}><TextField label="Search this page: bill / customer / phone" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth /><Button disabled={busy} onClick={load}>Refresh</Button></Box>
    <Paper sx={{ overflowX: 'auto' }}><Table><TableHead><TableRow>{['Bill', 'Customer', 'Date', 'Total', 'Paid', 'Due', 'Status', ''].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>
      {visible.map((r) => <TableRow key={r._id}><TableCell>{r.invoiceNumber}</TableCell><TableCell>{r.customerName}<br />{r.customerPhone}</TableCell><TableCell>{new Date(r.createdAt).toLocaleDateString('en-IN')}</TableCell><TableCell>{money(r.grandTotal)}</TableCell><TableCell>{money(r.paidAmount)}</TableCell><TableCell>{money(r.dueAmount)}</TableCell><TableCell>{r.status}</TableCell><TableCell><Button onClick={() => { setSelected(r); setAmount(''); setRequestId(crypto.randomUUID()); }}>View / Print</Button></TableCell></TableRow>)}
      {!visible.length && <TableRow><TableCell colSpan={8}>{busy ? 'Loading…' : 'No bills found.'}</TableCell></TableRow>}
    </TableBody></Table></Paper>
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}><Button disabled={!page || busy} onClick={() => setPage(page - 1)}>Previous</Button><Typography sx={{ p: 1 }}>Page {page + 1}</Typography><Button disabled={rows.length < 100 || busy} onClick={() => setPage(page + 1)}>Next</Button></Box>
    <Dialog open={!!selected} onClose={() => !busy && setSelected(null)} fullWidth maxWidth="md">
      <DialogTitle>Bill details</DialogTitle><DialogContent>
        {selected && <Box id="invoice-print" sx={{ bgcolor: 'white', color: '#111', p: 3, '& th, & td': { color: '#111', borderColor: '#ddd' } }}>
          <Typography variant="h4">{selected.business?.name || 'Angel Fireworks'}</Typography><Typography>{selected.business?.demo ? 'DEMO — NOT FOR TAX USE' : selected.business?.gstin ? 'Tax Invoice' : 'Legacy sales receipt'} · {selected.invoiceNumber}</Typography>
          <Typography>{selected.business?.address}<br />GSTIN: {selected.business?.gstin || 'Not configured'} · {selected.business?.phone}</Typography>
          <Typography>{new Date(selected.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</Typography>
          <Typography sx={{ my: 2 }}>{selected.customerName} · {selected.customerPhone}<br />{selected.customerAddress}</Typography>
          <Typography>Customer GSTIN: {selected.customerGstin || 'Unregistered'}<br />Place of supply: {selected.placeOfSupplyName} ({selected.placeOfSupply})<br />Reverse charge: No</Typography>
          <Table size="small"><TableHead><TableRow>{['Item', 'Qty / Unit', 'Rate', 'Tax', 'Amount'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{selected.items.map((i, n) => <TableRow key={n}><TableCell>{i.name}</TableCell><TableCell>{i.quantity} {i.unit}</TableCell><TableCell>{money(i.rate)}</TableCell><TableCell>{money(i.gstAmount)}</TableCell><TableCell>{money(i.total)}</TableCell></TableRow>)}</TableBody></Table>
          <Box sx={{ textAlign: 'right', mt: 2 }}>{[['Subtotal', selected.subtotal], [selected.business?.gstin ? 'Pre-tax discount' : 'Post-tax discount', selected.discountAmount], ['Tax', selected.gstAmount], ['Total', selected.grandTotal], ['Paid', selected.paidAmount], ['Balance due', selected.dueAmount]].map(([label, value]) => <Typography key={label}>{label}: {money(value)}</Typography>)}</Box>
          <Typography sx={{ mt: 2 }}>Payment history</Typography>{selected.payments?.map((p, i) => <Typography key={i} variant="body2">{new Date(p.date).toLocaleDateString('en-IN')} · {p.method} · {money(p.amount)}</Typography>)}
          {selected.business?.gstin && <Box sx={{ mt: 2 }}>
            <Typography variant="h6">GST breakdown</Typography>
            <Table size="small"><TableHead><TableRow>{['Item / HSN', 'Taxable', 'GST %', 'CGST', 'SGST', 'IGST'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{selected.items.map((i, n) => <TableRow key={n}><TableCell>{i.name} / {i.hsn}</TableCell><TableCell>{money(i.taxableAmount)}</TableCell><TableCell>{i.gstRate}%</TableCell><TableCell>{money(i.cgstAmount)}</TableCell><TableCell>{money(i.sgstAmount)}</TableCell><TableCell>{money(i.igstAmount)}</TableCell></TableRow>)}</TableBody></Table>
            <Typography sx={{ mt: 2 }}>Taxable value: {money(selected.taxableAmount)} · CGST: {money(selected.cgstAmount)} · SGST: {money(selected.sgstAmount)} · IGST: {money(selected.igstAmount)}</Typography>
            <Typography sx={{ mt: 5, textAlign: 'right' }}>For {selected.business.name}<br /><br />Authorized signatory</Typography>
          </Box>}
        </Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {selected?.dueAmount > 0 && <Box sx={{ display: 'flex', gap: 2, mt: 3 }}><TextField label="Receive payment ₹" type="number" value={amount} disabled={busy} onChange={(e) => setAmount(e.target.value)} /><TextField select label="Method" value={method} disabled={busy} onChange={(e) => setMethod(e.target.value)}>{['Cash', 'UPI', 'Card', 'Mixed'].map((m) => <MenuItem value={m} key={m}>{m}</MenuItem>)}</TextField><Button disabled={busy || !(Number(amount) > 0) || Number(amount) > selected.dueAmount} onClick={collect}>Record payment</Button></Box>}
      </DialogContent><DialogActions><Button disabled={busy} onClick={() => setSelected(null)}>Close</Button><Button onClick={() => window.print()}>Print / Save PDF</Button></DialogActions>
    </Dialog>
    <style>{`@media print { body * { visibility: hidden !important; } #invoice-print, #invoice-print * { visibility: visible !important; } .MuiDialog-container { display: block !important; height: auto !important; } .MuiDialog-paper { position: absolute !important; top: 0; left: 0; margin: 0 !important; max-height: none !important; max-width: none !important; width: 100% !important; box-shadow: none !important; overflow: visible !important; } .MuiDialogContent-root { overflow: visible !important; padding: 0 !important; } .MuiDialogTitle-root, .MuiDialogActions-root { display: none !important; } #invoice-print { width: 100%; box-sizing: border-box; } }`}</style>
  </Container>;
}
