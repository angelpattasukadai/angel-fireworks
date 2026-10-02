import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge, Container, IconButton, Drawer, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import logo2 from '../assets/logo2.png';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Catalog', path: '/catalog' },
  { label: 'Wholesale', path: '/wholesale' },
  { label: 'About', path: '/about' },
  { label: 'Gallery', path: '/gallery' },
];

const Navbar = ({ cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar position="fixed" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.5 }}>

          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
            <Box component="img" src={logo2} alt="Angel Fireworks" sx={{ height: { xs: 36, md: 48 }, objectFit: 'contain', borderRadius: '6px' }} />
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50px', p: 0.5 }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  color: isActive(link.path) ? '#1A0B30' : '#C4B5D4',
                  fontWeight: isActive(link.path) ? 700 : 500,
                  px: 2.5, py: 0.8, borderRadius: '50px', fontSize: '0.88rem',
                  bgcolor: isActive(link.path) ? '#D4AF37' : 'transparent',
                  boxShadow: isActive(link.path) ? '0 2px 10px rgba(212,175,55,0.4)' : 'none',
                  '&:hover': { bgcolor: isActive(link.path) ? '#D4AF37' : 'rgba(255,255,255,0.08)', color: isActive(link.path) ? '#1A0B30' : '#fff' },
                  transition: 'all 0.25s ease', minWidth: 'auto',
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Right side: Checkout + mobile hamburger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="contained" color="primary"
                startIcon={
                  <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', minWidth: 18, height: 18 } }}>
                    <ShoppingBag size={18} />
                  </Badge>
                }
                onClick={() => navigate('/checkout')}
                sx={{
                  borderRadius: '50px', px: { xs: 2, md: 3.5 }, py: 1, fontWeight: 700, color: '#fff',
                  fontSize: '0.85rem', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(212,175,55,0.45)' },
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Checkout</Box>
              </Button>
            </motion.div>

            {/* Hamburger — mobile only */}
            <IconButton onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#F6F1FF' }} aria-label="Open menu">
              <MenuIcon size={24} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 260, bgcolor: 'rgba(22, 6, 46, 0.98)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#F6F1FF' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Box component="img" src={logo2} alt="Angel Fireworks" sx={{ height: 36, borderRadius: '6px' }} />
          <IconButton onClick={() => setOpen(false)} sx={{ color: '#C4B5D4' }} aria-label="Close menu"><X size={22} /></IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List sx={{ p: 1.5 }}>
          {navLinks.map((link) => (
            <ListItemButton
              key={link.path}
              component={Link}
              to={link.path}
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: '12px', mb: 0.5, py: 1.3,
                bgcolor: isActive(link.path) ? '#D4AF37' : 'transparent',
                '&:hover': { bgcolor: isActive(link.path) ? '#E8C84A' : 'rgba(255,255,255,0.06)' },
              }}
            >
              <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: isActive(link.path) ? 800 : 600, color: isActive(link.path) ? '#1A0B30' : '#F6F1FF' }} />
            </ListItemButton>
          ))}
          <ListItemButton
            component={Link} to="/checkout" onClick={() => setOpen(false)}
            sx={{ borderRadius: '12px', mt: 1, py: 1.3, bgcolor: 'rgba(212,175,55,0.14)', '&:hover': { bgcolor: 'rgba(212,175,55,0.22)' } }}
          >
            <ShoppingBag size={18} color="#D4AF37" style={{ marginRight: 12 }} />
            <ListItemText primary={`Checkout${cartCount ? ` (${cartCount})` : ''}`} primaryTypographyProps={{ fontWeight: 800, color: '#D4AF37' }} />
          </ListItemButton>
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
