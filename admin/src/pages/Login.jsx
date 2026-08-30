import React, { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, InputAdornment, IconButton, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldCheck, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { saveAuth, isLoggedIn } from '../auth';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in? Skip straight to the dashboard.
  if (isLoggedIn()) {
    return null; // App's ProtectedRoute will handle; but avoid flashing the form
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      saveAuth(res.data);
      navigate('/', { replace: true });
    } catch (err) {
      let msg;
      if (err.response?.data?.error) {
        msg = err.response.data.error; // clean message from the backend (e.g. bad login, DB down)
      } else if (err.code === 'ECONNABORTED') {
        msg = 'Request timed out. Please check your connection and try again.';
      } else if (!err.response) {
        msg = 'Cannot reach the server. Make sure the backend is running.';
      } else {
        msg = 'Login failed. Please try again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          <Paper className="glass-panel" sx={{ p: { xs: 4, sm: 5 }, borderRadius: '28px' }}>
            {/* Brand / Icon */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2.5 }}>
                <Box sx={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)', filter: 'blur(12px)' }} />
                <Box sx={{ position: 'relative', bgcolor: 'rgba(212,175,55,0.12)', p: 2.2, borderRadius: '50%', display: 'inline-flex', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                  <ShieldCheck size={38} />
                </Box>
              </Box>
              <Typography sx={{ color: '#A99BC9', fontWeight: 800, fontSize: '0.72rem', letterSpacing: 3, textTransform: 'uppercase', mb: 0.5 }}>
                Angel Fireworks
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#D4AF37', letterSpacing: '-0.5px' }}>
                Admin Login
              </Typography>
              <Typography sx={{ color: '#A99BC9', fontSize: '0.9rem', mt: 1 }}>
                Authorized personnel only
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(239,68,68,0.1)', color: '#F6F1FF', border: '1px solid rgba(239,68,68,0.25)', '& .MuiAlert-icon': { color: '#ef4444' } }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Username" name="username" required autoFocus
                value={form.username} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#D4AF37" /></InputAdornment> }}
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' } }}
              />
              <TextField
                fullWidth label="Password" name="password" required
                type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock size={18} color="#D4AF37" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" sx={{ color: '#A99BC9' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' } }}
              />
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit" variant="contained" size="large" fullWidth disabled={loading}
                  startIcon={<LogIn size={20} />}
                  sx={{ py: 1.6, bgcolor: '#D4AF37', color: '#1A0B30', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', '&:hover': { bgcolor: '#E8C84A' }, '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </motion.div>
            </form>

            <Typography sx={{ color: '#8E7CAD', fontSize: '0.78rem', textAlign: 'center', mt: 3 }}>
              🔒 Protected by Angel authentication
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
