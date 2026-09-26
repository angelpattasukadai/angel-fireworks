import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem } from '@mui/material';
import { Phone, MessageCircle, Package, ShoppingCart, TrendingUp, ArrowRight, Eye, FileText, ReceiptText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { hasPermission } from '../auth';

const ORDER_STATUSES = ['Pending', 'Contacted', 'Completed', 'Cancelled'];
const statusColor = (s) => (s === 'Completed' ? '#10b981' : s === 'Contacted' ? '#3b82f6' : s === 'Cancelled' ? '#ef4444' : '#f59e0b');

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewOrder, setViewOrder] = useState(null); // order whose items are shown in the dialog
  const navigate = useNavigate();
  const canOrders = hasPermission('orders');
  const canProducts = hasPermission('products');
  const canBilling = hasPermission('billing');

  // Send this order to the billing page pre-filled, as a bill or an estimate.
  const billFromOrder = (order, mode) => navigate('/billing', { state: { fromOrder: order, mode } });

  const [products, setProducts] = useState([]);
  const fetchData = () => {
    if (canOrders) api.get('/orders').then(res => setOrders(res.data)).catch(() => {});
    api.get('/products').then(res => { setProductCount(res.data.length); setProducts(res.data); }).catch(() => {}); // GET products is public
  };

  useEffect(() => { fetchData(); }, []);

  // Look up the catalog MRP (normal rate) for an order line by product id.
  const productMap = new Map(products.map(p => [String(p._id), p]));
  const normalRateOf = (it) => { const p = productMap.get(String(it.product)); return p ? p.price : it.price; };

  const openWhatsApp = (phone, name) => {
    const text = `Hello ${name}, we received your fireworks inquiry from Angel Fireworks. Let's finalize your order!`;
    window.open(`https://wa.me/91${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleUpdateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchData();
  };

  const totalRevenue = orders.reduce((a, o) => a + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const statusCount = (s) => orders.filter(o => o.status === s).length;
  const filteredOrders = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 6 }}>
        <Box>
          <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Dashboard</Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Overview</Typography>
        </Box>
        {canProducts && (
          <Button component={Link} to="/catalog" variant="contained" endIcon={<ArrowRight size={16} />}
            sx={{ borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 3, '&:hover': { bgcolor: '#E8C84A' } }}>
            Manage Catalog
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          ...(canOrders ? [
            { icon: <ShoppingCart size={24} />, label: 'Total Orders', value: orders.length, color: '#D4AF37' },
            { icon: <Package size={24} />, label: 'Pending', value: pendingOrders, color: '#f59e0b' },
            { icon: <TrendingUp size={24} />, label: 'Revenue (Est.)', value: `₹${totalRevenue.toLocaleString()}`, color: '#10b981' },
          ] : []),
          { icon: <Package size={24} />, label: 'Products Live', value: productCount, color: '#A855F7' },
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 } }}>
                <Box sx={{ bgcolor: `${stat.color}15`, p: 2, borderRadius: '14px', color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                <Box>
                  <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem', fontWeight: 600 }}>{stat.label}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#F6F1FF' }}>{stat.value}</Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Orders Table (only for admins with the 'orders' permission) */}
      {!canOrders ? (
        <Paper className="glass-panel" sx={{ borderRadius: '24px', p: 6, textAlign: 'center' }}>
          <Typography sx={{ color: '#C4B5D4' }}>Welcome! Use the sidebar to manage the areas you have access to.</Typography>
        </Paper>
      ) : (
      <Paper className="glass-panel" sx={{ borderRadius: '24px', overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#F6F1FF' }}>Order Inquiries</Typography>
          <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>Tap a status chip in the table to cycle it. Use filters below to narrow the list.</Typography>
          {/* Status filter */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {['All', ...ORDER_STATUSES].map(s => {
              const count = s === 'All' ? orders.length : statusCount(s);
              const active = statusFilter === s;
              const color = s === 'Completed' ? '#10b981' : s === 'Contacted' ? '#3b82f6' : s === 'Cancelled' ? '#ef4444' : s === 'Pending' ? '#f59e0b' : '#D4AF37';
              return (
                <Chip key={s} label={`${s} (${count})`} onClick={() => setStatusFilter(s)}
                  sx={{ fontWeight: 700, borderRadius: '10px', fontSize: '0.78rem',
                    bgcolor: active ? color : 'rgba(255,255,255,0.08)',
                    color: active ? (s === 'All' ? '#1A0B30' : '#fff') : '#C4B5D4',
                    '&:hover': { bgcolor: active ? color : 'rgba(255,255,255,0.14)' } }} />
              );
            })}
          </Box>
        </Box>
        <Box sx={{ p: { xs: 1, md: 3 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 800, color: '#A99BC9', fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '2px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Contact</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: '#8E7CAD' }}>{orders.length === 0 ? 'No orders yet.' : `No ${statusFilter.toLowerCase()} orders.`}</TableCell></TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id} hover sx={{ '&:hover': { bgcolor: 'rgba(212,175,55,0.03)' } }}>
                      <TableCell sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#F6F1FF', fontSize: '0.95rem' }}>{order.customerName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Eye size={14} />} onClick={() => setViewOrder(order)}
                          sx={{ borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, color: '#D4AF37', textTransform: 'none', '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' } }}>
                          {order.items?.length || 0} items
                        </Button>
                      </TableCell>
                      <TableCell>
                        {order.customerState?.toLowerCase() === 'tamil nadu' ? (
                          <Chip label="TN" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem' }} />
                        ) : (
                          <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{order.customerState}</Typography>
                        )}
                      </TableCell>
                      <TableCell><Typography sx={{ fontWeight: 800, color: '#F6F1FF' }}>₹{order.totalAmount}</Typography></TableCell>
                      <TableCell>
                        <Select value={order.status} size="small" onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          sx={{ fontWeight: 700, fontSize: '0.78rem', borderRadius: '10px', color: statusColor(order.status), bgcolor: `${statusColor(order.status)}1A`,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSelect-select': { py: 0.6, pl: 1.5 }, '& .MuiSelect-icon': { color: statusColor(order.status) } }}>
                          {ORDER_STATUSES.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{s}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 800, color: '#D4AF37', fontSize: '0.95rem', mb: order.customerAltPhone ? 0.2 : 1 }}>{order.customerPhone}</Typography>
                        {order.customerAltPhone && <Typography sx={{ color: '#A99BC9', fontSize: '0.8rem', mb: 1 }}>Alt: {order.customerAltPhone}</Typography>}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined" startIcon={<Phone size={12} />} onClick={() => window.open(`tel:${order.customerPhone}`)}
                            sx={{ borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', minWidth: 0, px: 1.5 }}>
                            Call
                          </Button>
                          <Button size="small" variant="contained" startIcon={<MessageCircle size={12} />} onClick={() => openWhatsApp(order.customerPhone, order.customerName)}
                            sx={{ borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, bgcolor: '#25D366', minWidth: 0, px: 1.5, '&:hover': { bgcolor: '#1fb855' } }}>
                            WA
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      )}

      {/* Order details dialog — see what the customer ordered, then bill / estimate it */}
      <Dialog open={!!viewOrder} onClose={() => setViewOrder(null)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#211042', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#F6F1FF' }}>Order Details</DialogTitle>
        <DialogContent>
          {viewOrder && <>
            <Box sx={{ mb: 2, p: 2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ fontWeight: 800, color: '#F6F1FF' }}>{viewOrder.customerName}</Typography>
              <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>Ph: {viewOrder.customerPhone}</Typography>
              {viewOrder.customerAltPhone && <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>Secondary: {viewOrder.customerAltPhone}</Typography>}
              <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{viewOrder.customerAddress}{viewOrder.customerPincode ? ` - ${viewOrder.customerPincode}` : ''}</Typography>
              <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{viewOrder.customerState}</Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 460 }}>
              <TableHead><TableRow sx={{ '& th': { color: '#A99BC9', fontWeight: 700, fontSize: '0.72rem', borderColor: 'rgba(255,255,255,0.1)' } }}>
                <TableCell>#</TableCell><TableCell>Item</TableCell><TableCell align="right">Normal</TableCell><TableCell align="right">Discount</TableCell><TableCell align="center">Qty</TableCell><TableCell align="right">Total</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {(viewOrder.items || []).map((it, n) => (
                  <TableRow key={n} sx={{ '& td': { color: '#F6F1FF', borderColor: 'rgba(255,255,255,0.06)' } }}>
                    <TableCell sx={{ color: '#A99BC9' }}>{n + 1}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell align="right" sx={{ color: '#A99BC9', textDecoration: normalRateOf(it) > it.price ? 'line-through' : 'none' }}>₹{normalRateOf(it)}</TableCell>
                    <TableCell align="right">₹{it.price}</TableCell>
                    <TableCell align="center">{it.quantity}</TableCell>
                    <TableCell align="right">₹{(it.price || 0) * (it.quantity || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </Box>
            {(() => {
              const nt = (viewOrder.items || []).reduce((s, it) => s + normalRateOf(it) * (it.quantity || 0), 0);
              return <Box sx={{ mt: 2, px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                  <Typography sx={{ color: '#A99BC9' }}>Normal Total</Typography>
                  <Typography sx={{ color: '#A99BC9', textDecoration: nt > viewOrder.totalAmount ? 'line-through' : 'none' }}>₹{nt}</Typography>
                </Box>
                {nt > viewOrder.totalAmount && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                  <Typography sx={{ color: '#10b981' }}>You Save</Typography>
                  <Typography sx={{ color: '#10b981', fontWeight: 700 }}>₹{nt - viewOrder.totalAmount}</Typography>
                </Box>}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 800, color: '#F6F1FF' }}>Discount Total</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#D4AF37' }}>₹{viewOrder.totalAmount}</Typography>
                </Box>
              </Box>;
            })()}
            <Typography sx={{ color: '#8E7CAD', fontSize: '0.78rem', mt: 1.5 }}>Estimate/Bill uses your catalog's current price &amp; 80% offer — the amount above is what the customer saw on the website.</Typography>
          </>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setViewOrder(null)} sx={{ borderRadius: '12px', color: '#C4B5D4', fontWeight: 700 }}>Close</Button>
          <Box sx={{ flexGrow: 1 }} />
          {canBilling && <>
            <Button onClick={() => billFromOrder(viewOrder, 'estimate')} variant="outlined" startIcon={<FileText size={16} />}
              sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: '#C4B5D4', fontWeight: 700, '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}>Create Estimate</Button>
            <Button onClick={() => billFromOrder(viewOrder, 'bill')} variant="contained" startIcon={<ReceiptText size={16} />}
              sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, '&:hover': { bgcolor: '#E8C84A' } }}>Create Bill</Button>
          </>}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
