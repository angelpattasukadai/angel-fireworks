import React, { useState } from 'react';
import { Container, Grid, Typography, TextField, Button, Box, Paper, Divider, Alert, Chip, IconButton, InputAdornment } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Trash2, Plus, Minus, CheckCircle, MessageCircle, User, Phone, MapPin, Hash, ShieldCheck, Truck, PhoneCall, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { apiUrl, imgUrl } from '../config';

// Business WhatsApp number that receives order inquiries
const WHATSAPP_NUMBER = '916374254296';

const Checkout = ({ cart, removeFromCart, updateCartQuantity, clearCart }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAltPhone: '',
    customerAddress: '',
    customerPincode: '',
    customerState: 'Tamil Nadu'
  });
  const [submitted, setSubmitted] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isTN = ['tamil nadu', 'tn'].includes(formData.customerState.trim().toLowerCase());
  const phoneValid = /^\d{10}$/.test(formData.customerPhone);
  const altPhoneValid = formData.customerAltPhone === '' || /^\d{10}$/.test(formData.customerAltPhone);
  const pincodeValid = /^\d{6}$/.test(formData.customerPincode);
  const phoneError = formData.customerPhone.length > 0 && !phoneValid;
  const altPhoneError = formData.customerAltPhone.length > 0 && !/^\d{10}$/.test(formData.customerAltPhone);
  const pincodeError = formData.customerPincode.length > 0 && !pincodeValid;

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.03)' },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customerPhone' || name === 'customerAltPhone') {
      // Allow only digits, capped at 10
      setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 10) });
      return;
    }
    if (name === 'customerPincode') {
      // Allow only digits, capped at 6
      setFormData({ ...formData, customerPincode: value.replace(/\D/g, '').slice(0, 6) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      '*🎆 New Order Inquiry — Angel Fireworks*',
      '',
      `*Name:* ${formData.customerName}`,
      `*Phone:* ${formData.customerPhone}`,
      ...(formData.customerAltPhone ? [`*Alt Phone:* ${formData.customerAltPhone}`] : []),
      `*Address:* ${formData.customerAddress}`,
      `*Pincode:* ${formData.customerPincode}`,
      `*State:* ${formData.customerState}`,
      '',
      '*Order Details:*',
      ...cart.map((item, i) => `${i + 1}. ${item.product.name} — ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}`),
      '',
      `*Estimated Total: ₹${total}*`,
    ];
    return lines.join('\n');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!phoneValid || !pincodeValid || !altPhoneValid) return; // phone (10), pincode (6), optional alt phone (10)

    // Open WhatsApp synchronously (avoids popup blockers) with the pre-filled order
    const message = buildWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    // Save the inquiry to the backend as well (best effort)
    const orderData = {
      ...formData,
      items: cart.map(c => ({ product: c.product._id, name: c.product.name, quantity: c.quantity, price: c.price })),
      totalAmount: total
    };
    axios.post(apiUrl('/api/orders'), orderData).catch(err => console.error('Error saving order', err));

    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
            <Box sx={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,211,102,0.35), transparent 70%)', filter: 'blur(14px)' }} />
            <Box sx={{ position: 'relative', bgcolor: 'rgba(37,211,102,0.12)', p: 3, borderRadius: '50%', display: 'inline-flex', border: '1px solid rgba(37,211,102,0.3)' }}>
              <CheckCircle size={60} color="#25D366" />
            </Box>
          </Box>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, color: '#D4AF37' }}>Order Sent! 🎆</Typography>
          <Typography sx={{ color: '#C4B5D4', mb: 2, fontSize: '1.1rem', lineHeight: 1.8 }}>
            Thanks, <strong style={{ color: '#F6F1FF' }}>{formData.customerName}</strong>! We've opened <strong style={{ color: '#25D366' }}>WhatsApp</strong> with your full order details.
          </Typography>
          <Typography sx={{ color: '#A99BC9', mb: 5, fontSize: '0.98rem', lineHeight: 1.8 }}>
            Just hit send on WhatsApp to confirm. Our team will reach you on <strong style={{ color: '#D4AF37' }}>{formData.customerPhone}</strong> to finalize the order and arrange offline payment & delivery.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" href="/" sx={{ px: 5, py: 1.5, borderRadius: '50px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, '&:hover': { bgcolor: '#E8C84A' } }}>Return to Home</Button>
            <Button variant="outlined" href="/catalog" sx={{ px: 5, py: 1.5, borderRadius: '50px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}>Order More</Button>
          </Box>
        </motion.div>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ textAlign: { xs: 'left', md: 'center' }, mb: { xs: 5, md: 8 }, maxWidth: 720, mx: 'auto' }}>
            <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 3, mb: 2, textTransform: 'uppercase' }}>Checkout</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#D4AF37', fontSize: { xs: '2.6rem', md: '3.6rem' }, letterSpacing: '-1.5px', mb: 2, lineHeight: 1.05 }}>
              Complete Your Order
            </Typography>
            <Typography sx={{ color: '#C4B5D4', fontSize: '1.12rem', lineHeight: 1.8 }}>
              Fill in your details and send your order straight to our team on WhatsApp. We'll confirm everything and arrange safe delivery to your doorstep.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={{ xs: 4, md: 5 }}>
          {/* Form */}
          <Grid item xs={12} md={7}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Paper className="glass-panel" sx={{ p: { xs: 3, md: 5 }, borderRadius: '28px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Box sx={{ bgcolor: 'rgba(212,175,55,0.1)', p: 1.2, borderRadius: '12px', display: 'inline-flex', color: '#D4AF37' }}><User size={22} /></Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#F6F1FF' }}>Contact Details</Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Full Name" name="customerName" required value={formData.customerName} onChange={handleChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#D4AF37" /></InputAdornment> }}
                        sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Mobile Number" name="customerPhone" required type="tel" inputMode="numeric"
                        value={formData.customerPhone} onChange={handleChange}
                        error={phoneError}
                        helperText={phoneError ? 'Enter a valid 10-digit mobile number' : "We'll call you on this number to confirm"}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#D4AF37" /></InputAdornment> }}
                        sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Secondary Number (optional)" name="customerAltPhone" type="tel" inputMode="numeric"
                        value={formData.customerAltPhone} onChange={handleChange}
                        error={altPhoneError}
                        helperText={altPhoneError ? 'Enter a valid 10-digit number' : 'Alternate contact number'}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#D4AF37" /></InputAdornment> }}
                        sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Delivery Address" name="customerAddress" required multiline rows={3} value={formData.customerAddress} onChange={handleChange}
                        sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Pincode" name="customerPincode" required type="tel" inputMode="numeric"
                        value={formData.customerPincode} onChange={handleChange}
                        error={pincodeError}
                        helperText={pincodeError ? 'Enter a valid 6-digit pincode' : 'Area postal PIN code'}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Hash size={18} color="#D4AF37" /></InputAdornment> }}
                        sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="State" name="customerState" required value={formData.customerState} onChange={handleChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} color="#D4AF37" /></InputAdornment> }}
                        sx={fieldSx} />
                    </Grid>
                  </Grid>

                  <AnimatePresence>
                    {isTN && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Alert icon={<Info size={20} />} severity="warning" sx={{ mt: 4, borderRadius: '14px', bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F6F1FF', border: '1px solid rgba(245,158,11,0.25)', '& .MuiAlert-icon': { color: '#f59e0b' } }}>
                          <strong>Tamil Nadu Customers:</strong> Due to state regulations, direct online sales of fireworks are restricted. Send your inquiry here, and our team will call to coordinate offline payment and delivery.
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button type="submit" variant="contained" size="large" fullWidth disabled={cart.length === 0 || !phoneValid || !pincodeValid || !altPhoneValid}
                      startIcon={<MessageCircle size={22} />}
                      sx={{ mt: 4, py: 2, bgcolor: '#25D366', color: '#fff', borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(37,211,102,0.35)', '&:hover': { bgcolor: '#1fb855', boxShadow: '0 12px 32px rgba(37,211,102,0.45)' }, '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}
                    >
                      {cart.length === 0 ? 'Add items from the catalog first' : 'Send Order via WhatsApp'}
                    </Button>
                  </motion.div>
                  <Typography sx={{ color: '#A99BC9', fontSize: '0.82rem', textAlign: 'center', mt: 2 }}>
                    🔒 No online payment needed. We confirm your order personally before delivery.
                  </Typography>
                </form>
              </Paper>
            </motion.div>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={5}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Paper className="glass-panel" sx={{ p: { xs: 3, md: 4 }, borderRadius: '28px', position: 'sticky', top: 100 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#F6F1FF' }}>Order Summary</Typography>
                  {cart.length > 0 && <Chip label={`${totalItems} item${totalItems > 1 ? 's' : ''}`} size="small" sx={{ bgcolor: 'rgba(212,175,55,0.12)', color: '#D4AF37', fontWeight: 700 }} />}
                </Box>

                {cart.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', width: 70, height: 70, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <ShoppingBag size={30} color="#8E7CAD" />
                    </Box>
                    <Typography sx={{ color: '#C4B5D4', mb: 1 }}>Your cart is empty.</Typography>
                    <Typography component="a" href="/catalog" sx={{ color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}>Browse Catalog →</Typography>
                  </Box>
                ) : (
                  <Box>
                    {cart.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2.5, pb: 2.5, borderBottom: index < cart.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                        {/* Thumbnail */}
                        <Box sx={{ width: 54, height: 54, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.product.image
                            ? <Box component="img" src={imgUrl(item.product.image)} alt={item.product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <ShoppingBag size={20} color="#8E7CAD" />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#F6F1FF', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</Typography>
                          <Typography sx={{ color: '#D4AF37', fontSize: '0.82rem', fontWeight: 600, mb: 1 }}>₹{item.price} each</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '10px' }}>
                              <IconButton size="small" onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)} sx={{ borderRadius: 0, px: 0.8, color: '#C4B5D4' }}><Minus size={13} /></IconButton>
                              <Typography sx={{ px: 1, fontWeight: 700, fontSize: '0.82rem', minWidth: 18, textAlign: 'center', color: '#F6F1FF' }}>{item.quantity}</Typography>
                              <IconButton size="small" onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)} sx={{ borderRadius: 0, px: 0.8, color: '#C4B5D4' }}><Plus size={13} /></IconButton>
                            </Box>
                            <IconButton size="small" onClick={() => removeFromCart(item.product._id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}><Trash2 size={15} /></IconButton>
                          </Box>
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: '#F6F1FF', fontSize: '0.95rem', flexShrink: 0 }}>₹{item.price * item.quantity}</Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ color: '#C4B5D4' }}>Subtotal ({totalItems} items)</Typography>
                      <Typography sx={{ color: '#F6F1FF', fontWeight: 600 }}>₹{total}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#F6F1FF' }}>Estimated Total</Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#D4AF37' }}>₹{total}</Typography>
                    </Box>
                    <Typography sx={{ color: '#8E7CAD', fontSize: '0.78rem', mt: 1, textAlign: 'right' }}>Final price subject to confirmation</Typography>

                    {/* Trust badges */}
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[
                        { icon: <PhoneCall size={16} />, text: 'Personal call confirmation' },
                        { icon: <ShieldCheck size={16} />, text: 'Factory-direct genuine pricing' },
                        { icon: <Truck size={16} />, text: 'Safe & insured delivery' },
                      ].map((b, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ color: '#D4AF37', display: 'inline-flex' }}>{b.icon}</Box>
                          <Typography sx={{ color: '#C4B5D4', fontSize: '0.85rem' }}>{b.text}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;
