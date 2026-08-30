import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button, Box, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel,
  CircularProgress, Divider, Skeleton, Tooltip, Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, Upload, Link2, ImageOff, Images, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import { imgUrl } from '../config';

const EMPTY_FORM = { title: '', image: '', order: 0, active: true };

// <img> that falls back to a placeholder; resets on src change (no stale display:none).
const SmartImage = ({ src, alt, fallback }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  if (!src || broken) return fallback;
  return <Box component="img" src={imgUrl(src)} alt={alt} onError={() => setBroken(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

const ManageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchImages = () => {
    setLoading(true);
    api.get('/gallery')
      .then(res => setImages(res.data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const imageValid = form.image.trim().length > 0;

  const openAdd = () => {
    setEditing(null);
    // default order = next after the current highest
    const nextOrder = images.length ? Math.max(...images.map(i => i.order || 0)) + 1 : 0;
    setForm({ ...EMPTY_FORM, order: nextOrder });
    setDialogOpen(true);
  };
  const openEdit = (img) => {
    setEditing(img);
    setForm({ title: img.title || '', image: img.image || '', order: img.order ?? 0, active: img.active !== false });
    setDialogOpen(true);
  };
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
      const msg = err.code === 'ECONNABORTED' ? 'Upload timed out. Please try again.' : (err.response?.data?.error || 'Image upload failed.');
      alert(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!imageValid) return;
    setSaving(true);
    const payload = { title: form.title.trim(), image: form.image.trim(), order: Number(form.order) || 0, active: form.active };
    try {
      if (editing) await api.put(`/gallery/${editing._id}`, payload);
      else await api.post('/gallery', payload);
      setDialogOpen(false);
      fetchImages();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving image.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (img) => {
    if (!window.confirm('Delete this gallery image? It will be removed from the website.')) return;
    try {
      await api.delete(`/gallery/${img._id}`);
      fetchImages();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting image.');
    }
  };

  const toggleActive = async (img) => {
    try {
      await api.put(`/gallery/${img._id}`, { active: !img.active });
      setImages(prev => prev.map(x => x._id === img._id ? { ...x, active: !x.active } : x));
    } catch (err) {
      alert('Could not update visibility.');
    }
  };

  const activeCount = images.filter(i => i.active !== false).length;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 5 }}>
        <Box>
          <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Gallery</Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Manage Gallery</Typography>
          <Typography sx={{ color: '#A99BC9', fontSize: '0.95rem', mt: 1 }}>{activeCount} shown on the website · {images.length} total. Lower order number appears first.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={openAdd}
          sx={{ borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 3.5, py: 1.3, '&:hover': { bgcolor: '#E8C84A' } }}>
          Add Image
        </Button>
      </Box>

      {/* Grid */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(8)).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}><Skeleton variant="rectangular" height={260} sx={{ borderRadius: '20px' }} /></Grid>
          ))
        ) : images.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Images size={52} color="#6B5B8A" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#8E7CAD', mb: 1 }}>No gallery images yet</Typography>
              <Typography sx={{ color: '#7C6BA0', mb: 3 }}>Add images to showcase on the website's Gallery page.</Typography>
              <Button variant="contained" startIcon={<Plus size={16} />} onClick={openAdd} sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 700, '&:hover': { bgcolor: '#E8C84A' } }}>Add Image</Button>
            </Box>
          </Grid>
        ) : (
          images.map((img, index) => (
            <Grid item xs={6} sm={4} md={3} key={img._id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.4) }} style={{ height: '100%' }}>
                <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden', opacity: img.active === false ? 0.6 : 1 }}>
                  <Box sx={{ position: 'relative', aspectRatio: '1', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SmartImage src={img.image} alt={img.title} fallback={<Box sx={{ textAlign: 'center', color: '#7C6BA0' }}><ImageOff size={34} /></Box>} />
                    <Chip label={`#${img.order ?? 0}`} size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', fontWeight: 700, fontSize: '0.62rem' }} />
                    {img.active === false && <Chip label="Hidden" size="small" sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(239,68,68,0.85)', color: '#fff', fontWeight: 700, fontSize: '0.62rem' }} />}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#F6F1FF', mb: 1.5, minHeight: '1.2rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{img.title || <span style={{ color: '#7C6BA0' }}>No caption</span>}</Typography>
                    <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={<Switch size="small" checked={img.active !== false} onChange={() => toggleActive(img)} />}
                        label={<Typography sx={{ fontSize: '0.78rem', color: img.active !== false ? '#10b981' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>{img.active !== false ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Hidden</>}</Typography>}
                        sx={{ m: 0 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button fullWidth size="small" variant="outlined" startIcon={<Edit size={14} />} onClick={() => openEdit(img)}
                          sx={{ borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}>Edit</Button>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(img)} sx={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}><Trash2 size={15} /></IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#211042', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F6F1FF' }}>
          {editing ? 'Edit Image' : 'Add Gallery Image'}
          <IconButton onClick={closeDialog} sx={{ color: '#A99BC9' }}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {/* Preview */}
          <Box sx={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <SmartImage src={form.image} alt="preview" fallback={<Box sx={{ textAlign: 'center', color: '#7C6BA0' }}><ImageOff size={40} /><Typography sx={{ fontSize: '0.75rem', mt: 1 }}>No Image</Typography></Box>} />
          </Box>

          <TextField fullWidth label="Caption (optional)" value={form.title} onChange={(e) => setField('title', e.target.value)}
            sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />

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

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2.5 }} />
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField label="Display order" type="number" value={form.order} onChange={(e) => setField('order', e.target.value)}
              helperText="Lower = shown first" sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <FormControlLabel
              control={<Switch checked={form.active} onChange={(e) => setField('active', e.target.checked)} />}
              label={<Typography sx={{ color: '#F6F1FF', fontWeight: 600 }}>Visible on website</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ borderRadius: '12px', color: '#A99BC9' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!imageValid || saving || uploading}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#1A0B30' }} /> : null}
            sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 4, '&:hover': { bgcolor: '#E8C84A' }, '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Add Image'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageGallery;
