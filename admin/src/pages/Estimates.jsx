import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Printer, FileCheck2, Ban } from 'lucide-react';
import api from '../api';
import BillPrint, { PRINT_STYLE } from '../components/BillPrint';

const money = (n) => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' } };
const statusColor = (s) => (s === 'Converted' ? '#10b981' : s === 'Cancelled' ? '#ef4444' : '#f59e0b');

export default function Estimates() {
  const [rows, setRows] = useState([]), [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get('page'), 10) || 0);
  const setPage = (p) => setSearchParams((prev) => { const next = new URLSearchParams(prev); if (p > 0) next.set('page', String(p)); else next.delete('page'); return next; });

  async function load() {
    setBusy(true); setError('');
    try { const { data } = await api.get(`/estimates?page=${page}`); setRows(data); }
    catch (e) { setError(e.response?.data?.error || 'Unable to load estimates. Try again.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, [page]);

  async function convert() {
    if (!window.confirm(`Convert ${selected.estimateNumber} into a bill? Stock will be reduced and a new invoice created (fully due).`)) return;
    setBusy(true); setError('');
    try {
      const { data } = await api.post(`/estimates/${selected._id}/convert`);
      setSelected(null); await load();
      alert(`Bill ${data.invoiceNumber} created from ${selected.estimateNumber}. Collect payment in Bills & Payments.`);
    } catch (e) { setError(e.response?.data?.error || 'Could not convert this estimate.'); }
    finally { setBusy(false); }
  }
  async function cancel() {
    if (!window.confirm(`Cancel ${selected.estimateNumber}? It can no longer be converted.`)) return;
    setBusy(true); setError('');
    try { const { data } = await api.post(`/estimates/${selected._id}/cancel`); setSelected(data); await load(); }
    catch (e) { setError(e.response?.data?.error || 'Could not cancel this estimate.'); }
    finally { setBusy(false); }
  }

  const visible = rows.filter((r) => `${r.estimateNumber} ${r.customerName} ${r.customerPhone}`.toLowerCase().includes(search.toLowerCase()));

  return <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Billing</Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Estimates</Typography>
    </Box>

    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>{error}</Alert>}

    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      <TextField sx={{ flexGrow: 1, minWidth: 220, ...fieldSx }} label="Search: estimate no / customer / phone" value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <Search size={18} color="#A99BC9" style={{ marginRight: 10 }} /> }} />
      <Button disabled={busy} onClick={load} variant="outlined" startIcon={<RefreshCw size={16} />}
        sx={{ borderRadius: '14px', px: 3, borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, '&:hover': { borderColor: '#D4AF37', bgcolor: 'rgba(212,175,55,0.06)' } }}>Refresh</Button>
    </Box>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Paper className="glass-panel" sx={{ borderRadius: '24px', overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 800, color: '#A99BC9', fontSize: '0.78rem', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '2px solid rgba(255,255,255,0.1)' } }}>
                {['#', 'Estimate', 'Customer', 'Date', 'Total', 'Status', ''].map((h) => <TableCell key={h}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((r, idx) => (
                <TableRow key={r._id} hover sx={{ '&:hover': { bgcolor: 'rgba(212,175,55,0.03)' }, '& td': { borderColor: 'rgba(255,255,255,0.06)' } }}>
                  <TableCell sx={{ color: '#A99BC9', fontWeight: 700 }}>{page * 100 + idx + 1}</TableCell>
                  <TableCell sx={{ color: '#D4AF37', fontWeight: 800 }}>{r.estimateNumber}</TableCell>
                  <TableCell sx={{ color: '#F6F1FF' }}><Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.customerName}</Typography><Typography sx={{ color: '#A99BC9', fontSize: '0.78rem' }}>{r.customerPhone}</Typography></TableCell>
                  <TableCell sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell sx={{ color: '#F6F1FF', fontWeight: 700 }}>{money(r.grandTotal)}</TableCell>
                  <TableCell><Chip label={r.status === 'Converted' ? `→ ${r.convertedInvoiceNumber || 'Bill'}` : r.status} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: '8px', bgcolor: `${statusColor(r.status)}1A`, color: statusColor(r.status) }} /></TableCell>
                  <TableCell><Button size="small" onClick={() => { setSelected(r); setError(''); }} sx={{ borderRadius: '10px', fontWeight: 700, color: '#D4AF37', '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' } }}>View / Print</Button></TableCell>
                </TableRow>
              ))}
              {!visible.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: '#8E7CAD', borderColor: 'rgba(255,255,255,0.06)' }}>{busy ? 'Loading…' : 'No estimates yet. Create one from the New Bill page (Estimate mode).'}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </motion.div>

    <Box sx={{ display: 'flex', gap: 2, mt: 2.5, alignItems: 'center' }}>
      <Button disabled={!page || busy} onClick={() => setPage(page - 1)} variant="outlined" sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', '&:hover': { borderColor: '#D4AF37' } }}>Previous</Button>
      <Typography sx={{ color: '#A99BC9', fontWeight: 700 }}>Page {page + 1}</Typography>
      <Button disabled={rows.length < 100 || busy} onClick={() => setPage(page + 1)} variant="outlined" sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', '&:hover': { borderColor: '#D4AF37' } }}>Next</Button>
    </Box>

    <Dialog open={!!selected} onClose={() => !busy && setSelected(null)} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#211042', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#F6F1FF' }}>Estimate details</DialogTitle>
      <DialogContent>
        {selected && <BillPrint doc={selected} kind="estimate" />}
        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: '14px' }}>{error}</Alert>}
        {selected?.status === 'Converted' && <Alert severity="success" sx={{ mt: 2, borderRadius: '14px' }}>Converted to bill {selected.convertedInvoiceNumber}.</Alert>}
        {selected?.status === 'Cancelled' && <Alert severity="warning" sx={{ mt: 2, borderRadius: '14px' }}>This estimate was cancelled.</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
        {selected?.status === 'Open' && <>
          <Button disabled={busy} onClick={cancel} startIcon={<Ban size={16} />} sx={{ borderRadius: '12px', color: '#ef4444', fontWeight: 700 }}>Cancel Estimate</Button>
          <Button disabled={busy} onClick={convert} variant="contained" startIcon={<FileCheck2 size={16} />} sx={{ borderRadius: '12px', bgcolor: '#10b981', color: '#04231a', fontWeight: 800, '&:hover': { bgcolor: '#0ea371' } }}>Convert to Bill</Button>
        </>}
        <Box sx={{ flexGrow: 1 }} />
        <Button disabled={busy} onClick={() => setSelected(null)} sx={{ borderRadius: '12px', color: '#C4B5D4', fontWeight: 700 }}>Close</Button>
        <Button onClick={() => window.print()} variant="contained" startIcon={<Printer size={16} />} sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, '&:hover': { bgcolor: '#E8C84A' } }}>Print / Save PDF</Button>
      </DialogActions>
    </Dialog>
    <style>{PRINT_STYLE}</style>
  </Container>;
}
