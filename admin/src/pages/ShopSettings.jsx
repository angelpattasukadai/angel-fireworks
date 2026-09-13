import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, FormControlLabel, Paper, Switch, TextField, Typography } from '@mui/material';
import api from '../api';
const DEMO = { name: 'Angel Fireworks — Demo', address: '123 Sample Street, Sivakasi, Tamil Nadu 626123', gstin: '33ABCDE1234F1Z5', stateCode: '33', stateName: 'Tamil Nadu', phone: '', demo: true };
export default function ShopSettings() {
  const [form, setForm] = useState(DEMO), [busy, setBusy] = useState(true), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  useEffect(() => { api.get('/business').then(({ data }) => { if (data.gstin) setForm(data); }).catch(() => setError('Unable to load settings.')).finally(() => setBusy(false)); }, []);
  async function save() {
    setBusy(true); setError(''); setSaved(false);
    try { await api.put('/business', form); setSaved(true); } catch (e) { setError(e.response?.data?.error || 'Could not save settings.'); } finally { setBusy(false); }
  }
  return <Container maxWidth="sm" sx={{ py: 4 }}><Typography variant="h3" sx={{ mb: 3 }}>Shop GST Settings</Typography><Paper sx={{ p: 3 }}>
    <Alert severity="info" sx={{ mb: 2 }}>Sample details are prefilled. Save in demo mode to try billing. Enter your registered details before switching to real invoices.</Alert>
    {error && <Alert severity="error">{error}</Alert>}{saved && <Alert severity="success">Settings saved.</Alert>}
    {Object.entries({ name: 'Registered business name', gstin: 'GSTIN', address: 'Registered address', stateName: 'State name', stateCode: 'GST state code (2 digits)', phone: 'Phone' }).map(([key, label]) => <TextField fullWidth key={key} sx={{ mt: 2 }} label={label} value={form[key] || ''} onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setSaved(false); }} disabled={busy} />)}
    <FormControlLabel control={<Switch checked={form.demo !== false} onChange={(e) => setForm({ ...form, demo: e.target.checked })} />} label="Demo mode — mark invoices as DEMO" />
    <Button fullWidth variant="contained" sx={{ mt: 2 }} disabled={busy} onClick={save}>Save shop details</Button>
  </Paper></Container>;
}
