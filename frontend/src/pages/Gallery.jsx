import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Dialog, IconButton, Skeleton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import axios from 'axios';
import { apiUrl, imgUrl } from '../config';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] } })
};

const Gallery = () => {
  // Gallery is fully driven by the backend/DB — whatever the admin adds is exactly what shows here.
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    axios.get(apiUrl('/api/gallery'))
      .then(res => {
        const items = (res.data || [])
          .filter(img => img.active !== false && img.image)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(img => ({ src: imgUrl(img.image), title: img.title || '' }));
        setGalleryImages(items);
      })
      .catch(() => setGalleryImages([]))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (index) => {
    setSelectedIdx(index);
    setSelectedImg(galleryImages[index]);
  };

  const closeLightbox = () => setSelectedImg(null);

  const goNext = (e) => {
    e.stopPropagation();
    const next = (selectedIdx + 1) % galleryImages.length;
    setSelectedIdx(next);
    setSelectedImg(galleryImages[next]);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    const prev = (selectedIdx - 1 + galleryImages.length) % galleryImages.length;
    setSelectedIdx(prev);
    setSelectedImg(galleryImages[prev]);
  };

  return (
    <Box sx={{ overflowX: 'hidden' }}>

      {/* ────────────────── HEADER ────────────────── */}
      <Box sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Brand Gallery</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px', mb: 1 }}>Our Fireworks in Action</Typography>
            <Typography sx={{ color: '#A99BC9', fontSize: '1.05rem', maxWidth: 550 }}>
              A glimpse into the brilliance of Angel Fireworks — from our factory floors to your celebration skies.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* ────────────────── GALLERY GRID ────────────────── */}
      <Container maxWidth="lg" sx={{ pb: 16 }}>
        {loading ? (
          <Grid container spacing={2.5}>
            {Array.from(new Array(8)).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton variant="rectangular" sx={{ borderRadius: '20px', aspectRatio: '1', height: 'auto', bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Grid>
            ))}
          </Grid>
        ) : galleryImages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 14 }}>
            <ImageOff size={56} color="#6B5B8A" style={{ marginBottom: 16 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#8E7CAD', mb: 1 }}>Gallery Coming Soon</Typography>
            <Typography sx={{ color: '#7C6BA0' }}>Our latest celebration photos will appear here shortly.</Typography>
          </Box>
        ) : (
        <Grid container spacing={2.5}>
          {galleryImages.map((img, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Box 
                  onClick={() => openLightbox(i)}
                  sx={{ 
                    position: 'relative', 
                    borderRadius: '20px', 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    aspectRatio: '1',
                    '&:hover img': { transform: 'scale(1.1)' },
                    '&:hover .overlay': { opacity: 1 },
                  }}
                >
                  <Box 
                    component="img"
                    src={img.src}
                    alt={img.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
                  />
                  <Box className="overlay" sx={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.75))',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: 2.5
                  }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{img.title}</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        )}
      </Container>

      {/* ────────────────── LIGHTBOX ────────────────── */}
      <Dialog 
        open={!!selectedImg} 
        onClose={closeLightbox} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', borderRadius: '24px', overflow: 'hidden', maxHeight: '90vh' } }}
      >
        {selectedImg && (
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 3 } }}>
            {/* Close Button */}
            <IconButton onClick={closeLightbox} sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', zIndex: 10, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <X size={22} />
            </IconButton>

            {/* Prev Button */}
            <IconButton onClick={goPrev} sx={{ position: 'absolute', left: 16, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', zIndex: 10, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <ChevronLeft size={28} />
            </IconButton>

            {/* Image */}
            <Box sx={{ textAlign: 'center', maxWidth: '100%' }}>
              <Box 
                component="img"
                src={selectedImg.src}
                alt={selectedImg.title}
                sx={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', objectFit: 'contain' }}
              />
              <Typography sx={{ color: '#fff', fontWeight: 700, mt: 2, fontSize: '1.1rem' }}>{selectedImg.title}</Typography>
              <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem', mt: 0.5 }}>{selectedIdx + 1} / {galleryImages.length}</Typography>
            </Box>

            {/* Next Button */}
            <IconButton onClick={goNext} sx={{ position: 'absolute', right: 16, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', zIndex: 10, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <ChevronRight size={28} />
            </IconButton>
          </Box>
        )}
      </Dialog>

    </Box>
  );
};

export default Gallery;
