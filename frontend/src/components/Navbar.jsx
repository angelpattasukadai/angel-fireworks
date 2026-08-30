import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge, Container, Chip } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
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

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar position="fixed" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          
          {/* Logo */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <Box 
              component="img" 
              src={logo2} 
              alt="Angel Fireworks" 
              sx={{ height: { xs: 38, md: 48 }, objectFit: 'contain', borderRadius: '6px' }} 
            />
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50px', p: 0.5 }}>
            {navLinks.map((link) => (
              <Button 
                key={link.path}
                component={Link} 
                to={link.path} 
                sx={{
                  color: isActive(link.path) ? '#1A0B30' : '#C4B5D4',
                  fontWeight: isActive(link.path) ? 700 : 500,
                  px: 2.5,
                  py: 0.8,
                  borderRadius: '50px',
                  fontSize: '0.88rem',
                  bgcolor: isActive(link.path) ? '#D4AF37' : 'transparent',
                  boxShadow: isActive(link.path) ? '0 2px 10px rgba(212,175,55,0.4)' : 'none',
                  '&:hover': { bgcolor: isActive(link.path) ? '#D4AF37' : 'rgba(255,255,255,0.08)', color: isActive(link.path) ? '#1A0B30' : '#fff' },
                  transition: 'all 0.25s ease',
                  minWidth: 'auto',
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Checkout Button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={
                <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', minWidth: 18, height: 18 } }}>
                  <ShoppingBag size={18} />
                </Badge>
              }
              onClick={() => navigate('/checkout')}
              sx={{ 
                borderRadius: '50px', 
                px: 3.5, 
                py: 1,
                fontWeight: 700, 
                color: '#fff',
                fontSize: '0.85rem',
                boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(212,175,55,0.45)' }
              }}
            >
              Checkout
            </Button>
          </motion.div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
