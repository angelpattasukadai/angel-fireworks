import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button, Box, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel,
  Autocomplete, CircularProgress, Divider, Skeleton, Tooltip, Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, X, Upload, Link2, ImageOff, Package, CheckCircle2,
  XCircle, Tag, Boxes, FileSpreadsheet, Download, UploadCloud, AlertTriangle
} from 'lucide-react';
import api from '../api';
import { imgUrl } from '../config';

const EMPTY_FORM = { name: '', description: '', price: '', discountedPrice: '', category: '', image: '', sku: '', unit: 'pcs' };

// <img> that falls back to a placeholder when the src is missing or fails to load.
// Resets its "broken" state whenever the src changes, so typing/correcting a URL re-attempts
// (avoids the stale display:none bug of imperative onError DOM mutation).
const SmartImage = ({ src, alt, fallback }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  if (!src || broken) return fallback;
  return <Box component="img" src={imgUrl(src)} alt={alt} onError={() => setBroken(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

// ── A card that mirrors how the product looks on the customer website ──
const PreviewCard = ({ form }) => {
  const price = Number(form.price) || 0;
  const offer = Number(form.discountedPrice) || 0;
  const shown = offer || price;
  const discountPercent = offer && price ? Math.round((1 - offer / price) * 100) : null;

  return (
    <Card sx={{ borderRadius: '20px', overflow: 'hidden', height: '100%', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Box sx={{ p: 1.5, pb: 0, position: 'relative' }}>
        <Box sx={{ borderRadius: '14px', overflow: 'hidden', aspectRatio: '1', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SmartImage src={form.image} alt="preview" fallback={<Box sx={{ textAlign: 'center', color: '#7C6BA0' }}><ImageOff size={36} /><Typography sx={{ fontSize: '0.72rem', mt: 1 }}>No Image</Typography></Box>} />
        </Box>
        {form.category && <Chip label={form.category} size="small" sx={{ position: 'absolute', top: 20, left: 20, bgcolor: 'rgba(255,255,255,0.95)', color: '#1A0B30', fontWeight: 700, fontSize: '0.62rem', borderRadius: '8px' }} />}
        {discountPercent > 0 && <Chip label={`${discountPercent}% OFF`} size="small" sx={{ position: 'absolute', top: 20, right: 20, bgcolor: '#D4AF37', color: '#000', fontWeight: 800, fontSize: '0.62rem', borderRadius: '8px' }} />}
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#F6F1FF', lineHeight: 1.3, minHeight: '2.5rem' }}>{form.name || 'Product name'}</Typography>
        {form.description && <Typography sx={{ color: '#B9A9D4', fontSize: '0.72rem', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.description}</Typography>}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#D4AF37' }}>₹{shown}</Typography>
          {offer > 0 && <Typography sx={{ textDecoration: 'line-through', color: '#7C6BA0', fontSize: '0.85rem' }}>₹{price}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
};

const ManageCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited, or null for "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Bulk CSV/Excel import ──
  const bulkInputRef = useRef(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkErrors, setBulkErrors] = useState([]);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  // If the active category filter no longer exists (e.g. after delete/edit), fall back to "All"
  // so the admin never gets stuck on a false "No matches".
  useEffect(() => {
    if (category !== 'All' && !categories.includes(category)) setCategory('All');
  }, [categories, category]);

  const filtered = useMemo(() => products
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase())), [products, category, search]);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // ── Validation ──
  const priceNum = Number(form.price);
  const offerNum = Number(form.discountedPrice);
  const nameValid = form.name.trim().length > 0;
  const priceValid = form.price !== '' && !isNaN(priceNum) && priceNum > 0;
  const categoryValid = form.category.trim().length > 0;
  const offerFilled = form.discountedPrice !== '';
  // Offer is optional. When filled it must be positive; the "< MRP" rule only kicks in once a
  // valid MRP exists (save is blocked by priceValid until then, so this just avoids a premature error).
  const offerValid = !offerFilled || (offerNum > 0 && (!priceValid || offerNum < priceNum));
  const offerTooHigh = offerFilled && priceValid && offerNum >= priceNum;
  const formValid = nameValid && priceValid && categoryValid && offerValid;

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '', description: p.description || '', price: p.price ?? '',
      discountedPrice: p.discountedPrice ?? '', category: p.category || '',
      image: p.image || '', sku: p.sku || '', unit: p.unit || 'pcs',
    });
    setDialogOpen(true);
  };
  // Allow closing during an upload (the request has a timeout and won't hang the dialog);
  // only block while the final save is in flight.
  const closeDialog = () => { if (!saving) setDialogOpen(false); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', fd, { timeout: 30000 });
      setField('image', res.data.url);
    } catch (err) {
      const msg = err.code === 'ECONNABORTED' ? 'Upload timed out. Please try again.' : (err.response?.data?.error || 'Image upload failed. Please try again.');
      alert(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // allow re-selecting the same file
    }
  };

  const handleSave = async () => {
    if (!formValid) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: priceNum,
      discountedPrice: form.discountedPrice === '' ? null : offerNum, // null clears any existing offer
      image: form.image.trim(),
      inStock: true, // stock tracking removed — every product is always available
      sku: form.sku.trim(), unit: form.unit.trim() || 'pcs',
    };
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This removes it from the website.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting product.');
    }
  };


  // Columns the importer understands (also the template header order).
  const TEMPLATE_COLUMNS = ['name', 'description', 'price', 'discountedPrice', 'category', 'image', 'sku', 'unit'];
  // Forgiving header matching: lowercased, spaces/underscores stripped → canonical key.
  const HEADER_ALIASES = {
    id: 'id', name: 'name', productname: 'name', description: 'description', desc: 'description',
    price: 'price', mrp: 'price', discountedprice: 'discountedPrice', offerprice: 'discountedPrice', discountprice: 'discountedPrice',
    category: 'category', image: 'image', imageurl: 'image', imagelink: 'image',
    instock: 'inStock', available: 'inStock', sku: 'sku', itemcode: 'sku', code: 'sku',
    hsn: 'hsn', hsncode: 'hsn', unit: 'unit', gstrate: 'gstRate', gst: 'gstRate',
    stockquantity: 'stockQuantity', stock: 'stockQuantity', qty: 'stockQuantity',
    trackstock: 'trackStock', priceincludestax: 'priceIncludesTax', gstincluded: 'priceIncludesTax', taxinclusive: 'priceIncludesTax',
  };

  const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const downloadTemplate = () => {
    const samples = [
      { name: 'Red Sparkler 10cm', description: 'Bright red sparkler', price: 120, discountedPrice: 100, category: 'Sparklers', image: '', sku: 'SPK-RED-10', unit: 'box' },
      { name: 'Flower Pot Small', description: '', price: 80, discountedPrice: '', category: 'Flower Pots', image: '', sku: 'FP-S', unit: 'box' },
    ];
    const lines = [TEMPLATE_COLUMNS.join(','), ...samples.map((r) => TEMPLATE_COLUMNS.map((c) => csvCell(r[c])).join(','))];
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'angel-products-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Export the current catalog with a hidden `id` column so re-uploading UPDATES those rows
  // (change a few cells → only those products change) while blank-id rows are added as new.
  const downloadCatalog = () => {
    const cols = ['id', ...TEMPLATE_COLUMNS];
    const lines = [cols.join(',')];
    for (const p of products) {
      const row = {
        id: p._id, name: p.name, description: p.description, price: p.price,
        discountedPrice: p.discountedPrice ?? '', category: p.category,
        image: p.image, sku: p.sku, unit: p.unit,
      };
      lines.push(cols.map((c) => csvCell(row[c])).join(','));
    }
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `angel-catalog-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const openBulk = () => { setBulkRows([]); setBulkFileName(''); setBulkError(''); setBulkErrors([]); setBulkOpen(true); };
  const handleBulkFile = async (e) => {
    const file = e.target.files?.[0];
    if (bulkInputRef.current) bulkInputRef.current.value = '';
    if (!file) return;
    setBulkBusy(true); setBulkError(''); setBulkErrors([]); setBulkRows([]); setBulkFileName(file.name);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(await file.arrayBuffer());
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const rows = raw.map((r) => {
        const out = {};
        for (const [k, v] of Object.entries(r)) {
          const canon = HEADER_ALIASES[String(k).toLowerCase().replace(/[\s_]+/g, '')];
          if (canon) out[canon] = typeof v === 'string' ? v.trim() : v;
        }
        return out;
      }).filter((r) => String(r.name ?? '').trim() !== '' || String(r.price ?? '').trim() !== '');
      if (!rows.length) { setBulkError('No product rows found. Use the template and keep the header row.'); }
      setBulkRows(rows);
    } catch (err) {
      setBulkError('Could not read the file. Make sure it is a valid .csv or .xlsx.');
    } finally { setBulkBusy(false); }
  };

  const importBulk = async () => {
    if (!bulkRows.length) return;
    setBulkBusy(true); setBulkError(''); setBulkErrors([]);
    try {
      const res = await api.post('/products/bulk', { products: bulkRows });
      setBulkOpen(false);
      fetchProducts();
      const { created = 0, updated = 0 } = res.data;
      alert(`Import done.\n\n• ${created} new product(s) added\n• ${updated} existing product(s) re-synced from your sheet\n\nOnly the cells you changed differ — the rest stay exactly as they were.`);
    } catch (err) {
      setBulkError(err.response?.data?.error || 'Import failed. Please try again.');
      setBulkErrors(err.response?.data?.errors || []);
    } finally { setBulkBusy(false); }
  };

  const stats = [
    { icon: <Boxes size={22} />, label: 'Total Products', value: products.length, color: '#D4AF37' },
    { icon: <Tag size={22} />, label: 'Categories', value: categories.length, color: '#A855F7' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 5 }}>
        <Box>
          <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Catalog</Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Manage Products</Typography>
          <Typography sx={{ color: '#A99BC9', fontSize: '0.95rem', mt: 1 }}>Add, edit, price & upload images. Changes appear on the customer website on refresh.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<FileSpreadsheet size={18} />} onClick={openBulk}
            sx={{ borderRadius: '14px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, px: 3, py: 1.3, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37', bgcolor: 'rgba(212,175,55,0.06)' } }}>
            Bulk Upload
          </Button>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={openAdd}
            sx={{ borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 3.5, py: 1.3, '&:hover': { bgcolor: '#E8C84A' } }}>
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Paper className="glass-card" sx={{ p: 2.5, borderRadius: '18px', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: `${s.color}15`, p: 1.5, borderRadius: '12px', color: s.color, display: 'flex' }}>{s.icon}</Box>
              <Box>
                <Typography sx={{ color: '#A99BC9', fontSize: '0.78rem', fontWeight: 600 }}>{s.label}</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#F6F1FF' }}>{s.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box className="glass-panel" sx={{ p: 2.5, borderRadius: '18px', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 4 }}>
        <TextField
          placeholder="Search products..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color="#8E7CAD" /></InputAdornment> }}
          sx={{ flexGrow: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)' } }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['All', ...categories].map(cat => (
            <Chip key={cat} label={cat} onClick={() => setCategory(cat)}
              sx={{ fontWeight: 600, borderRadius: '10px', bgcolor: category === cat ? '#D4AF37' : 'rgba(255,255,255,0.08)', color: category === cat ? '#1A0B30' : '#C4B5D4', '&:hover': { bgcolor: category === cat ? '#E8C84A' : 'rgba(255,255,255,0.12)' } }} />
          ))}
        </Box>
      </Box>

      {/* Product Grid */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(8)).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}><Skeleton variant="rectangular" height={360} sx={{ borderRadius: '20px' }} /></Grid>
          ))
        ) : filtered.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Package size={52} color="#6B5B8A" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#8E7CAD', mb: 1 }}>{products.length === 0 ? 'No products yet' : 'No matches'}</Typography>
              <Typography sx={{ color: '#7C6BA0', mb: 3 }}>{products.length === 0 ? 'Add your first product to show it on the website.' : 'Try a different search or category.'}</Typography>
              {products.length === 0 && <Button variant="contained" startIcon={<Plus size={16} />} onClick={openAdd} sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 700, '&:hover': { bgcolor: '#E8C84A' } }}>Add Product</Button>}
            </Box>
          </Grid>
        ) : (
          filtered.map((p, index) => {
            const discountPercent = p.discountedPrice ? Math.round((1 - p.discountedPrice / p.price) * 100) : null;
            return (
              <Grid item xs={6} sm={4} md={3} key={p._id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.4) }} style={{ height: '100%' }}>
                  <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden' }}>
                    <Box sx={{ p: 1.5, pb: 0, position: 'relative' }}>
                      <Box sx={{ borderRadius: '14px', overflow: 'hidden', aspectRatio: '1', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SmartImage src={p.image} alt={p.name} fallback={<Box sx={{ textAlign: 'center', color: '#7C6BA0' }}><ImageOff size={34} /></Box>} />
                      </Box>
                      {p.category && <Chip label={p.category} size="small" sx={{ position: 'absolute', top: 20, left: 20, bgcolor: 'rgba(255,255,255,0.95)', color: '#1A0B30', fontWeight: 700, fontSize: '0.62rem', borderRadius: '8px' }} />}
                      {discountPercent > 0 && <Chip label={`${discountPercent}% OFF`} size="small" sx={{ position: 'absolute', top: 20, right: 20, bgcolor: '#D4AF37', color: '#000', fontWeight: 800, fontSize: '0.62rem', borderRadius: '8px' }} />}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#F6F1FF', lineHeight: 1.3, mb: 0.5, minHeight: '2.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#D4AF37' }}>₹{p.discountedPrice || p.price}</Typography>
                        {p.discountedPrice && <Typography sx={{ textDecoration: 'line-through', color: '#7C6BA0', fontSize: '0.8rem' }}>₹{p.price}</Typography>}
                      </Box>

                      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button fullWidth size="small" variant="outlined" startIcon={<Edit size={14} />} onClick={() => openEdit(p)}
                            sx={{ borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}>Edit</Button>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}><Trash2 size={15} /></IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#211042', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F6F1FF' }}>
          {editing ? 'Edit Product' : 'Add New Product'}
          <IconButton onClick={closeDialog} sx={{ color: '#A99BC9' }}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Grid container spacing={4}>
            {/* Left: Form */}
            <Grid item xs={12} md={7}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Product Name" value={form.name} onChange={(e) => setField('name', e.target.value)}
                    required error={form.name.length > 0 && !nameValid}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} multiline rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete freeSolo options={categories} value={form.category}
                    onChange={(e, val) => setField('category', val || '')}
                    onInputChange={(e, val) => setField('category', val)}
                    renderInput={(params) => <TextField {...params} label="Category" required error={form.category.length > 0 && !categoryValid} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth label="MRP (₹)" type="number" value={form.price} onChange={(e) => setField('price', e.target.value)}
                    required error={form.price !== '' && !priceValid}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth label="Item code" value={form.sku} onChange={(e) => setField('sku', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth label="Unit" value={form.unit} onChange={(e) => setField('unit', e.target.value)} placeholder="pcs / box" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth label="Offer (₹)" type="number" value={form.discountedPrice} onChange={(e) => setField('discountedPrice', e.target.value)}
                    error={offerFilled && !offerValid}
                    helperText={offerTooHigh ? 'Must be less than MRP' : (offerFilled && !offerValid ? 'Enter a valid amount' : ' ')}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>

                {/* GST & HSN are now one shop-wide setting (Shop GST Settings), not per product. */}
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }}><Typography sx={{ color: '#8E7CAD', fontSize: '0.75rem', fontWeight: 700 }}>PRODUCT IMAGE</Typography></Divider>
                  <TextField fullWidth label="Image URL (or upload below)" value={form.image} onChange={(e) => setField('image', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Link2 size={16} color="#8E7CAD" /></InputAdornment> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, alignItems: 'center' }}>
                    <Button variant="outlined" startIcon={uploading ? <CircularProgress size={15} sx={{ color: '#D4AF37' }} /> : <Upload size={16} />} disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}>
                      {uploading ? 'Uploading…' : 'Upload from device'}
                    </Button>
                    {form.image && <Button size="small" onClick={() => setField('image', '')} sx={{ color: '#ef4444', fontWeight: 700 }}>Remove</Button>}
                  </Box>
                  <Typography sx={{ color: '#7C6BA0', fontSize: '0.72rem', mt: 1 }}>JPG, PNG, WEBP or GIF · up to 5 MB</Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Right: Live preview */}
            <Grid item xs={12} md={5}>
              <Typography sx={{ color: '#8E7CAD', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, mb: 1.5, textTransform: 'uppercase' }}>Live Website Preview</Typography>
              <PreviewCard form={form} />
              <Typography sx={{ color: '#7C6BA0', fontSize: '0.72rem', mt: 1.5, textAlign: 'center' }}>This is how customers will see it in the catalog.</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ borderRadius: '12px', color: '#A99BC9' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formValid || saving || uploading}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#1A0B30' }} /> : null}
            sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 4, '&:hover': { bgcolor: '#E8C84A' }, '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}>
            {saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Bulk import dialog ── */}
      <Dialog open={bulkOpen} onClose={() => !bulkBusy && setBulkOpen(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#211042', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#F6F1FF', display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <FileSpreadsheet size={22} color="#D4AF37" /> Bulk Upload Products
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#A99BC9', fontSize: '0.9rem', mb: 2 }}>
            <strong style={{ color: '#F6F1FF' }}>To add new products:</strong> download the blank template, fill it, upload.<br />
            <strong style={{ color: '#F6F1FF' }}>To edit existing ones:</strong> download the current catalog, change the cells you want, upload it back — rows keep their hidden <em>id</em>, so only what you changed updates. Any row with a blank id is added as new.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Button sx={{ flex: 1, minWidth: 180, borderRadius: '14px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, py: 1.2, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}
              variant="outlined" startIcon={<Download size={18} />} onClick={downloadTemplate}>
              Blank Template
            </Button>
            <Button disabled={!products.length} sx={{ flex: 1, minWidth: 180, borderRadius: '14px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, py: 1.2, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}
              variant="outlined" startIcon={<Download size={18} />} onClick={downloadCatalog}>
              Current Catalog ({products.length})
            </Button>
          </Box>

          <input ref={bulkInputRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={handleBulkFile} />
          <Box onClick={() => !bulkBusy && bulkInputRef.current?.click()}
            sx={{ cursor: bulkBusy ? 'default' : 'pointer', textAlign: 'center', p: 4, borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.18)', bgcolor: 'rgba(255,255,255,0.03)', transition: 'all 0.2s ease', '&:hover': { borderColor: 'rgba(212,175,55,0.5)', bgcolor: 'rgba(212,175,55,0.05)' } }}>
            {bulkBusy ? <CircularProgress size={26} sx={{ color: '#D4AF37' }} /> : <UploadCloud size={34} color="#D4AF37" />}
            <Typography sx={{ color: '#F6F1FF', fontWeight: 700, mt: 1.2 }}>{bulkFileName || 'Click to choose a CSV / Excel file'}</Typography>
            <Typography sx={{ color: '#8E7CAD', fontSize: '0.78rem', mt: 0.5 }}>.csv, .xlsx or .xls (max 500 products)</Typography>
          </Box>

          {bulkRows.length > 0 && !bulkError && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <CheckCircle2 size={20} color="#10b981" />
              <Typography sx={{ color: '#F6F1FF', fontWeight: 700 }}>{bulkRows.length} product row(s) ready to import.</Typography>
            </Box>
          )}

          {bulkError && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: '14px', bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ef4444', fontWeight: 700 }}><AlertTriangle size={18} /> {bulkError}</Box>
              {bulkErrors.length > 0 && (
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3, color: '#F6F1FF', fontSize: '0.82rem', maxHeight: 180, overflowY: 'auto' }}>
                  {bulkErrors.map((e, i) => <li key={i}>{e}</li>)}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button disabled={bulkBusy} onClick={() => setBulkOpen(false)} sx={{ borderRadius: '12px', color: '#C4B5D4', fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" disabled={bulkBusy || !bulkRows.length} onClick={importBulk} startIcon={<UploadCloud size={18} />}
            sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, '&:hover': { bgcolor: '#E8C84A' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}>
            {bulkBusy ? 'Working…' : `Import ${bulkRows.length || ''} Products`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageCatalog;
