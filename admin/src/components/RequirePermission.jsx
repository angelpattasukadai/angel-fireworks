import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hasPermission, isSuperAdmin } from '../auth';

// Guards a route by permission. `perm` is a permission key, or 'super' for super-admin-only.
const RequirePermission = ({ perm, children }) => {
  const allowed = perm === 'super' ? isSuperAdmin() : hasPermission(perm);
  if (allowed) return children;

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
        <Box sx={{ color: '#ef4444', display: 'inline-flex', bgcolor: 'rgba(239,68,68,0.1)', p: 2.5, borderRadius: '50%', mb: 3 }}>
          <ShieldAlert size={40} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#F6F1FF', mb: 1 }}>Access Denied</Typography>
        <Typography sx={{ color: '#A99BC9', mb: 4 }}>
          You don't have permission to view this page. Contact the Super Admin if you need access.
        </Typography>
        <Button component={Link} to="/" variant="contained"
          sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 4, '&:hover': { bgcolor: '#E8C84A' } }}>
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default RequirePermission;
