import React from 'react';
import { Box, Typography, Container, Grid, Card, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Truck, Percent, Users, PhoneCall, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react';
import addPoster from '../assets/add.jpeg';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] } })
};

const Wholesale = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>

      {/* ────────────────── HERO ────────────────── */}
      <Box sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 14 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <Chip label="WHOLESALE" sx={{ bgcolor: 'rgba(212,175,55,0.1)', color: '#D4AF37', fontWeight: 800, mb: 3, px: 1.5, py: 2.5, fontSize: '0.8rem', letterSpacing: 2, borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }} />
              </motion.div>
              <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
                <Typography variant="h2" sx={{ fontWeight: 900, color: '#F6F1FF', fontSize: { xs: '2.2rem', md: '3.2rem' }, letterSpacing: '-1px', mb: 3, lineHeight: 1.15 }}>
                  Bulk Orders at <br />
                  <Box component="span" sx={{ color: '#D4AF37' }}>Factory Prices</Box>
                </Typography>
              </motion.div>
              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
                <Typography sx={{ color: '#C4B5D4', fontSize: '1.1rem', lineHeight: 1.9, mb: 4 }}>
                  Are you a retailer, event organizer, or festival committee? Get <strong style={{ color: '#F6F1FF' }}>Angel's Gold Bird Brand</strong> fireworks at unbeatable wholesale rates — directly from our <strong style={{ color: '#F6F1FF' }}>3 manufacturing factories</strong> in Sivakasi. No middlemen. Maximum margins.
                </Typography>
              </motion.div>
              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    component="a" href="https://wa.me/916374254296?text=Hi%2C%20I%20am%20interested%20in%20wholesale%20orders%20from%20Angel%20Fireworks." target="_blank"
                    variant="contained" size="large" startIcon={<MessageCircle size={18} />}
                    sx={{ bgcolor: '#25D366', color: '#fff', px: 4, py: 1.8, borderRadius: '50px', fontWeight: 700, fontSize: '1rem', boxShadow: '0 8px 25px rgba(37,211,102,0.3)', '&:hover': { bgcolor: '#1fb855' }, transition: 'all 0.3s' }}
                  >
                    WhatsApp for Wholesale
                  </Button>
                  <Button 
                    component="a" href="tel:+916374254296"
                    variant="outlined" size="large" startIcon={<PhoneCall size={18} />}
                    sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', px: 4, py: 1.8, borderRadius: '50px', fontWeight: 600, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' }, transition: 'all 0.3s' }}
                  >
                    Call Now
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3 }}>
                <Box component="img" src={addPoster} alt="Angel Fireworks Wholesale" sx={{ width: '100%', borderRadius: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.12)' }} />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ────────────────── WHOLESALE BENEFITS ────────────────── */}
      <Box sx={{ py: 10, bgcolor: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 3, mb: 2, textTransform: 'uppercase' }}>Why Wholesale With Us</Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Unbeatable Advantages</Typography>
            </motion.div>
          </Box>

          <Grid container spacing={4}>
            {[
              { icon: <Percent size={36} />, title: 'Best Factory Prices', desc: 'Get the lowest prices in the market. Direct from our factories — no distributors, no extra margins. Up to 80% off MRP.' },
              { icon: <Package size={36} />, title: 'Bulk Order Support', desc: 'We handle orders of any size — from 100 boxes to 10,000+ boxes. Custom packaging and branding options available for large orders.' },
              { icon: <Truck size={36} />, title: 'Pan-India Shipping', desc: 'We arrange safe, insured transport for bulk orders across India. Timely delivery guaranteed for festival season rushes.' },
              { icon: <Users size={36} />, title: 'Dedicated Support', desc: 'Get a dedicated account manager for your wholesale orders. Personal attention from inquiry to delivery.' },
              { icon: <CheckCircle size={36} />, title: 'Quality Guaranteed', desc: 'Every batch is quality tested in our factories. Defective products are replaced immediately — no questions asked.' },
              { icon: <Package size={36} />, title: 'Wide Product Range', desc: 'Sparklers, flower pots, rockets, multi-shot aerials, ground chakkars, gift boxes — everything under one roof from our own brand.' },
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
      </Box>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 3, mb: 2, textTransform: 'uppercase' }}>Simple Process</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>How Wholesale Works</Typography>
          </motion.div>
        </Box>

        <Grid container spacing={6}>
          {[
            { step: '01', title: 'Contact Us', desc: 'Reach out via WhatsApp or phone call. Tell us your requirements — product types, quantities, and delivery location.' },
            { step: '02', title: 'Get Your Quote', desc: "We'll send you a customized wholesale price list based on your order volume. Bigger orders = bigger discounts." },
            { step: '03', title: 'Confirm & Pay', desc: 'Confirm your order and arrange payment (bank transfer / UPI / cash). We start preparing your shipment immediately.' },
            { step: '04', title: 'Receive & Sell', desc: 'Your order is safely packed and shipped. Receive at your location and start selling at retail prices for maximum profit!' },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, color: 'rgba(212,175,55,0.15)', lineHeight: 1, mb: 2 }}>{item.step}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#F6F1FF', mb: 1.5 }}>{item.title}</Typography>
                  <Typography sx={{ color: '#A99BC9', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.desc}</Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ────────────────── CTA ────────────────── */}
      <Box sx={{ mx: { xs: 2, md: 8 }, mb: 16, borderRadius: '32px', overflow: 'hidden', position: 'relative', py: { xs: 8, md: 10 }, px: { xs: 4, md: 10 }, background: 'linear-gradient(135deg, #2A1150 0%, #1A0838 55%, #0F0424 100%)', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(circle at 80% 50%, rgba(212,175,55,0.22) 0%, transparent 60%)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '45%', height: '100%', background: 'radial-gradient(circle at 15% 80%, rgba(168,85,247,0.22) 0%, transparent 60%)' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Start Your Wholesale <Box component="span" sx={{ color: '#D4AF37' }}>Partnership Today</Box>
            </Typography>
            <Typography sx={{ color: '#B9A9D4', mb: 5, fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 550, mx: 'auto' }}>
              Join hundreds of retailers across India who trust Angel Fireworks for their wholesale supply. Contact us now for the best rates.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button component="a" href="https://wa.me/916374254296?text=Hi%2C%20I%20want%20to%20place%20a%20wholesale%20order." target="_blank" variant="contained" size="large" startIcon={<MessageCircle size={18} />}
                sx={{ bgcolor: '#25D366', color: '#fff', px: 5, py: 2, borderRadius: '50px', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 8px 30px rgba(37,211,102,0.3)', '&:hover': { bgcolor: '#1fb855' } }}
              >
                WhatsApp Now
              </Button>
              <Button component="a" href="tel:+916374254296" variant="outlined" size="large" startIcon={<PhoneCall size={18} />}
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', px: 4, py: 2, borderRadius: '50px', fontWeight: 600, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}
              >
                +91 6374254296
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

    </Box>
  );
};

export default Wholesale;
