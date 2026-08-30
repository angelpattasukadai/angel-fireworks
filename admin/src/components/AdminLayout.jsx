import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Button,
  AppBar, Toolbar, IconButton, Divider, Tooltip, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { ShieldCheck, LogOut, LayoutDashboard, Package, Images, Users, Menu as MenuIcon, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { clearAuth, getUsername, getRole, getPermissions, updateAuth } from '../auth';
import api from '../api';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 76;
const STORAGE_KEY = 'angel_admin_sidebar_collapsed';

// `perm`: permission key, 'super' for super-admin-only, or true for always-visible
const ALL_LINKS = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true, perm: true },
  { to: '/catalog', label: 'Catalog', icon: <Package size={20} />, perm: 'products' },
  { to: '/gallery', label: 'Gallery', icon: <Images size={20} />, perm: 'gallery' },
  { to: '/users', label: 'Users', icon: <Users size={20} />, perm: 'super' },
];

const paperBase = {
  boxSizing: 'border-box',
  bgcolor: 'rgba(22, 6, 46, 0.85)',
  backdropFilter: 'blur(16px)',
  borderRight: '1px solid rgba(255,255,255,0.08)',
  color: '#F6F1FF',
  boxShadow: '4px 0 30px rgba(0,0,0,0.3)',
  backgroundImage: 'none',
  overflowX: 'hidden',
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  // Role/permissions drive which nav items show. Seed from storage, then refresh from the server
  // so changes made by the Super Admin take effect on next load (deactivated users get logged out).
  const [role, setRole] = useState(getRole());
  const [perms, setPerms] = useState(getPermissions());

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        updateAuth({ role: res.data.role, permissions: res.data.permissions });
        setRole(res.data.role);
        setPerms(res.data.permissions || []);
      })
      .catch(() => { /* 401 is handled by the api interceptor (redirects to login) */ });
  }, []);

  const can = (perm) => perm === true || (perm === 'super' ? role === 'superadmin' : role === 'superadmin' || perms.includes(perm));
  const navLinks = ALL_LINKS.filter((l) => can(l.perm));

  // Remember the collapsed state across sessions
  useEffect(() => { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); }, [collapsed]);

  const desktopWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const widthTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  // mini = icon-only rail (desktop collapsed); showToggle = show the collapse chevron (desktop only)
  const renderDrawer = (mini, showToggle) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: mini ? 0 : 3, py: 3, justifyContent: mini ? 'center' : 'flex-start', minHeight: 84 }}>
        <Box sx={{ color: '#D4AF37', display: 'inline-flex' }}><ShieldCheck size={28} /></Box>
        {!mini && (
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#F6F1FF', lineHeight: 1, whiteSpace: 'nowrap' }}>Angel Fireworks</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 600, whiteSpace: 'nowrap' }}>Admin Panel</Typography>
          </Box>
        )}
      </Box>

      {/* Collapse / expand toggle (desktop only) */}
      {showToggle && (
        <Box sx={{ display: 'flex', justifyContent: mini ? 'center' : 'flex-end', px: mini ? 0 : 2, mb: 1 }}>
          <Tooltip title={mini ? 'Expand' : 'Collapse'} placement="right">
            <IconButton onClick={() => setCollapsed((c) => !c)} size="small"
              sx={{ color: '#C4B5D4', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#D4AF37' } }}>
              {mini ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Nav */}
      <List sx={{ px: mini ? 1 : 2, pt: 2, flexGrow: 1 }}>
        {navLinks.map((l) => (
          <Tooltip key={l.to} title={mini ? l.label : ''} placement="right">
            <ListItemButton
              component={NavLink}
              to={l.to}
              end={l.end}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: '14px', mb: 1, minHeight: 48,
                justifyContent: mini ? 'center' : 'flex-start',
                px: mini ? 0 : 2, color: '#C4B5D4',
                '& .MuiListItemIcon-root': { color: '#C4B5D4', minWidth: 0, mr: mini ? 0 : 2, justifyContent: 'center' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                '&.active': {
                  bgcolor: '#D4AF37', color: '#1A0B30',
                  boxShadow: '0 4px 14px rgba(212,175,55,0.4)',
                  '& .MuiListItemIcon-root': { color: '#1A0B30' },
                },
                '&.active:hover': { bgcolor: '#E8C84A' },
                transition: 'background-color 0.2s ease',
              }}
            >
              <ListItemIcon>{l.icon}</ListItemIcon>
              {!mini && <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      {/* User + logout */}
      <Box sx={{ p: mini ? 1.5 : 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!mini && (
          <Typography sx={{ color: '#A99BC9', fontSize: '0.75rem', px: 1, mb: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Signed in as <strong style={{ color: '#F6F1FF' }}>{getUsername() || 'Admin'}</strong>
          </Typography>
        )}
        <Tooltip title={mini ? 'Logout' : ''} placement="right">
          <Button fullWidth onClick={handleLogout}
            sx={{ borderRadius: '12px', bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 700, minWidth: 0, justifyContent: mini ? 'center' : 'flex-start', px: mini ? 0 : 2, '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}>
            <LogOut size={18} />
            {!mini && <Box component="span" sx={{ ml: 1.5 }}>Logout</Box>}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile top bar with hamburger */}
      {isMobile && (
        <AppBar position="fixed" elevation={0}>
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#F6F1FF' }}><MenuIcon size={22} /></IconButton>
            <Box sx={{ color: '#D4AF37', display: 'inline-flex' }}><ShieldCheck size={22} /></Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#F6F1FF' }}>Angel Fireworks</Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: desktopWidth }, flexShrink: { md: 0 }, transition: widthTransition }}>
        {/* Temporary (mobile) — always full width, never mini */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { ...paperBase, width: DRAWER_WIDTH } }}
        >
          {renderDrawer(false, false)}
        </Drawer>
        {/* Permanent (desktop) — collapsible */}
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { ...paperBase, width: desktopWidth, transition: widthTransition } }}
        >
          {renderDrawer(collapsed, true)}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${desktopWidth}px)` }, minHeight: '100vh', transition: widthTransition }}>
        {isMobile && <Toolbar />/* spacer under the fixed mobile AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
