import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { IndianRupee, ReceiptText, AlertCircle, Search, RefreshCw, Printer } from 'lucide-react';
import api from '../api';
import BillPrint, { PRINT_STYLE } from '../components/BillPrint';

const money = (n) => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' } };
const statusColor = (s) => (s === 'Paid' ? '#10b981' : s === 'Partial' ? '#f59e0b' : '#ef4444');

export default function Invoices() {
  const [rows, setRows] = useState([]), [search, setSearch] = useState('');
  // Page lives in the URL (?page=N) so a refresh or bookmark keeps you on the same page.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page'), 10) || 0);
  const setPage = (p) => setSearchParams((prev) => { const next = new URLSearchParams(prev); if (p > 0) next.set('page', String(p)); else next.delete('page'); return next; });
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

  const stats = [
    { icon: <IndianRupee size={22} />, label: 'Today’s sales (IST)', value: money(summary.sales), color: '#D4AF37' },
    { icon: <ReceiptText size={22} />, label: 'Today’s bills', value: summary.invoiceCount || 0, color: '#A855F7' },
    { icon: <AlertCircle size={22} />, label: 'All outstanding dues', value: money(summary.totalDue), color: '#ef4444' },
  ];

  return <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Billing</Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Bills &amp; Payments</Typography>
    </Box>

    {/* Summary cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((s, i) => (
        <Grid item xs={12} sm={4} key={s.label}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: `${s.color}18`, color: s.color, p: 1.6, borderRadius: '14px', display: 'flex' }}>{s.icon}</Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: '#A99BC9', fontSize: '0.82rem', fontWeight: 600 }} noWrap>{s.label}</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#F6F1FF' }} noWrap>{s.value}</Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      ))}
    </Grid>

    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>{error}</Alert>}

    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      <TextField sx={{ flexGrow: 1, minWidth: 220, ...fieldSx }} label="Search this page: bill / customer / phone" value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <Search size={18} color="#A99BC9" style={{ marginRight: 10 }} /> }} />
      <Button disabled={busy} onClick={load} variant="outlined" startIcon={<RefreshCw size={16} />}
        sx={{ borderRadius: '14px', px: 3, borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, '&:hover': { borderColor: '#D4AF37', bgcolor: 'rgba(212,175,55,0.06)' } }}>Refresh</Button>
    </Box>

    <Paper className="glass-panel" sx={{ borderRadius: '24px', overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 780 }}>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 800, color: '#A99BC9', fontSize: '0.78rem', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '2px solid rgba(255,255,255,0.1)', bgcolor: 'transparent' } }}>
              {['#', 'Bill', 'Customer', 'Date', 'Total', 'Paid', 'Due', 'Status', ''].map((h) => <TableCell key={h}>{h}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((r, idx) => (
              <TableRow key={r._id} hover sx={{ '&:hover': { bgcolor: 'rgba(212,175,55,0.03)' }, '& td': { borderColor: 'rgba(255,255,255,0.06)' } }}>
                <TableCell sx={{ color: '#A99BC9', fontWeight: 700 }}>{page * 100 + idx + 1}</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 800 }}>{r.invoiceNumber}</TableCell>
                <TableCell sx={{ color: '#F6F1FF' }}><Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.customerName}</Typography><Typography sx={{ color: '#A99BC9', fontSize: '0.78rem' }}>{r.customerPhone}</Typography></TableCell>
                <TableCell sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</TableCell>
                <TableCell sx={{ color: '#F6F1FF', fontWeight: 700 }}>{money(r.grandTotal)}</TableCell>
                <TableCell sx={{ color: '#F6F1FF' }}>{money(r.paidAmount)}</TableCell>
                <TableCell sx={{ color: r.dueAmount > 0 ? '#ef4444' : '#A99BC9', fontWeight: r.dueAmount > 0 ? 800 : 500 }}>{money(r.dueAmount)}</TableCell>
                <TableCell><Chip label={r.status} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: '8px', bgcolor: `${statusColor(r.status)}1A`, color: statusColor(r.status) }} /></TableCell>
                <TableCell><Button size="small" onClick={() => { setSelected(r); setAmount(''); setRequestId(crypto.randomUUID()); }} sx={{ borderRadius: '10px', fontWeight: 700, color: '#D4AF37', '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' } }}>View / Print</Button></TableCell>
              </TableRow>
            ))}
            {!visible.length && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 8, color: '#8E7CAD', borderColor: 'rgba(255,255,255,0.06)' }}>{busy ? 'Loading…' : 'No bills found.'}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Box>
    </Paper>

    <Box sx={{ display: 'flex', gap: 2, mt: 2.5, alignItems: 'center' }}>
      <Button disabled={!page || busy} onClick={() => setPage(page - 1)} variant="outlined" sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', '&:hover': { borderColor: '#D4AF37' } }}>Previous</Button>
      <Typography sx={{ color: '#A99BC9', fontWeight: 700 }}>Page {page + 1}</Typography>
      <Button disabled={rows.length < 100 || busy} onClick={() => setPage(page + 1)} variant="outlined" sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', '&:hover': { borderColor: '#D4AF37' } }}>Next</Button>
    </Box>

    <Dialog open={!!selected} onClose={() => !busy && setSelected(null)} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#211042', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#F6F1FF' }}>Bill details</DialogTitle>
      <DialogContent>
        {selected && <BillPrint doc={selected} kind="invoice" />}
        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: '14px' }}>{error}</Alert>}
        {selected?.dueAmount > 0 && <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" sx={fieldSx} label="Receive payment ₹" type="number" value={amount} disabled={busy} onChange={(e) => setAmount(e.target.value)} />
          <TextField select size="small" sx={{ minWidth: 120, ...fieldSx }} label="Method" value={method} disabled={busy} onChange={(e) => setMethod(e.target.value)}>{['Cash', 'UPI', 'Card', 'Mixed'].map((m) => <MenuItem value={m} key={m}>{m}</MenuItem>)}</TextField>
          <Button disabled={busy || !(Number(amount) > 0) || Number(amount) > selected.dueAmount} onClick={collect} variant="contained" sx={{ borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, '&:hover': { bgcolor: '#E8C84A' } }}>Record payment</Button>
        </Box>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button disabled={busy} onClick={() => setSelected(null)} sx={{ borderRadius: '12px', color: '#C4B5D4', fontWeight: 700 }}>Close</Button>
        <Button onClick={() => window.print()} variant="contained" startIcon={<Printer size={16} />} sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, '&:hover': { bgcolor: '#E8C84A' } }}>Print / Save PDF</Button>
      </DialogActions>
    </Dialog>
    <style>{PRINT_STYLE}</style>
  </Container>;
}
