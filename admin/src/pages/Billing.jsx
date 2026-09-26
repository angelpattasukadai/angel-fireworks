import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Checkbox, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Grid, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Minus, Plus, ReceiptText, Trash2, Search, PackageOpen, Printer } from 'lucide-react';
import api from '../api';
import { calculate } from '../../../shared/gst.mjs';
import BillPrint, { PRINT_STYLE } from '../components/BillPrint';

const rupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// One shared input style keeps every field on the same 14px radius as the buttons.
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' } };

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', altPhone: '', address: '', pincode: '' });
  const [discount, setDiscount] = useState('0');
  const [paid, setPaid] = useState('');
  const [paidFully, setPaidFully] = useState(true);
  const [note, setNote] = useState('');
  const [method, setMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('bill'); // 'bill' → invoice with payment; 'estimate' → quotation, no payment/stock
  const [lastInvoice, setLastInvoice] = useState(null);
  const [printDoc, setPrintDoc] = useState(null); // just-saved doc shown in the print dialog
  const [search, setSearch] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [business, setBusiness] = useState({});
  const [customerGstin, setCustomerGstin] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [placeOfSupplyName, setPlaceOfSupplyName] = useState('');

  const location = useLocation();
  const [prefilled, setPrefilled] = useState(false);

  const loadProducts = () => api.get('/products').then((r) => setProducts(r.data.filter((p) => p.inStock))).catch(() => setProducts([]));
  useEffect(() => { loadProducts(); api.get('/business').then(({ data }) => { setBusiness(data); }).catch(() => alert('Unable to load shop settings.')); }, []);

  // Pre-fill the cart from a website order sent via the Dashboard "Create Bill/Estimate" buttons.
  useEffect(() => {
    const fromOrder = location.state?.fromOrder;
    if (!fromOrder || prefilled || !products.length) return;
    const byId = new Map(products.map((p) => [String(p._id), p]));
    const byName = new Map(products.map((p) => [p.name.trim().toLowerCase(), p]));
    const newCart = [];
    let skipped = 0;
    for (const it of (fromOrder.items || [])) {
      const p = byId.get(String(it.product)) || byName.get(String(it.name || '').trim().toLowerCase());
      if (p) newCart.push({ product: p, quantity: Number(it.quantity) || 1 });
      else skipped++;
    }
    setCart(newCart);
    setCustomer({ name: fromOrder.customerName || '', phone: fromOrder.customerPhone || '', altPhone: fromOrder.customerAltPhone || '', address: fromOrder.customerAddress || '', pincode: fromOrder.customerPincode || '' });
    if (location.state?.mode === 'estimate') setMode('estimate');
    setPrefilled(true);
    if (skipped) setTimeout(() => alert(`${skipped} item(s) from the order are out of stock or no longer in the catalog and were not added.`), 300);
  }, [products, location.state, prefilled]);
  const add = (product) => setCart((old) => {
    const found = old.find((x) => x.product._id === product._id);
    return found ? old.map((x) => x.product._id === product._id ? { ...x, quantity: x.quantity + 1 } : x) : [...old, { product, quantity: 1 }];
  });
  const changeQty = (id, quantity) => setCart((old) => quantity <= 0 ? old.filter((x) => x.product._id !== id) : old.map((x) => x.product._id === id ? { ...x, quantity } : x));
  const totals = useMemo(() => {
    try {
      const result = calculate(cart.map(({ product: p, quantity }) => ({ quantity, rate: Number(p.discountedPrice || p.price), gstRate: Number(business.gstRate || 0), priceIncludesTax: business.priceIncludesTax !== false })), Number(discount), placeOfSupply !== business.stateCode);
      const received = paidFully ? result.grandTotal : (paid === '' ? 0 : Number(paid));
      return { ...result, gst: result.gstAmount, grand: result.grandTotal, received, due: Math.round((result.grandTotal - received) * 100) / 100 };
    } catch (e) { return { subtotal: 0, gst: 0, grand: 0, received: 0, due: 0, error: e.message }; }
  }, [cart, discount, paid, paidFully, placeOfSupply, business, method]);
  const save = async () => {
    if (!cart.length) return;
    setSaving(true);
    const common = { requestId, customerGstin, placeOfSupply, placeOfSupplyName, items: cart.map((x) => ({ productId: x.product._id, quantity: x.quantity })), customerName: customer.name, customerPhone: customer.phone, customerAltPhone: customer.altPhone, customerAddress: customer.address, customerPincode: customer.pincode, discountAmount: discount, note };
    try {
      const response = mode === 'estimate'
        ? await api.post('/estimates', common)
        : await api.post('/invoices', { ...common, paidAmount: totals.received, paymentMethod: method });
      setRequestId(crypto.randomUUID());
      setCustomerGstin('');
      setLastInvoice(response.data); setPrintDoc(response.data); setCart([]); setCustomer({ name: '', phone: '', altPhone: '', address: '', pincode: '' }); setDiscount('0'); setPaid(''); setPaidFully(true); setNote(''); loadProducts();
    } catch (err) { alert(err.response?.data?.error || `${mode === 'estimate' ? 'Estimate' : 'Bill'} could not be saved.`); } finally { setSaving(false); }
  };

  const visibleProducts = products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()));
  const normalTotal = cart.reduce((s, x) => s + (Number(x.product.price) || 0) * x.quantity, 0);

  return <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    {/* Header */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-end', mb: 4, flexWrap: 'wrap' }}>
      <Box>
        <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Billing</Typography>
        <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>{mode === 'estimate' ? 'New Estimate' : 'New Bill'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5 }}>
        {/* Bill / Estimate segmented toggle */}
        <Box sx={{ display: 'flex', p: 0.5, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {[['bill', 'Bill'], ['estimate', 'Estimate']].map(([key, label]) => (
            <Button key={key} onClick={() => setMode(key)} disableRipple
              sx={{ borderRadius: '10px', px: 2.5, py: 0.6, fontWeight: 800, minWidth: 0, textTransform: 'none',
                bgcolor: mode === key ? '#D4AF37' : 'transparent', color: mode === key ? '#1A0B30' : '#C4B5D4',
                '&:hover': { bgcolor: mode === key ? '#E8C84A' : 'rgba(255,255,255,0.08)' } }}>
              {label}
            </Button>
          ))}
        </Box>
        {lastInvoice && <Chip color="success" label={`${lastInvoice.invoiceNumber || lastInvoice.estimateNumber} saved`} onDelete={() => setLastInvoice(null)} sx={{ fontWeight: 800, borderRadius: '10px', height: 36, px: 0.5 }} />}
      </Box>
    </Box>

    {/* Status banners */}
    {!business.gstin && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>Save Shop GST Settings before creating bills.</Alert>}
    {business.demo && <Alert severity="warning" sx={{ mb: 2, borderRadius: '14px' }}>DEMO mode — invoices use sample shop details and are excluded from real sales.</Alert>}
    {totals.error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>{totals.error}</Alert>}

    <TextField fullWidth sx={{ mb: 3, ...fieldSx }} label="Search product name / item code" value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { const p = products.find((p) => p.sku === search.trim()); if (p) { add(p); setSearch(''); } } }}
      InputProps={{ startAdornment: <Search size={18} color="#A99BC9" style={{ marginRight: 10 }} /> }} />

    <fieldset disabled={saving} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <Grid container spacing={3}>
        {/* Products */}
        <Grid item xs={12} lg={7}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Paper className="glass-panel" sx={{ p: { xs: 2, md: 3 }, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
                <Box sx={{ bgcolor: 'rgba(212,175,55,0.12)', color: '#D4AF37', p: 1, borderRadius: '12px', display: 'flex' }}><PackageOpen size={20} /></Box>
                <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '1.1rem' }}>Add products</Typography>
              </Box>
              <Grid container spacing={1.5}>
                {visibleProducts.map((p) => (
                  <Grid item xs={12} sm={6} key={p._id}>
                    <Button disabled={saving || (p.trackStock && p.stockQuantity <= 0)} fullWidth onClick={() => add(p)}
                      sx={{ justifyContent: 'space-between', gap: 1, color: '#F6F1FF', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', p: 1.75, textTransform: 'none', bgcolor: 'rgba(255,255,255,0.03)', transition: 'all 0.2s ease', '&:hover': { borderColor: 'rgba(212,175,55,0.5)', bgcolor: 'rgba(212,175,55,0.07)', boxShadow: 'none' }, '&.Mui-disabled': { opacity: 0.4, color: '#A99BC9' } }}>
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography fontWeight={800} noWrap>{p.name}</Typography>
                        {p.description && <Typography variant="caption" color="#C4B5D4" sx={{ display: 'block' }} noWrap>{p.description}</Typography>}
                        <Typography variant="caption" color="#A99BC9" sx={{ display: 'block' }} noWrap>{p.sku || p.category} · {p.trackStock ? `${p.stockQuantity} ${p.unit}` : p.unit}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Typography color="#D4AF37" fontWeight={900}>{rupees(p.discountedPrice || p.price)}</Typography>
                        {p.discountedPrice && p.discountedPrice < p.price && <Typography variant="caption" sx={{ color: '#8E7CAD', textDecoration: 'line-through' }}>{rupees(p.price)}</Typography>}
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
              {!visibleProducts.length && (
                <Box sx={{ textAlign: 'center', py: 6, color: '#8E7CAD' }}>
                  <PackageOpen size={34} style={{ opacity: 0.5, marginBottom: 8 }} />
                  <Typography color="#A99BC9">{products.length ? 'No product matches your search.' : 'No available products. Add them in Catalog first.'}</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>

        {/* Invoice builder */}
        <Grid item xs={12} lg={5}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Paper className="glass-panel" sx={{ p: { xs: 2, md: 3 }, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
                <Box sx={{ bgcolor: 'rgba(168,85,247,0.15)', color: '#A855F7', p: 1, borderRadius: '12px', display: 'flex' }}><ReceiptText size={20} /></Box>
                <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '1.1rem' }}>Invoice</Typography>
              </Box>

              <TextField fullWidth size="small" sx={{ mb: 2, ...fieldSx }} label="Customer name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}><TextField fullWidth size="small" sx={fieldSx} label="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" sx={fieldSx} label="Secondary number" value={customer.altPhone} onChange={(e) => setCustomer({ ...customer, altPhone: e.target.value })} /></Grid>
              </Grid>
              <TextField fullWidth size="small" multiline minRows={2} sx={{ mb: 2, ...fieldSx }} label="Customer address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}><TextField fullWidth size="small" sx={fieldSx} label="Pincode" value={customer.pincode} onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })} /></Grid>
              </Grid>
              <TextField fullWidth size="small" sx={{ mb: 2, ...fieldSx }} label="Customer GSTIN (optional)" value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())} />
              <Grid container spacing={1.5} sx={{ mb: 1 }}>
                <Grid item xs={8}><TextField fullWidth size="small" sx={fieldSx} label="Place of supply state" value={placeOfSupplyName} onChange={(e) => setPlaceOfSupplyName(e.target.value)} /></Grid>
                <Grid item xs={4}><TextField fullWidth size="small" sx={fieldSx} label="Code" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} /></Grid>
              </Grid>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* Cart */}
              {cart.map((x, idx) => (
                <Box key={x.product._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.2, px: 1.2, mb: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box sx={{ flexShrink: 0, width: 26, height: 26, borderRadius: '8px', bgcolor: 'rgba(212,175,55,0.14)', color: '#D4AF37', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography color="#F6F1FF" fontWeight={700} noWrap>{x.product.name}</Typography>
                    {x.product.description && <Typography color="#C4B5D4" variant="caption" sx={{ display: 'block' }} noWrap>{x.product.description}</Typography>}
                    <Typography color="#A99BC9" variant="caption">
                      {x.product.discountedPrice && x.product.discountedPrice < x.product.price && <span style={{ textDecoration: 'line-through', marginRight: 4 }}>{rupees(x.product.price)}</span>}
                      {rupees(x.product.discountedPrice || x.product.price)}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => changeQty(x.product._id, x.quantity - 1)} sx={{ color: '#C4B5D4', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}><Minus size={15} /></IconButton>
                  <Typography color="#F6F1FF" fontWeight={800} sx={{ minWidth: 22, textAlign: 'center' }}>{x.quantity}</Typography>
                  <IconButton size="small" onClick={() => changeQty(x.product._id, x.quantity + 1)} sx={{ color: '#C4B5D4', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}><Plus size={15} /></IconButton>
                  <IconButton size="small" onClick={() => changeQty(x.product._id, 0)} sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.12)' } }}><Trash2 size={15} /></IconButton>
                </Box>
              ))}
              {!cart.length && <Typography color="#8E7CAD" sx={{ py: 4, textAlign: 'center' }}>Select products to start billing.</Typography>}

              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                <Grid item xs={mode === 'bill' ? 6 : 12}><TextField fullWidth size="small" sx={fieldSx} label="Discount ₹" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} /></Grid>
                {mode === 'bill' && <>
                  <Grid item xs={6}><TextField select fullWidth size="small" sx={fieldSx} label="Payment" value={method} onChange={(e) => setMethod(e.target.value)}>{['Cash', 'UPI', 'Card', 'Credit', 'Mixed'].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} sx={{ py: 0 }}>
                    <FormControlLabel control={<Checkbox checked={paidFully} onChange={(e) => setPaidFully(e.target.checked)} sx={{ color: '#A99BC9', '&.Mui-checked': { color: '#D4AF37' } }} />} label={<Typography sx={{ color: '#F6F1FF', fontWeight: 600 }}>Paid in full</Typography>} />
                  </Grid>
                  {!paidFully && <Grid item xs={12}><TextField fullWidth size="small" sx={fieldSx} label="Paid amount ₹" type="number" placeholder={String(totals.grand)} value={paid} onChange={(e) => setPaid(e.target.value)} /></Grid>}
                </>}
                <Grid item xs={12}><TextField fullWidth size="small" multiline minRows={2} sx={fieldSx} label="Note / Description (optional)" value={note} onChange={(e) => setNote(e.target.value)} /></Grid>
              </Grid>

              {/* Totals */}
              <Box sx={{ mt: 2.5, p: 2, borderRadius: '14px', bgcolor: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography color="#A99BC9" fontWeight={500}>Normal Total</Typography>
                  <Typography color="#A99BC9" fontWeight={600} sx={{ textDecoration: normalTotal > totals.grand ? 'line-through' : 'none' }}>{rupees(normalTotal)}</Typography>
                </Box>
                {normalTotal > totals.grand && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography color="#10b981" fontWeight={600}>You Save</Typography>
                  <Typography color="#10b981" fontWeight={700}>{rupees(normalTotal - totals.grand)}</Typography>
                </Box>}
                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="#F6F1FF" fontWeight={900} fontSize="1.05rem">Discount Total</Typography>
                  <Typography color="#D4AF37" fontWeight={900} fontSize="1.25rem">{rupees(totals.grand)}</Typography>
                </Box>
                {mode === 'bill' && <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography color="#A99BC9" fontWeight={600}>Balance due</Typography>
                  <Typography color={totals.due > 0 ? '#ef4444' : '#10b981'} fontWeight={800}>{rupees(totals.due)}</Typography>
                </Box>}
              </Box>

              <Typography color="#8E7CAD" variant="caption" sx={{ display: 'block', mt: 1.5 }}>
                {mode === 'estimate'
                  ? 'Estimate is a price quote only — no payment is taken and stock is not reduced. Convert it to a bill from the Estimates page when the customer confirms.'
                  : 'Discount is applied before GST. Blank paid amount means full payment; Credit defaults to zero.'}
              </Typography>

              <Button fullWidth disabled={!cart.length || saving || !business.gstin || !!totals.error || !customer.name.trim() || !customer.address.trim() || (mode === 'bill' && (totals.due < 0 || !Number.isFinite(totals.received) || totals.received < 0))}
                onClick={save} variant="contained" startIcon={<ReceiptText size={18} />}
                sx={{ mt: 2.5, py: 1.5, borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 900, fontSize: '1rem', '&:hover': { bgcolor: '#E8C84A' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}>
                {saving ? 'Saving…' : mode === 'estimate' ? 'Save Estimate' : 'Save Bill'}
              </Button>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </fieldset>

    {/* After saving, offer to print the bill/estimate right away */}
    <Dialog open={!!printDoc} onClose={() => setPrintDoc(null)} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#211042', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#F6F1FF' }}>
        {printDoc?.invoiceNumber ? `Bill ${printDoc.invoiceNumber} saved` : `Estimate ${printDoc?.estimateNumber || ''} saved`} ✓
      </DialogTitle>
      <DialogContent>
        {printDoc && <BillPrint doc={printDoc} kind={printDoc.invoiceNumber ? 'invoice' : 'estimate'} />}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={() => setPrintDoc(null)} sx={{ borderRadius: '12px', color: '#C4B5D4', fontWeight: 700 }}>Close</Button>
        <Button onClick={() => window.print()} variant="contained" startIcon={<Printer size={16} />} sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, '&:hover': { bgcolor: '#E8C84A' } }}>Print / Save PDF</Button>
      </DialogActions>
    </Dialog>
    <style>{PRINT_STYLE}</style>
  </Container>;
}
