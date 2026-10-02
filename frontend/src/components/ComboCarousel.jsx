import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, Chip, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Gift, Sparkles } from 'lucide-react';
import { combos, comboToProduct } from '../data/combos';
import combo2999 from '../assets/combo-2999.jpg';
import combo4999 from '../assets/combo-4999.jpg';
import combo9999 from '../assets/combo-9999.jpg';

const IMG = { 'combo-2999': combo2999, 'combo-4999': combo4999, 'combo-9999': combo9999 };
const slides = combos.map((c) => ({ combo: c, img: IMG[c.id] }));

const AUTO_MS = 4000;

const ComboCarousel = ({ addToCart, cart = [] }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next) => {
    setDir(next > index || (index === slides.length - 1 && next === 0) ? 1 : -1);
    setIndex((next + slides.length) % slides.length);
  }, [index]);

  // Auto-advance (pauses on hover/touch)
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [paused]);

  const { combo, img } = slides[index];
  const added = cart.some((c) => c.product?._id === combo.id);

  const enquire = () => {
    if (addToCart && !added) addToCart(comboToProduct(combo), 1);
    navigate('/checkout');
  };

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.98 }),
  };

  return (
    <Box sx={{ py: { xs: 6, md: 9 }, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3.5, md: 5 } }}>
          <Chip icon={<Gift size={15} color="#1A0B30" />} label="COMBO PACK OFFERS" sx={{ bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 900, mb: 2, px: 1, py: 2, fontSize: { xs: '0.68rem', sm: '0.78rem' }, letterSpacing: 1 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#F6F1FF', fontSize: { xs: '1.8rem', md: '2.8rem' }, letterSpacing: '-1px' }}>
            Grab a <Box component="span" sx={{ color: '#D4AF37' }}>Combo Deal</Box>
          </Typography>
          <Typography sx={{ color: '#C4B5D4', fontSize: { xs: '0.9rem', md: '1.05rem' }, mt: 1 }}>
            Full assortment, one fixed price — tap to enquire.
          </Typography>
        </Box>

        {/* Carousel stage */}
        <Box
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          sx={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1.5px solid rgba(212,175,55,0.35)',
            background: 'radial-gradient(circle at 50% 0%, rgba(42,17,80,0.9), rgba(15,4,36,0.95))',
            boxShadow: '0 20px 55px rgba(0,0,0,0.5)',
            p: { xs: 1.2, md: 2 },
          }}
        >
          {/* Slide image */}
          <Box sx={{ position: 'relative', height: { xs: 300, sm: 440, md: 540 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.img
                key={combo.id}
                src={img}
                alt={combo.name}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                onClick={enquire}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 14, cursor: 'pointer' }}
              />
            </AnimatePresence>

            {/* Arrows */}
            <IconButton onClick={() => go(index - 1)} aria-label="Previous"
              sx={{ position: 'absolute', left: { xs: 4, md: 10 }, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'rgba(212,175,55,0.8)', color: '#1A0B30' } }}>
              <ChevronLeft size={22} />
            </IconButton>
            <IconButton onClick={() => go(index + 1)} aria-label="Next"
              sx={{ position: 'absolute', right: { xs: 4, md: 10 }, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'rgba(212,175,55,0.8)', color: '#1A0B30' } }}>
              <ChevronRight size={22} />
            </IconButton>
          </Box>

          {/* Price + CTA bar */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', px: { xs: 1, md: 2 }, pt: 1.5, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography sx={{ color: '#F6F1FF', fontWeight: 900, fontSize: { xs: '1.5rem', md: '2rem' } }}>₹{combo.price.toLocaleString('en-IN')}</Typography>
              <Typography sx={{ color: '#A99BC9', fontSize: { xs: '0.78rem', md: '0.9rem' } }}>
                {combo.items.length} varieties • {combo.items.reduce((a, it) => a + it.qty, 0)} items
              </Typography>
            </Box>
            <Button onClick={enquire} variant="contained" startIcon={<Sparkles size={18} />}
              sx={{ borderRadius: '50px', px: { xs: 3, md: 4 }, py: 1.2, fontWeight: 800, fontSize: { xs: '0.85rem', md: '0.95rem' }, bgcolor: added ? '#2E7D32' : '#D4AF37', color: added ? '#fff' : '#1A0B30', '&:hover': { bgcolor: added ? '#2E7D32' : '#E8C84A' } }}>
              {added ? 'Added — Go to Enquiry' : 'Enquire This Pack'}
            </Button>
          </Box>

          {/* Dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pb: 1 }}>
            {slides.map((s, i) => (
              <Box key={s.combo.id} onClick={() => go(i)}
                sx={{ width: i === index ? 26 : 9, height: 9, borderRadius: '50px', cursor: 'pointer', transition: 'all 0.3s', bgcolor: i === index ? '#D4AF37' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ComboCarousel;
