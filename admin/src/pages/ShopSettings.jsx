import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, FormControlLabel, Paper, Switch, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Store, Save } from 'lucide-react';
import api from '../api';

const DEMO = { name: 'Angel Fireworks', address: '123 Sample Street, Sivakasi, Tamil Nadu 626123', gstin: '33ABCDE1234F1Z5', stateCode: '33', stateName: 'Tamil Nadu', phone: '', demo: true, gstRate: '18', hsn: '3604', priceIncludesTax: true };
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' } };
const FIELDS = { name: 'Registered business name', gstin: 'GSTIN', address: 'Registered address', stateName: 'State name', stateCode: 'GST state code (2 digits)', phone: 'Phone', gstRate: 'Overall GST rate (%) — applies to all items', hsn: 'Overall HSN code (fireworks = 3604)' };

export default function ShopSettings() {
  const [form, setForm] = useState(DEMO), [busy, setBusy] = useState(true), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  useEffect(() => { api.get('/business').then(({ data }) => { if (data.gstin) setForm(data); }).catch(() => setError('Unable to load settings.')).finally(() => setBusy(false)); }, []);
  async function save() {
    setBusy(true); setError(''); setSaved(false);
    try { await api.put('/business', form); setSaved(true); } catch (e) { setError(e.response?.data?.error || 'Could not save settings.'); } finally { setBusy(false); }
  }

  return <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Billing</Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Shop GST Settings</Typography>
    </Box>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Paper className="glass-panel" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '20px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
          <Box sx={{ bgcolor: 'rgba(212,175,55,0.12)', color: '#D4AF37', p: 1, borderRadius: '12px', display: 'flex' }}><Store size={20} /></Box>
          <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '1.1rem' }}>Business details</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2, borderRadius: '14px' }}>Sample details are prefilled. Save in demo mode to try billing. Enter your registered details before switching to real invoices.</Alert>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>{error}</Alert>}
        {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: '14px' }}>Settings saved.</Alert>}

        {Object.entries(FIELDS).map(([key, label]) => (
          <TextField fullWidth key={key} sx={{ mb: 2, ...fieldSx }} label={label} value={form[key] || ''} onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setSaved(false); }} disabled={busy} />
        ))}

        <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', mb: 1.5 }}>
          <FormControlLabel
            control={<Switch checked={form.priceIncludesTax !== false} onChange={(e) => { setForm({ ...form, priceIncludesTax: e.target.checked }); setSaved(false); }} disabled={busy} />}
            label={<Box><Typography sx={{ color: '#F6F1FF', fontWeight: 700, fontSize: '0.95rem' }}>Prices include GST</Typography><Typography sx={{ color: '#A99BC9', fontSize: '0.78rem' }}>ON: the catalog price is the final price and GST is worked out from inside it. OFF: GST is added on top of the price.</Typography></Box>} />
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', mb: 1 }}>
          <FormControlLabel
            control={<Switch checked={form.demo !== false} onChange={(e) => { setForm({ ...form, demo: e.target.checked }); setSaved(false); }} disabled={busy} />}
            label={<Box><Typography sx={{ color: '#F6F1FF', fontWeight: 700, fontSize: '0.95rem' }}>Demo mode</Typography><Typography sx={{ color: '#A99BC9', fontSize: '0.78rem' }}>Invoices marked DEMO and kept out of real sales totals.</Typography></Box>} />
        </Box>

        <Button fullWidth variant="contained" startIcon={<Save size={18} />} disabled={busy} onClick={save}
          sx={{ mt: 2, py: 1.5, borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 900, fontSize: '1rem', '&:hover': { bgcolor: '#E8C84A' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}>
          {busy ? 'Saving…' : 'Save shop details'}
        </Button>
      </Paper>
    </motion.div>
  </Container>;
}
