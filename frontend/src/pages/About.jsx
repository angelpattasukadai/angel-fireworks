import React from 'react';
import { Box, Typography, Container, Grid, Card, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Clock, Award, Building, Users, MapPin, Shield, Sparkles, Heart } from 'lucide-react';
import logo1 from '../assets/logo1.png';
import addPoster from '../assets/add.jpeg';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] } })
};

const About = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>

      {/* ────────────────── HERO BANNER ────────────────── */}
      <Box sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 14 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <Chip label="ABOUT US" sx={{ bgcolor: 'rgba(212,175,55,0.1)', color: '#D4AF37', fontWeight: 800, mb: 3, px: 1.5, py: 2.5, fontSize: '0.8rem', letterSpacing: 2, borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }} />
              </motion.div>
              <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
                <Typography variant="h2" sx={{ fontWeight: 900, color: '#F6F1FF', fontSize: { xs: '2.2rem', md: '3.2rem' }, letterSpacing: '-1px', mb: 3, lineHeight: 1.15 }}>
                  A Legacy of <br />
                  <Box component="span" sx={{ color: '#D4AF37' }}>Brilliance & Trust</Box>
                </Typography>
              </motion.div>
              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
                <Typography sx={{ color: '#C4B5D4', fontSize: '1.1rem', lineHeight: 1.9, mb: 4 }}>
                  Angel Fireworks is a premium fireworks brand rooted in the heart of <strong style={{ color: '#F6F1FF' }}>Sivakasi, Tamil Nadu</strong> — India's fireworks capital. With over <strong style={{ color: '#F6F1FF' }}>15 years</strong> of experience, we manufacture and sell our own exclusive brand of crackers and fireworks. What started as a small family operation has grown into a trusted name with <strong style={{ color: '#F6F1FF' }}>3 manufacturing factories</strong> and a passionate commitment to quality.
                </Typography>
              </motion.div>
              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
                <Typography sx={{ color: '#C4B5D4', fontSize: '1.05rem', lineHeight: 1.9 }}>
                  We believe every celebration deserves the best. That's why every single product we sell is manufactured in-house, rigorously tested for safety, and offered at factory-direct prices — giving you up to <strong style={{ color: '#D4AF37' }}>80% off</strong> compared to retail stores.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3 }}>
                <Box 
                  component="img"
                  src={addPoster}
                  alt="Angel Fireworks Industries"
                  sx={{ width: '100%', borderRadius: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.12)' }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ────────────────── MILESTONES / STATS ────────────────── */}
      <Box sx={{ py: 10, bgcolor: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} textAlign="center">
            {[
              { icon: <Clock size={32} />, value: '15+', label: 'Years of Experience' },
              { icon: <Building size={32} />, value: '3', label: 'Manufacturing Factories' },
              { icon: <Users size={32} />, value: '10,000+', label: 'Happy Customers' },
              { icon: <Award size={32} />, value: '100%', label: 'Own Brand Products' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ bgcolor: 'rgba(212,175,55,0.08)', p: 2, borderRadius: '16px', display: 'inline-flex', color: '#D4AF37' }}>{stat.icon}</Box>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#F6F1FF' }}>{stat.value}</Typography>
                    <Typography sx={{ color: '#A99BC9', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ────────────────── OUR STORY ────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 3, mb: 2, textTransform: 'uppercase' }}>Our Journey</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px', mb: 3 }}>From Sivakasi to Your Doorstep</Typography>
            <Typography sx={{ color: '#A99BC9', fontSize: '1.05rem', maxWidth: 650, mx: 'auto', lineHeight: 1.8 }}>
              Every product is manufactured in our own facilities, ensuring complete control over quality, safety, and pricing.
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {[
            { icon: <Sparkles size={36} />, title: 'Own Manufacturing', desc: 'We own and operate 3 factories in Sivakasi. Every product is made in-house with premium raw materials and strict quality control.' },
            { icon: <Shield size={36} />, title: 'Safety Tested', desc: 'All our fireworks undergo rigorous safety testing. We comply with all government safety standards and regulations for pyrotechnics.' },
            { icon: <Heart size={36} />, title: 'Family Values', desc: 'Started as a family business over 15 years ago, we carry forward the traditions of Sivakasi craftsmanship with modern quality standards.' },
            { icon: <MapPin size={36} />, title: 'Factory Outlet Pricing', desc: 'Angel Fireworks is our direct factory outlet. No middlemen, no inflated prices. You get genuine factory-direct rates with up to 80% off.' },
            { icon: <Users size={36} />, title: 'Customer First', desc: 'Over 10,000+ happy customers trust us every festival season. Our team personally handles every inquiry to ensure satisfaction.' },
            { icon: <Award size={36} />, title: 'Premium Range', desc: 'From kids-safe sparklers to grand wedding multi-shot aerials, our curated catalog covers every celebration need with premium quality.' },
          ].map((card, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} style={{ height: '100%' }}>
                <Card className="glass-card" sx={{ p: 5, height: '100%', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ bgcolor: 'rgba(212,175,55,0.08)', p: 2, borderRadius: '16px', display: 'inline-flex', alignSelf: 'flex-start', mb: 3, color: '#D4AF37' }}>
                    {card.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#F6F1FF', mb: 2 }}>{card.title}</Typography>
                  <Typography sx={{ color: '#C4B5D4', fontSize: '0.95rem', lineHeight: 1.8 }}>{card.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ────────────────── LOCATION CTA ────────────────── */}
      <Box sx={{ mx: { xs: 2, md: 8 }, mb: 16, borderRadius: '32px', overflow: 'hidden', position: 'relative', py: { xs: 8, md: 10 }, px: { xs: 4, md: 10 }, background: 'linear-gradient(135deg, #2A1150 0%, #1A0838 55%, #0F0424 100%)', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(circle at 80% 50%, rgba(212,175,55,0.22) 0%, transparent 60%)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '45%', height: '100%', background: 'radial-gradient(circle at 15% 80%, rgba(168,85,247,0.22) 0%, transparent 60%)' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <MapPin size={48} color="#D4AF37" style={{ marginBottom: 24 }} />
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Visit Our Factory Outlet
            </Typography>
            <Typography sx={{ color: '#B9A9D4', mb: 5, fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 550, mx: 'auto' }}>
              Come visit us at Sivakasi, Tamil Nadu. See our manufacturing process firsthand and choose your fireworks directly from the factory floor.
            </Typography>
            <Box 
              component="a" href="https://share.google/JoLvNHNDKfrShJjZM" target="_blank"
              sx={{ display: 'inline-block', bgcolor: '#D4AF37', color: '#000', px: 5, py: 2, borderRadius: '50px', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 30px rgba(212,175,55,0.3)', '&:hover': { bgcolor: '#e8c84a' }, transition: 'all 0.3s' }}
            >
              Open in Google Maps
            </Box>
          </motion.div>
        </Container>
      </Box>

    </Box>
  );
};

export default About;
