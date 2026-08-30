import React from 'react';
import { Box, Typography, Container, Divider, Grid } from '@mui/material';
import { MapPin, Phone, Mail } from 'lucide-react';
import logo1 from '../assets/logo1.png';

const Footer = () => {
  return (
    <Box component="footer" sx={{ pt: 10, pb: 5, mt: 'auto', backgroundColor: 'rgba(14, 4, 32, 0.6)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box component="img" src={logo1} alt="Angel Fireworks" sx={{ height: 60, borderRadius: '10px' }} />
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#F6F1FF' }}>ANGEL FIREWORKS</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 600 }}>Gold Bird Brand</Typography>
              </Box>
            </Box>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
              Premium quality fireworks sourced directly from Sivakasi. Over 15 years of trust, quality, and brilliance. We sell our own manufactured brand.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '1.05rem' }}>Quick Links</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Typography component="a" href="/" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: '#D4AF37' }, transition: 'color 0.2s' }}>Home</Typography>
              <Typography component="a" href="/catalog" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: '#D4AF37' }, transition: 'color 0.2s' }}>Product Catalog</Typography>
              <Typography component="a" href="/about" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: '#D4AF37' }, transition: 'color 0.2s' }}>About Us</Typography>
              <Typography component="a" href="/gallery" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: '#D4AF37' }, transition: 'color 0.2s' }}>Gallery</Typography>
              <Typography component="a" href="/checkout" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: '#D4AF37' }, transition: 'color 0.2s' }}>Place Order</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '1.05rem' }}>Contact Us</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MapPin size={16} color="#D4AF37" />
                <Typography component="a" href="https://share.google/JoLvNHNDKfrShJjZM" target="_blank" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: '#D4AF37' }, transition: 'color 0.2s' }}>
                  Sivakasi, Tamil Nadu
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone size={16} color="#D4AF37" />
                <Box>
                  <Typography component="a" href="tel:+916374254296" color="text.secondary" sx={{ textDecoration: 'none', display: 'block', '&:hover': { color: '#D4AF37' } }}>+91 6374254296</Typography>
                  <Typography component="a" href="tel:+918220802867" color="text.secondary" sx={{ textDecoration: 'none', display: 'block', '&:hover': { color: '#D4AF37' } }}>+91 8220802867</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Mail size={16} color="#D4AF37" />
                <Typography color="text.secondary">info@angelfireworks.com</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} Angel Fireworks Industries — Gold Bird Brand. All rights reserved. | Proudly Manufactured in India 🇮🇳
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
