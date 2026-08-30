import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Sparkles, Percent, MapPin, Building, Star, Clock, Truck, Award, PhoneCall } from 'lucide-react';
import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import addPoster from '../assets/add.jpeg';
import FireworksAnimation from '../components/FireworksAnimation';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] } })
};

const Home = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>

      {/* ────────────────── FULL WIDTH HERO ────────────────── */}
      <Box sx={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        pt: { xs: 6, md: 0 },
        pb: { xs: 8, md: 0 }
      }}>
        {/* Decorative gold blobs */}
        <Box sx={{ position: 'absolute', top: '-15%', right: '-8%', width: 650, height: 650, background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: '-25%', left: '-12%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }} />

        {/* Fireworks Animation */}
        <FireworksAnimation />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left: Text Content */}
            <Grid item xs={12} md={7}>
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <Chip 
                  icon={<Percent size={14} color="#D4AF37" />} 
                  label="MEGA OFFER — UP TO 80% OFF" 
                  sx={{ bgcolor: 'rgba(212,175,55,0.1)', color: '#D4AF37', fontWeight: 800, mb: 4, px: 1.5, py: 2.5, fontSize: '0.8rem', letterSpacing: 1.5, borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }} 
                />
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
                <Typography variant="h1" sx={{ fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, lineHeight: 1.05, mb: 3, color: '#F6F1FF', letterSpacing: '-2px' }}>
                  Light Up Your <br />
                  <Box component="span" sx={{ color: '#D4AF37', fontStyle: 'italic' }}>Celebrations</Box>
                </Typography>
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
                <Typography sx={{ color: '#C4B5D4', mb: 5, maxWidth: '90%', lineHeight: 1.9, fontSize: '1.15rem' }}>
                  Welcome to <strong style={{ color: '#F6F1FF' }}>Angel Fireworks</strong> — your premium online crackers store from the authentic fireworks city of <strong style={{ color: '#D4AF37' }}>Sivakasi</strong>. Own brand. Factory direct pricing. Over 15 years of trust.
                </Typography>
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 6 }}>
                  <Button 
                    component={Link} to="/catalog"
                    variant="contained" size="large" endIcon={<ArrowRight size={18} />}
                    sx={{ bgcolor: '#D4AF37', color: '#1A0B30', px: 5, py: 2, fontSize: '1.05rem', borderRadius: '50px', fontWeight: 800, boxShadow: '0 8px 25px rgba(212,175,55,0.35)', '&:hover': { bgcolor: '#E8C84A', transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(212,175,55,0.5)' }, transition: 'all 0.3s' }}
                  >
                    View Catalog
                  </Button>
                  <Button 
                    component="a" href="https://share.google/JoLvNHNDKfrShJjZM" target="_blank"
                    variant="outlined" size="large" startIcon={<MapPin size={18} />}
                    sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', px: 4, py: 2, fontSize: '1rem', borderRadius: '50px', fontWeight: 600, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' }, transition: 'all 0.3s' }}
                  >
                    Visit Store
                  </Button>
                </Box>
              </motion.div>

              {/* Floating Stats Row */}
              <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[
                    { value: '15+', label: 'Years' },
                    { value: '3', label: 'Factories' },
                    { value: '80%', label: 'Off MRP' },
                    { value: '10K+', label: 'Customers' },
                  ].map((stat, i) => (
                    <Box key={i} sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#D4AF37', lineHeight: 1 }}>{stat.value}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#A99BC9', fontWeight: 600, letterSpacing: 1, mt: 0.5 }}>{stat.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            {/* Right: Logo with glow */}
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 1.2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {/* Glow behind logo */}
                  <Box sx={{ 
                    position: 'absolute', 
                    width: 350, height: 350, 
                    borderRadius: '50%', 
                    background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                    animation: 'pulseGlow 3s ease-in-out infinite',
                    '@keyframes pulseGlow': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
                      '50%': { transform: 'scale(1.15)', opacity: 1 },
                    }
                  }} />
                  <Box 
                    component="img" 
                    src={logo1} 
                    alt="Angel Gold Bird Brand" 
                    sx={{ 
                      width: { md: 280, lg: 320 }, 
                      height: 'auto', 
                      position: 'relative', 
                      zIndex: 2,
                      filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))',
                      borderRadius: '50%',
                    }} 
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ────────────────── TRUST STATS BAR ────────────────── */}
      <Box sx={{ py: 6, bgcolor: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            {[
              { icon: <Clock color="#D4AF37" size={32} />, title: '15+ Years', sub: 'Of Excellence & Trust' },
              { icon: <Star color="#D4AF37" size={32} />, title: 'Own Premium Brand', sub: 'Exclusive In-House Production' },
              { icon: <Building color="#D4AF37" size={32} />, title: '3 Manufacturing Factories', sub: 'Angel Fireworks — Factory Outlet' },
              { icon: <Truck color="#D4AF37" size={32} />, title: 'Pan-India Delivery', sub: 'Safe & Insured Shipping' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ bgcolor: 'rgba(212,175,55,0.08)', p: 2, borderRadius: '16px', display: 'inline-flex' }}>{stat.icon}</Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.15rem' }, color: '#F6F1FF' }}>{stat.title}</Typography>
                    <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{stat.sub}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ────────────────── WHY CHOOSE US ────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 3, mb: 2, textTransform: 'uppercase' }}>Why Choose Us</Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-1px' }}>Premium Quality. Best Prices.</Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {[
            { icon: <Percent size={36} />, title: 'Flat 80% Discount', desc: 'Unbelievable factory-direct pricing. Why pay retail when you can buy directly from the manufacturer at wholesale rates?' },
            { icon: <Shield size={36} />, title: 'Authentic Sivakasi Origin', desc: 'Every single product is sourced directly from our own factories in Sivakasi — the fireworks capital of India.' },
            { icon: <Sparkles size={36} />, title: 'Premium Curated Range', desc: 'From elegant sparklers to ground-shaking multi-shot aerials, every item is hand-selected for maximum brilliance.' },
          ].map((card, i) => (
            <Grid item xs={12} md={4} key={i}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} style={{ height: '100%' }}>
                <Card className="glass-card" sx={{ p: 5, height: '100%', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ bgcolor: 'rgba(212,175,55,0.08)', p: 2, borderRadius: '16px', display: 'inline-flex', alignSelf: 'flex-start', mb: 3, color: '#D4AF37' }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, color: '#F6F1FF', fontWeight: 800, fontSize: '1.4rem' }}>{card.title}</Typography>
                  <Typography sx={{ color: '#C4B5D4', fontSize: '1rem', lineHeight: 1.8 }}>{card.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ────────────────── CTA BANNER ────────────────── */}
      <Box sx={{ mx: { xs: 2, md: 8 }, mb: 16, borderRadius: '32px', overflow: 'hidden', position: 'relative', py: { xs: 8, md: 12 }, px: { xs: 4, md: 10 }, background: 'linear-gradient(135deg, #2A1150 0%, #1A0838 55%, #0F0424 100%)', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(circle at 80% 50%, rgba(212,175,55,0.22) 0%, transparent 60%)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '45%', height: '100%', background: 'radial-gradient(circle at 15% 80%, rgba(168,85,247,0.22) 0%, transparent 60%)' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-1px' }}>
              Ready to Make Your <br />
              <Box component="span" sx={{ color: '#D4AF37' }}>Celebration Unforgettable?</Box>
            </Typography>
            <Typography sx={{ color: '#B9A9D4', mb: 5, fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 600, mx: 'auto' }}>
              Browse our exclusive catalog, add your favorites, and submit your order inquiry. Our team will contact you to confirm and arrange everything.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button component={Link} to="/catalog" variant="contained" size="large" endIcon={<ArrowRight />}
                sx={{ bgcolor: '#D4AF37', color: '#000', px: 5, py: 2, borderRadius: '50px', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 8px 30px rgba(212,175,55,0.3)', '&:hover': { bgcolor: '#e8c84a' } }}
              >
                Shop Now — 80% Off
              </Button>
              <Button component="a" href="tel:+916374254296" variant="outlined" size="large" startIcon={<PhoneCall size={18} />}
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', px: 4, py: 2, borderRadius: '50px', fontWeight: 600, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}
              >
                Call Us
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;
