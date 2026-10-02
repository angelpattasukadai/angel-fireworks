import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CategoryArt from './CategoryArt';

// Our real catalog categories, each given its own theme + SVG illustration.
// `img` is optional: drop a custom banner later and it shows instead of the art.
const CATEGORIES = [
  { name: 'Sparklers',        grad: 'linear-gradient(145deg,#B8860B,#8A6508)', img: null },
  { name: 'Flower Pots',      grad: 'linear-gradient(145deg,#C2410C,#7C2208)', img: null },
  { name: 'Chakkar & Wheels', grad: 'linear-gradient(145deg,#7C3AED,#4C1D95)', img: null },
  { name: 'Aerial Shots',     grad: 'linear-gradient(145deg,#1D4ED8,#172554)', img: null },
  { name: 'Fancy Shots',      grad: 'linear-gradient(145deg,#DB2777,#831843)', img: null },
  { name: 'Bombs',            grad: 'linear-gradient(145deg,#B91C1C,#7F1D1D)', img: null },
  { name: 'Rockets',          grad: 'linear-gradient(145deg,#0E7490,#164E63)', img: null },
  { name: 'Fancy Novelties',  grad: 'linear-gradient(145deg,#15803D,#14532D)', img: null },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: (i % 4) * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] } }),
};

const CategoryShowcase = () => {
  const navigate = useNavigate();
  const open = (cat) => navigate(`/catalog?category=${encodeURIComponent(cat)}`);

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography sx={{ color: '#D4AF37', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>
            Our Crackers
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#F6F1FF', fontSize: { xs: '1.9rem', md: '3rem' }, letterSpacing: '-1px' }}>
            Shop by <Box component="span" sx={{ color: '#D4AF37' }}>Category</Box>
          </Typography>
          <Typography sx={{ color: '#C4B5D4', fontSize: { xs: '0.92rem', md: '1.05rem' }, mt: 1.5, maxWidth: 560, mx: 'auto' }}>
            From sparklers to sky-shaking aerials — pick a category and explore.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {CATEGORIES.map((cat, i) => {
            return (
              <Grid item xs={6} sm={4} md={3} key={cat.name}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} style={{ height: '100%' }}>
                  <Box
                    onClick={() => open(cat.name)}
                    role="button"
                    sx={{
                      position: 'relative', cursor: 'pointer', height: '100%',
                      borderRadius: '22px', overflow: 'hidden',
                      border: '1.5px solid rgba(212,175,55,0.3)',
                      background: cat.grad,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 44px rgba(212,175,55,0.3)' },
                      '&:hover .shopnow': { bgcolor: '#D4AF37', color: '#1A0B30' },
                      '&:hover .cat-icon': { transform: 'scale(1.12) rotate(-6deg)' },
                    }}
                  >
                    {/* Optional custom image overlay */}
                    {cat.img && <Box component="img" src={cat.img} alt={cat.name} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}

                    {/* Sparkle texture */}
                    <Box sx={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(circle at 20% 15%, #fff 0.5px, transparent 1.5px), radial-gradient(circle at 70% 30%, #fff 0.5px, transparent 1.5px), radial-gradient(circle at 45% 70%, #fff 0.5px, transparent 1.5px), radial-gradient(circle at 85% 80%, #fff 0.5px, transparent 1.5px)', backgroundSize: '100% 100%' }} />
                    {/* Bottom shade for text legibility */}
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

                    <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 2.5 }, minHeight: { xs: 170, sm: 200, md: 230 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box className="cat-icon" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, transition: 'transform 0.3s', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }}>
                        <Box sx={{ width: { xs: 86, sm: 100, md: 112 } }}>
                          <CategoryArt name={cat.name} />
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '0.95rem', md: '1.15rem' }, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                          {cat.name}
                        </Typography>
                        <Box className="shopnow" sx={{ mt: 1.2, display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.6, py: 0.6, borderRadius: '50px', bgcolor: 'rgba(255,255,255,0.9)', color: '#1A0B30', fontWeight: 800, fontSize: '0.72rem', transition: 'all 0.3s' }}>
                          Shop Now <ArrowRight size={13} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 7 } }}>
          <Button onClick={() => navigate('/catalog')} variant="outlined" endIcon={<ArrowRight size={18} />}
            sx={{ borderRadius: '50px', px: 4, py: 1.3, fontWeight: 700, borderColor: 'rgba(212,175,55,0.5)', color: '#D4AF37', '&:hover': { borderColor: '#D4AF37', bgcolor: 'rgba(212,175,55,0.08)' } }}>
            View All Products
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CategoryShowcase;
