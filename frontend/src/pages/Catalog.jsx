import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box, Chip, Skeleton, TextField, InputAdornment, Divider, Select, MenuItem, FormControl } from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, Search, ImageOff, Minus, ShoppingBag, Check, Download, Trash2, SlidersHorizontal, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { apiUrl, imgUrl } from '../config';
import FireworksAnimation from '../components/FireworksAnimation';
import ComboOffers from '../components/ComboOffers';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] } })
};

// Fireworks background — aerial bursts + flower-pot fountains + sparkles, fixed behind content.
const CatalogBackground = () => (
  <Box aria-hidden sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.9 }}>
    {/* soft depth glows */}
    <Box sx={{ position: 'absolute', top: '-12%', left: '-6%', width: { xs: 260, md: 420 }, height: { xs: 260, md: 420 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.1), transparent 70%)', filter: 'blur(70px)' }} />
    <Box sx={{ position: 'absolute', bottom: '-12%', right: '-6%', width: { xs: 280, md: 460 }, height: { xs: 280, md: 460 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)', filter: 'blur(80px)' }} />
    {/* rockets bursting + fountains */}
    <FireworksAnimation />
  </Box>
);

const NoImagePlaceholder = () => (
  <Box sx={{ 
    width: '100%', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    bgcolor: 'rgba(255,255,255,0.05)', 
    borderRadius: '18px',
    gap: 1.5
  }}>
    <ImageOff size={48} color="#7C6BA0" />
    <Typography sx={{ color: '#8E7CAD', fontSize: '0.85rem', fontWeight: 600 }}>No Image Available</Typography>
  </Box>
);

const Catalog = ({ addToCart, cart = [], updateCartQuantity, removeFromCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});
  const [imgErrors, setImgErrors] = useState({});
  const [visibleCount, setVisibleCount] = useState(24); // render in batches for speed

  // Reset the batch when the filters change.
  useEffect(() => { setVisibleCount(24); }, [searchTerm, selectedCategory]);

  useEffect(() => {
    axios.get(apiUrl('/api/products'))
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(() => {
        setProducts([
          { _id: '1', name: 'Golden Rain Sparklers (Pack of 10)', price: 450, discountedPrice: 90, category: 'Sparklers', image: 'https://images.unsplash.com/photo-1543881028-569d4cb7df51?w=600&auto=format&fit=crop', inStock: true, description: 'Beautiful golden sparks lasting 60 seconds' },
          { _id: '2', name: 'Titanium Flower Pot Premium', price: 800, discountedPrice: 160, category: 'Fountains', image: 'https://images.unsplash.com/photo-1533230676451-408990cf2bdf?w=600&auto=format&fit=crop', inStock: true, description: 'Silver & gold sparks reaching 10 feet' },
          { _id: '3', name: 'Midnight Symphony 100 Shots', price: 3500, discountedPrice: 700, category: 'Aerials', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop', inStock: true, description: 'Multi-color aerial shots with thunder' },
          { _id: '4', name: 'Whistling Rockets Pack (25 pcs)', price: 600, discountedPrice: 120, category: 'Rockets', image: 'https://images.unsplash.com/photo-1469502690022-f673da4c2f13?w=600&auto=format&fit=crop', inStock: true, description: 'High-flying whistling rockets' },
          { _id: '5', name: 'Giant Ground Chakkars (10 pcs)', price: 300, discountedPrice: 60, category: 'Spinners', image: 'https://images.unsplash.com/photo-1498425263435-08e0ee447816?w=600&auto=format&fit=crop', inStock: true, description: 'Colorful spinning ground display' },
          { _id: '6', name: 'Premium Wedding Celebration Box', price: 7500, discountedPrice: 1500, category: 'Gift Boxes', image: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=600&auto=format&fit=crop', inStock: true, description: 'Complete wedding fireworks package' },
          { _id: '7', name: 'Electric Sparklers (Pack of 5)', price: 250, discountedPrice: 50, category: 'Sparklers', image: '', inStock: true, description: 'Safe electric sparklers for kids' },
          { _id: '8', name: 'Multi-Shot Aerial Cake 200', price: 5000, discountedPrice: 1000, category: 'Aerials', image: '', inStock: true, description: '200-shot premium aerial cake' },
        ]);
        setLoading(false);
      });
  }, []);

  const COMBO_CAT = '🎁 Combo Packs';
  const categories = ['All', COMBO_CAT, ...new Set(products.map(p => p.category))];
  const showingCombos = selectedCategory === COMBO_CAT;
  const filtered = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const cartItem = (id) => cart.find((item) => item.product._id === id);
  const isInCart = (id) => !!cartItem(id);
  const clampQ = (n) => Math.min(999, Math.max(1, parseInt(n, 10) || 1));
  // Displayed qty follows the cart once the item is added, else the local selector.
  const displayQty = (id) => { const c = cartItem(id); return c ? c.quantity : (quantities[id] ?? 1); };
  // Changing qty edits the cart live when in cart (keeps checkout in sync), else the local selector.
  const changeQty = (id, val) => {
    const n = clampQ(val);
    if (cartItem(id)) updateCartQuantity(id, n);
    else setQuantities({ ...quantities, [id]: n });
  };

  const handleImageError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  // Opens a clean, print-ready price list of all products (customer can Save as PDF or print).
  const downloadPriceList = () => {
    if (!products.length) return;
    const byCat = {};
    products.forEach((p) => { const c = p.category || 'Others'; (byCat[c] = byCat[c] || []).push(p); });
    let sno = 0, rows = '';
    Object.keys(byCat).sort().forEach((cat) => {
      rows += `<tr class="cat"><td colspan="4">${cat}</td></tr>`;
      byCat[cat].forEach((p) => {
        sno++;
        const offer = p.discountedPrice || p.price;
        rows += `<tr><td class="c">${sno}</td><td>${p.name || ''}${p.description ? `<div class="ta">${p.description}</div>` : ''}</td><td class="r mrp">₹${p.price}</td><td class="r off">₹${offer}</td></tr>`;
      });
    });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Angel Fireworks Price List</title>
      <style>
        *{font-family:Arial,Helvetica,sans-serif}
        body{margin:24px;color:#111}
        h1{color:#B8860B;margin:0 0 2px;font-size:22px}
        .sub{color:#555;font-size:12px;margin-bottom:14px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ddd;padding:6px 8px}
        th{background:#1A0B30;color:#fff;text-align:left}
        td.r{text-align:right}td.c{text-align:center;width:36px}
        tr.cat td{background:#f3e9c6;font-weight:bold;color:#1A0B30}
        .ta{color:#666;font-size:11px}
        .mrp{text-decoration:line-through;color:#999}
        .off{color:#B8860B;font-weight:bold}
        @media print{body{margin:10px}}
      </style></head>
      <body>
        <h1>M/S Angel Pattasu Kadai — Price List</h1>
        <div class="sub">Gold Bird Brand &middot; angelpattasukadai.in &middot; ${new Date().toLocaleDateString('en-IN')}</div>
        <table><thead><tr><th>#</th><th>Item</th><th>MRP</th><th>Offer Price</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups to download the price list.'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch (e) {} }, 500);
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <CatalogBackground />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* ────────────────── PAGE HEADER ────────────────── */}
      <Box sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Our Collection</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#D4AF37', fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-1px', mb: 1 }}>
              Product Catalog
            </Typography>
            <Typography sx={{ color: '#A99BC9', fontSize: '1.05rem', maxWidth: 550 }}>
              Browse our premium selection of Angel's Gold Bird Brand fireworks — up to 80% off factory direct.
            </Typography>
            <Button onClick={downloadPriceList} variant="contained" startIcon={<Download size={18} />}
              sx={{ mt: 3, borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 3, py: 1.2, textTransform: 'none', '&:hover': { bgcolor: '#E8C84A' } }}>
              Download Price List
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* ────────────────── FILTERS ────────────────── */}
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Box className="glass-panel" sx={{ p: 3, borderRadius: '20px', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField 
              placeholder="Search fireworks..." 
              size="small" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color="#8E7CAD" /></InputAdornment> }}
              sx={{ flexGrow: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.06)' } }}
            />
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 260 } }}>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                IconComponent={(props) => <ChevronDown size={18} color="#8E7CAD" {...props} />}
                startAdornment={<InputAdornment position="start"><SlidersHorizontal size={17} color="#8E7CAD" /></InputAdornment>}
                MenuProps={{ PaperProps: { sx: { maxHeight: 360, bgcolor: 'rgba(26,11,48,0.98)', backdropFilter: 'blur(14px)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', mt: 0.5, '& .MuiMenuItem-root': { color: '#C4B5D4', fontSize: '0.88rem', '&:hover': { bgcolor: 'rgba(212,175,55,0.12)' }, '&.Mui-selected': { bgcolor: 'rgba(212,175,55,0.18)', color: '#F6F1FF', fontWeight: 700, '&:hover': { bgcolor: 'rgba(212,175,55,0.24)' } } } } } }}
                sx={{ borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.06)', color: '#F6F1FF', fontWeight: 600, fontSize: '0.9rem', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.4)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' }, '& .MuiSelect-icon': { position: 'absolute', right: 10, pointerEvents: 'none' } }}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </motion.div>

        {/* Results Count */}
        {!showingCombos && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#A99BC9', fontSize: '0.9rem' }}>
              Showing <strong style={{ color: '#F6F1FF' }}>{filtered.length}</strong> products
              {selectedCategory !== 'All' && <> in <Chip label={selectedCategory} size="small" sx={{ ml: 1, fontWeight: 600, bgcolor: 'rgba(212,175,55,0.1)', color: '#D4AF37' }} /></>}
            </Typography>
          </Box>
        )}
      </Container>

      {/* ────────────────── COMBO PACKS (shown when the Combo filter is selected) ────────────────── */}
      {showingCombos && <ComboOffers addToCart={addToCart} cart={cart} />}

      {/* ────────────────── PRODUCTS GRID ────────────────── */}
      {!showingCombos && (
      <Container maxWidth="lg" sx={{ pb: 16 }}>
        <Grid container spacing={3.5}>
          {loading ? (
            Array.from(new Array(8)).map((_, i) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={420} sx={{ borderRadius: '24px' }} />
              </Grid>
            ))
          ) : filtered.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 14 }}>
                <Search size={56} color="#6B5B8A" style={{ marginBottom: 16 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#8E7CAD', mb: 1 }}>No products found</Typography>
                <Typography sx={{ color: '#7C6BA0' }}>Try a different search or category filter.</Typography>
              </Box>
            </Grid>
          ) : (
            filtered.slice(0, visibleCount).map((product) => {
              const hasImage = product.image && !imgErrors[product._id];
              const discountPercent = product.discountedPrice ? Math.round((1 - product.discountedPrice / product.price) * 100) : null;

              return (
                <Grid item xs={6} sm={6} md={4} lg={3} key={product._id}>
                  <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -40px 0px' }} transition={{ duration: 0.3 }} style={{ height: '100%' }}>
                    <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
                      
                      {/* Image Area */}
                      <Box sx={{ p: 2, pb: 0, position: 'relative' }}>
                        <Box sx={{ borderRadius: '18px', overflow: 'hidden', aspectRatio: '1', position: 'relative', bgcolor: 'rgba(255,255,255,0.05)' }}>
                          {hasImage ? (
                            <CardMedia
                              component="img"
                              image={imgUrl(product.image)}
                              alt={product.name}
                              onError={() => handleImageError(product._id)}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', '&:hover': { transform: 'scale(1.08)' } }}
                            />
                          ) : (
                            <NoImagePlaceholder />
                          )}
                        </Box>
                        
                        {/* Category Tag */}
                        <Chip 
                          label={product.category} 
                          size="small" 
                          sx={{ position: 'absolute', top: 14, left: 14, maxWidth: 'calc(100% - 92px)', bgcolor: 'rgba(255,255,255,0.95)', color: '#1A0B30', fontWeight: 700, fontSize: '0.64rem', borderRadius: '8px', backdropFilter: 'blur(4px)', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                        />
                        
                        {/* Discount Badge */}
                        {discountPercent > 0 && (
                          <Chip 
                            label={`${discountPercent}% OFF`} 
                            size="small" 
                            sx={{ position: 'absolute', top: 14, right: 14, bgcolor: '#D4AF37', color: '#000', fontWeight: 800, fontSize: '0.64rem', borderRadius: '8px' }}
                          />
                        )}

                        {/* Out of stock overlay */}
                        {!product.inStock && (
                          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', m: 2, mb: 0 }}>
                            <Chip label="Out of Stock" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 700 }} />
                          </Box>
                        )}
                      </Box>

                      {/* Content */}
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2.5, pt: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#F6F1FF', mb: 0.5, lineHeight: 1.3, minHeight: '2.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography sx={{ color: '#B9A9D4', fontSize: '0.78rem', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {product.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#D4AF37' }}>
                              ₹{product.discountedPrice || product.price}
                            </Typography>
                            {product.discountedPrice && (
                              <Typography sx={{ textDecoration: 'line-through', color: '#7C6BA0', fontSize: '0.9rem' }}>₹{product.price}</Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Quantity + Add Button — stack on mobile so the Add button isn't squeezed */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column' }}>
                          {/* Quantity Selector */}
                          <Box sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '12px', overflow: 'hidden', width: 'fit-content', height: 46, flexShrink: 0 }}>
                            <Button size="small"
                              onClick={() => {
                                const q = clampQ(displayQty(product._id));
                                if (isInCart(product._id) && q <= 1) removeFromCart(product._id); // last one → remove from cart
                                else changeQty(product._id, q - 1);
                              }}
                              sx={{ minWidth: 42, px: 0, py: 0.6, color: isInCart(product._id) && clampQ(displayQty(product._id)) <= 1 ? '#ef4444' : '#A99BC9' }}>
                              {isInCart(product._id) && clampQ(displayQty(product._id)) <= 1 ? <Trash2 size={15} /> : <Minus size={16} />}
                            </Button>
                            <Box
                              component="input"
                              type="number"
                              value={displayQty(product._id)}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') { if (!isInCart(product._id)) setQuantities({ ...quantities, [product._id]: '' }); return; }
                                const n = parseInt(raw, 10);
                                if (!isNaN(n)) changeQty(product._id, n);
                              }}
                              onBlur={(e) => { if (!isInCart(product._id) && (e.target.value === '' || parseInt(e.target.value, 10) < 1)) setQuantities({ ...quantities, [product._id]: 1 }); }}
                              sx={{
                                width: 46, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#F6F1FF',
                                bgcolor: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', MozAppearance: 'textfield',
                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                              }}
                            />
                            <Button size="small" onClick={() => changeQty(product._id, clampQ(displayQty(product._id)) + 1)} sx={{ minWidth: 42, px: 0, py: 0.6, color: '#A99BC9' }}>
                              <Plus size={16} />
                            </Button>
                          </Box>

                          {/* Add Button — always full width, below the stepper (adds; once added it's a green confirmation, remove via − / trash) */}
                          <Box sx={{ width: '100%' }}>
                            <motion.div whileTap={{ scale: isInCart(product._id) ? 1 : 0.95 }} style={{ width: '100%' }}>
                              <Button
                                variant="contained" fullWidth disableRipple={isInCart(product._id)}
                                startIcon={isInCart(product._id) ? <Check size={16} /> : <ShoppingBag size={15} />}
                                disabled={!product.inStock}
                                onClick={() => { if (!isInCart(product._id)) addToCart(product, clampQ(displayQty(product._id))); }}
                                sx={{
                                  bgcolor: isInCart(product._id) ? '#10b981' : '#111', color: '#fff', borderRadius: '12px', height: 46, fontWeight: 700, fontSize: '0.8rem',
                                  cursor: isInCart(product._id) ? 'default' : 'pointer',
                                  '&:hover': { bgcolor: isInCart(product._id) ? '#10b981' : '#D4AF37', color: isInCart(product._id) ? '#fff' : '#000' },
                                  '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' },
                                  transition: 'all 0.3s'
                                }}
                              >
                                {isInCart(product._id) ? 'Added' : 'Add'}
                              </Button>
                            </motion.div>
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

        {!loading && filtered.length > visibleCount && (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button onClick={() => setVisibleCount((c) => c + 24)} variant="outlined"
              sx={{ borderRadius: '50px', px: 4, py: 1.3, fontWeight: 700, borderColor: 'rgba(212,175,55,0.4)', color: '#D4AF37', '&:hover': { borderColor: '#D4AF37', bgcolor: 'rgba(212,175,55,0.08)' } }}>
              Load More ({filtered.length - visibleCount} more)
            </Button>
          </Box>
        )}
      </Container>
      )}
      </Box>
    </Box>
  );
};

export default Catalog;
