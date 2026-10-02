import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, Button, Chip, Dialog, DialogTitle, DialogContent, IconButton, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gift, Check, X, Sparkles, PackageCheck, ListChecks } from 'lucide-react';
import { combos, comboToProduct } from '../data/combos';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.55, ease: [0.4, 0, 0.2, 1] } }),
};

const ComboOffers = ({ addToCart, cart = [] }) => {
  const navigate = useNavigate();
  const [viewing, setViewing] = useState(null); // combo being previewed in dialog

  const inCart = (id) => cart.some((c) => c.product?._id === id);

  const handleEnquire = (combo) => {
    if (addToCart && !inCart(combo.id)) addToCart(comboToProduct(combo), 1);
    navigate('/checkout');
  };

  return (
    <Box sx={{ py: { xs: 9, md: 14 }, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 9 } }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <Chip
              icon={<Gift size={16} color="#1A0B30" />}
              label="VALUE COMBO PACKS"
              sx={{ bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 900, mb: 3, px: 1.2, py: 2.2, fontSize: { xs: '0.7rem', sm: '0.8rem' }, letterSpacing: 1.2, borderRadius: '8px' }}
            />
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#F6F1FF', fontSize: { xs: '1.9rem', md: '3rem' }, letterSpacing: '-1px', mb: 1.5 }}>
              Ready-Made <Box component="span" sx={{ color: '#D4AF37' }}>Gift Packs</Box>
            </Typography>
            <Typography sx={{ color: '#C4B5D4', fontSize: { xs: '0.95rem', md: '1.1rem' }, maxWidth: 620, mx: 'auto', lineHeight: 1.8 }}>
              One pack, everything sorted. Hand-picked assortments at a single fixed price — perfect for family Diwali celebrations.
            </Typography>
          </motion.div>
        </Box>

        {/* Combo cards */}
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          {combos.map((combo, i) => {
            const featured = combo.id === 'combo-4999';
            const totalPcs = combo.items.reduce((a, it) => a + it.qty, 0);
            const added = inCart(combo.id);
            return (
              <Grid item xs={12} md={4} key={combo.id} sx={{ display: 'flex' }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} style={{ width: '100%', display: 'flex' }}>
                  <Card
                    sx={{
                      position: 'relative',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: { xs: 3, md: 3.5 },
                      borderRadius: '24px',
                      background: featured
                        ? 'linear-gradient(160deg, rgba(168,85,247,0.18) 0%, rgba(42,17,80,0.6) 100%)'
                        : 'linear-gradient(160deg, rgba(212,175,55,0.1) 0%, rgba(26,11,48,0.6) 100%)',
                      border: featured ? '1.5px solid rgba(168,85,247,0.5)' : '1.5px solid rgba(212,175,55,0.3)',
                      boxShadow: featured ? '0 18px 50px rgba(168,85,247,0.25)' : '0 12px 40px rgba(0,0,0,0.35)',
                      transform: { md: featured ? 'scale(1.04)' : 'none' },
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': { transform: { md: featured ? 'scale(1.06)' : 'translateY(-6px)' }, boxShadow: '0 22px 55px rgba(212,175,55,0.3)' },
                    }}
                  >
                    {/* Badge */}
                    <Chip
                      label={combo.badge}
                      size="small"
                      sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 900, fontSize: '0.6rem', letterSpacing: 0.8, bgcolor: combo.accent, color: '#1A0B30', height: 22 }}
                    />

                    <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start', p: 1.3, borderRadius: '14px', bgcolor: 'rgba(212,175,55,0.12)', color: combo.accent, mb: 2 }}>
                      <PackageCheck size={26} />
                    </Box>

                    <Typography sx={{ color: '#C4B5D4', fontWeight: 700, fontSize: '0.8rem', letterSpacing: 0.5, textTransform: 'uppercase', mb: 0.5 }}>
                      {combo.tagline}
                    </Typography>

                    {/* Price */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                      <Typography sx={{ color: '#F6F1FF', fontWeight: 900, fontSize: { xs: '2.4rem', md: '2.7rem' }, lineHeight: 1 }}>
                        ₹{combo.price.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#A99BC9', fontSize: '0.82rem', mb: 2.5 }}>all-inclusive fixed price</Typography>

                    {/* Count highlights */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                      <Chip icon={<ListChecks size={14} />} label={`${combo.items.length} varieties`} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#F6F1FF', fontWeight: 700, fontSize: '0.72rem', '& .MuiChip-icon': { color: combo.accent } }} />
                      <Chip icon={<Sparkles size={14} />} label={`${totalPcs} items`} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#F6F1FF', fontWeight: 700, fontSize: '0.72rem', '& .MuiChip-icon': { color: combo.accent } }} />
                    </Box>

                    {/* Preview of first few items */}
                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                      {combo.items.slice(0, 5).map((it, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                          <Check size={15} color={combo.accent} style={{ flexShrink: 0 }} />
                          <Typography sx={{ color: '#D7CCE8', fontSize: '0.85rem' }}>
                            {it.name}{it.qty > 1 ? ` ×${it.qty}` : ''}
                          </Typography>
                        </Box>
                      ))}
                      <Button onClick={() => setViewing(combo)} sx={{ mt: 0.5, p: 0, color: combo.accent, fontWeight: 700, fontSize: '0.82rem', textTransform: 'none', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                        + {combo.items.length - 5} more — view full list
                      </Button>
                    </Box>

                    {/* CTA */}
                    <Button
                      onClick={() => handleEnquire(combo)}
                      variant="contained"
                      fullWidth
                      startIcon={added ? <Check size={18} /> : <Gift size={18} />}
                      sx={{
                        py: 1.4, borderRadius: '50px', fontWeight: 800, fontSize: '0.95rem',
                        bgcolor: added ? '#2E7D32' : combo.accent,
                        color: added ? '#fff' : '#1A0B30',
                        boxShadow: `0 8px 22px ${combo.accent}55`,
                        '&:hover': { bgcolor: added ? '#2E7D32' : '#E8C84A' },
                      }}
                    >
                      {added ? 'Added — Go to Enquiry' : 'Enquire This Pack'}
                    </Button>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        <Typography sx={{ textAlign: 'center', color: '#8E7FB0', fontSize: '0.8rem', mt: 4 }}>
          Combo contents are fixed. Prices are all-inclusive. Availability confirmed on enquiry.
        </Typography>
      </Container>

      {/* Full item list dialog */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'rgba(22,6,46,0.98)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', color: '#F6F1FF' } }}>
        {viewing && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#D4AF37' }}>{viewing.name}</Typography>
                <Typography sx={{ color: '#A99BC9', fontSize: '0.82rem' }}>
                  {viewing.items.length} varieties • {viewing.items.reduce((a, it) => a + it.qty, 0)} items • all-inclusive
                </Typography>
              </Box>
              <IconButton onClick={() => setViewing(null)} sx={{ color: '#C4B5D4' }}><X size={22} /></IconButton>
            </DialogTitle>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={0.5}>
                {viewing.items.map((it, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.6 }}>
                      <Box sx={{ width: 20, color: '#8E7FB0', fontSize: '0.72rem', flexShrink: 0, textAlign: 'right' }}>{idx + 1}.</Box>
                      <Check size={14} color="#D4AF37" style={{ flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.86rem', color: '#D7CCE8' }}>
                        {it.name}
                        {it.qty > 1 && <Box component="span" sx={{ color: '#D4AF37', fontWeight: 800 }}> ×{it.qty}</Box>}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button
                onClick={() => { handleEnquire(viewing); setViewing(null); }}
                variant="contained" fullWidth startIcon={<Gift size={18} />}
                sx={{ mt: 3, py: 1.4, borderRadius: '50px', fontWeight: 800, bgcolor: '#D4AF37', color: '#1A0B30', '&:hover': { bgcolor: '#E8C84A' } }}
              >
                Enquire This Pack — ₹{viewing.price.toLocaleString('en-IN')}
              </Button>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ComboOffers;
