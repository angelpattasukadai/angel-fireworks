import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Grid } from '@mui/material';
import { Phone, MessageCircle, Package, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';
import { hasPermission } from '../auth';

const ORDER_STATUSES = ['Pending', 'Contacted', 'Completed', 'Cancelled'];

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const canOrders = hasPermission('orders');
  const canProducts = hasPermission('products');

  const fetchData = () => {
    if (canOrders) api.get('/orders').then(res => setOrders(res.data)).catch(() => {});
    api.get('/products').then(res => setProductCount(res.data.length)).catch(() => {}); // GET products is public
  };

  useEffect(() => { fetchData(); }, []);

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
                        <Typography sx={{ color: '#A99BC9', fontSize: '0.85rem' }}>{order.items?.length || 0} items</Typography>
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
                        <Chip label={order.status} size="small" onClick={() => {
                          const statuses = ['Pending', 'Contacted', 'Completed', 'Cancelled'];
                          const next = statuses[(statuses.indexOf(order.status) + 1) % statuses.length];
                          handleUpdateStatus(order._id, next);
                        }}
                        sx={{
                          fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                          bgcolor: order.status === 'Completed' ? 'rgba(16,185,129,0.1)' : order.status === 'Contacted' ? 'rgba(59,130,246,0.1)' : order.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: order.status === 'Completed' ? '#10b981' : order.status === 'Contacted' ? '#3b82f6' : order.status === 'Cancelled' ? '#ef4444' : '#f59e0b'
                        }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 800, color: '#D4AF37', fontSize: '0.95rem', mb: 1 }}>{order.customerPhone}</Typography>
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
    </Container>
  );
};

export default Dashboard;
