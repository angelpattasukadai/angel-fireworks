import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box, Chip, Skeleton, TextField, InputAdornment, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, Search, ImageOff, Minus, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { apiUrl, imgUrl } from '../config';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] } })
};

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

const Catalog = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All'); // 'All' | 'in' | 'out'
  const [quantities, setQuantities] = useState({});
  const [imgErrors, setImgErrors] = useState({});

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

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => selectedStock === 'All' || (selectedStock === 'in' ? p.inStock : !p.inStock))
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getQuantity = (id) => quantities[id] || 1;
  const setQuantity = (id, val) => {
    if (val < 1) val = 1;
    if (val > 999) val = 999;
    setQuantities({ ...quantities, [id]: val });
  };

  const handleImageError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
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
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <Chip 
                  key={cat} 
                  label={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  sx={{ 
                    fontWeight: 600, 
                    borderRadius: '12px',
                    px: 1.5,
                    py: 2.2,
                    fontSize: '0.85rem',
                    bgcolor: selectedCategory === cat ? '#111' : 'rgba(255,255,255,0.08)',
                    color: selectedCategory === cat ? '#fff' : '#C4B5D4',
                    '&:hover': { bgcolor: selectedCategory === cat ? '#222' : 'rgba(255,255,255,0.12)' },
                    transition: 'all 0.25s'
                  }} 
                />
              ))}
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            {/* Stock filter */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[{ k: 'All', label: 'All' }, { k: 'in', label: 'In Stock' }, { k: 'out', label: 'Out of Stock' }].map(s => (
                <Chip
                  key={s.k}
                  label={s.label}
                  onClick={() => setSelectedStock(s.k)}
                  sx={{
                    fontWeight: 600,
                    borderRadius: '12px',
                    px: 1.5,
                    py: 2.2,
                    fontSize: '0.85rem',
                    bgcolor: selectedStock === s.k ? (s.k === 'out' ? '#ef4444' : s.k === 'in' ? '#10b981' : '#111') : 'rgba(255,255,255,0.08)',
                    color: selectedStock === s.k ? '#fff' : '#C4B5D4',
                    '&:hover': { bgcolor: selectedStock === s.k ? undefined : 'rgba(255,255,255,0.12)' },
                    transition: 'all 0.25s'
                  }}
                />
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Results Count */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#A99BC9', fontSize: '0.9rem' }}>
            Showing <strong style={{ color: '#F6F1FF' }}>{filtered.length}</strong> products
            {selectedCategory !== 'All' && <> in <Chip label={selectedCategory} size="small" sx={{ ml: 1, fontWeight: 600, bgcolor: 'rgba(212,175,55,0.1)', color: '#D4AF37' }} /></>}
          </Typography>
        </Box>
      </Container>

      {/* ────────────────── PRODUCTS GRID ────────────────── */}
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
            filtered.map((product, index) => {
              const hasImage = product.image && !imgErrors[product._id];
              const discountPercent = product.discountedPrice ? Math.round((1 - product.discountedPrice / product.price) * 100) : null;

              return (
                <Grid item xs={6} sm={6} md={4} lg={3} key={product._id}>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index} variants={fadeUp} style={{ height: '100%' }}>
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
                          sx={{ position: 'absolute', top: 22, left: 22, bgcolor: 'rgba(255,255,255,0.95)', color: '#1A0B30', fontWeight: 700, fontSize: '0.68rem', borderRadius: '8px', backdropFilter: 'blur(4px)' }}
                        />
                        
                        {/* Discount Badge */}
                        {discountPercent > 0 && (
                          <Chip 
                            label={`${discountPercent}% OFF`} 
                            size="small" 
                            sx={{ position: 'absolute', top: 22, right: 22, bgcolor: '#D4AF37', color: '#000', fontWeight: 800, fontSize: '0.68rem', borderRadius: '8px' }} 
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

                        {/* Quantity + Add Button */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {/* Quantity Selector */}
                          <Box sx={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '12px', overflow: 'hidden' }}>
                            <Button size="small" onClick={() => setQuantity(product._id, getQuantity(product._id) - 1)} sx={{ minWidth: 32, px: 0, color: '#A99BC9' }}>
                              <Minus size={14} />
                            </Button>
                            <Typography sx={{ px: 1.5, fontWeight: 700, fontSize: '0.85rem', color: '#F6F1FF', minWidth: 24, textAlign: 'center' }}>
                              {getQuantity(product._id)}
                            </Typography>
                            <Button size="small" onClick={() => setQuantity(product._id, getQuantity(product._id) + 1)} sx={{ minWidth: 32, px: 0, color: '#A99BC9' }}>
                              <Plus size={14} />
                            </Button>
                          </Box>

                          {/* Add Button */}
                          <motion.div whileTap={{ scale: 0.95 }} style={{ flexGrow: 1 }}>
                            <Button 
                              variant="contained" fullWidth
                              startIcon={<ShoppingBag size={15} />}
                              disabled={!product.inStock}
                              onClick={() => addToCart(product, getQuantity(product._id))}
                              sx={{ 
                                bgcolor: '#111', color: '#fff', borderRadius: '12px', py: 1, fontWeight: 700, fontSize: '0.8rem',
                                '&:hover': { bgcolor: '#D4AF37', color: '#000' },
                                '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' },
                                transition: 'all 0.3s'
                              }}
                            >
                              Add
                            </Button>
                          </motion.div>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Catalog;
