import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Container, Divider, Grid, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { Minus, Plus, ReceiptText, Trash2 } from 'lucide-react';
import api from '../api';
import { calculate } from '../../../shared/gst.mjs';

const rupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [discount, setDiscount] = useState('0');
  const [paid, setPaid] = useState('');
  const [method, setMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [business, setBusiness] = useState({});
  const [customerGstin, setCustomerGstin] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('33');
  const [placeOfSupplyName, setPlaceOfSupplyName] = useState('Tamil Nadu');

  const loadProducts = () => api.get('/products').then((r) => setProducts(r.data.filter((p) => p.inStock))).catch(() => setProducts([]));
  useEffect(() => { loadProducts(); api.get('/business').then(({ data }) => { setBusiness(data); setPlaceOfSupply(data.stateCode || '33'); setPlaceOfSupplyName(data.stateName || 'Tamil Nadu'); }).catch(() => alert('Unable to load shop settings.')); }, []);
  const add = (product) => setCart((old) => {
    const found = old.find((x) => x.product._id === product._id);
    return found ? old.map((x) => x.product._id === product._id ? { ...x, quantity: x.quantity + 1 } : x) : [...old, { product, quantity: 1 }];
  });
  const changeQty = (id, quantity) => setCart((old) => quantity <= 0 ? old.filter((x) => x.product._id !== id) : old.map((x) => x.product._id === id ? { ...x, quantity } : x));
  const totals = useMemo(() => {
    try {
      const result = calculate(cart.map(({ product: p, quantity }) => ({ quantity, rate: Number(p.discountedPrice || p.price), gstRate: Number(p.gstRate || 0), priceIncludesTax: !!p.priceIncludesTax })), Number(discount), placeOfSupply !== business.stateCode);
      const received = paid === '' ? (method === 'Credit' ? 0 : result.grandTotal) : Number(paid);
      return { ...result, gst: result.gstAmount, grand: result.grandTotal, received, due: Math.round((result.grandTotal - received) * 100) / 100 };
    } catch (e) { return { subtotal: 0, gst: 0, grand: 0, received: 0, due: 0, error: e.message }; }
  }, [cart, discount, paid, placeOfSupply, business, method]);
  const save = async () => {
    if (!cart.length) return;
    setSaving(true);
    try {
      const response = await api.post('/invoices', { requestId, customerGstin, placeOfSupply, placeOfSupplyName, items: cart.map((x) => ({ productId: x.product._id, quantity: x.quantity })), customerName: customer.name, customerPhone: customer.phone, customerAddress: customer.address, discountAmount: discount, paidAmount: totals.received, paymentMethod: method });
      setRequestId(crypto.randomUUID());
      setCustomerGstin('');
      setLastInvoice(response.data); setCart([]); setCustomer({ name: '', phone: '', address: '' }); setDiscount('0'); setPaid(''); loadProducts();
    } catch (err) { alert(err.response?.data?.error || 'Bill could not be saved.'); } finally { setSaving(false); }
  };
  return <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 4, flexWrap: 'wrap' }}>
      <Box><Typography sx={{ color: '#D4AF37', fontWeight: 800, letterSpacing: 3, fontSize: '.78rem' }}>ANGEL FIREWORKS</Typography><Typography variant="h3" sx={{ color: '#F6F1FF', fontWeight: 900 }}>New Bill</Typography></Box>
      {lastInvoice && <Chip color="success" label={`${lastInvoice.invoiceNumber} saved`} onDelete={() => setLastInvoice(null)} />}
    </Box>
    {!business.gstin && <Typography color="error" sx={{ mb: 2 }}>Save Shop GST Settings before creating bills.</Typography>}
    {business.demo && <Typography sx={{ mb: 2 }}>DEMO mode — invoices use sample shop details.</Typography>}
    {totals.error && <Typography color="error">{totals.error}</Typography>}
    <TextField fullWidth sx={{ mb: 2 }} label="Search product name / item code" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { const p = products.find((p) => p.sku === search.trim()); if (p) { add(p); setSearch(''); } } }} />
    <fieldset disabled={saving} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}><Grid container spacing={3}>
      <Grid item xs={12} lg={7}><Paper className="glass-panel" sx={{ p: 2.5, borderRadius: 4 }}>
        <Typography sx={{ color: '#F6F1FF', fontWeight: 800, mb: 2 }}>Add products</Typography>
        <Grid container spacing={1.5}>{products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase())).map((p) => <Grid item xs={12} sm={6} key={p._id}><Button disabled={saving || (p.trackStock && p.stockQuantity <= 0)} fullWidth onClick={() => add(p)} sx={{ justifyContent: 'space-between', color: '#F6F1FF', border: '1px solid rgba(255,255,255,.12)', borderRadius: 2, p: 1.5, textTransform: 'none' }}><Box sx={{ textAlign: 'left' }}><Typography fontWeight={800}>{p.name}</Typography><Typography variant="caption" color="#A99BC9">{p.sku || p.category} · {p.trackStock ? `${p.stockQuantity} ${p.unit}` : 'Stock not tracked'} · {p.priceIncludesTax ? 'GST included' : 'GST extra'}</Typography></Box><Typography color="#D4AF37" fontWeight={900}>{rupees(p.discountedPrice || p.price)}</Typography></Button></Grid>)}</Grid>
        {!products.length && <Typography color="#A99BC9">No available products. Add them in Catalog first.</Typography>}
      </Paper></Grid>
      <Grid item xs={12} lg={5}><Paper className="glass-panel" sx={{ p: 2.5, borderRadius: 4 }}>
        <Typography sx={{ color: '#F6F1FF', fontWeight: 800, mb: 2 }}>Invoice</Typography>
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Customer GSTIN (optional)" value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())} />
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Customer address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Place of supply state" value={placeOfSupplyName} onChange={(e) => setPlaceOfSupplyName(e.target.value)} />
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Place of supply GST state code" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} />
        <TextField fullWidth size="small" label="Customer name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} sx={{ mb: 1.5 }} />
        <TextField fullWidth size="small" label="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} sx={{ mb: 2 }} />
        {cart.map((x) => <Box key={x.product._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}><Box sx={{ flexGrow: 1 }}><Typography color="#F6F1FF" fontWeight={700}>{x.product.name}</Typography><Typography color="#A99BC9" variant="caption">{rupees(x.product.discountedPrice || x.product.price)} · GST {x.product.gstRate || 0}%</Typography></Box><IconButton onClick={() => changeQty(x.product._id, x.quantity - 1)}><Minus size={16} /></IconButton><Typography color="#F6F1FF">{x.quantity}</Typography><IconButton onClick={() => changeQty(x.product._id, x.quantity + 1)}><Plus size={16} /></IconButton><IconButton color="error" onClick={() => changeQty(x.product._id, 0)}><Trash2 size={16} /></IconButton></Box>)}
        {!cart.length && <Typography color="#A99BC9" sx={{ py: 3, textAlign: 'center' }}>Select products to start billing.</Typography>}<Divider sx={{ my: 2 }} />
        <Grid container spacing={1.5}><Grid item xs={6}><TextField fullWidth size="small" label="Discount ₹" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} /></Grid><Grid item xs={6}><TextField select fullWidth size="small" label="Payment" value={method} onChange={(e) => setMethod(e.target.value)}>{['Cash', 'UPI', 'Card', 'Credit', 'Mixed'].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid><Grid item xs={12}><TextField fullWidth size="small" label="Paid amount ₹" type="number" placeholder={String(totals.grand)} value={paid} onChange={(e) => setPaid(e.target.value)} /></Grid></Grid>
        {[['Subtotal', totals.subtotal], ['GST', totals.gst], ['Total', totals.grand], ['Due', totals.due]].map(([label, value]) => <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.3 }}><Typography color={label === 'Total' ? '#F6F1FF' : '#A99BC9'} fontWeight={label === 'Total' ? 900 : 500}>{label}</Typography><Typography color={label === 'Total' ? '#D4AF37' : '#F6F1FF'} fontWeight={800}>{rupees(value)}</Typography></Box>)}
        <Typography sx={{ mt: 2 }}>CGST {rupees(totals.cgstAmount)} · SGST {rupees(totals.sgstAmount)} · IGST {rupees(totals.igstAmount)}</Typography>
        <Typography variant="caption">Discount is applied before GST. Blank paid amount means full payment; Credit defaults to zero.</Typography>
        <Button fullWidth disabled={!cart.length || saving || !business.gstin || !!totals.error || !customer.name.trim() || !customer.address.trim() || totals.due < 0 || !Number.isFinite(totals.received) || totals.received < 0} onClick={save} variant="contained" startIcon={<ReceiptText size={18} />} sx={{ mt: 3, py: 1.4, borderRadius: 2, bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 900, '&:hover': { bgcolor: '#E8C84A' } }}>{saving ? 'Saving…' : 'Save Bill'}</Button>
      </Paper></Grid>
    </Grid></fieldset>
  </Container>;
}
