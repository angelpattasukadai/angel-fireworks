import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel,
  Switch, Checkbox, FormGroup, InputAdornment, CircularProgress, Tooltip, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { UserPlus, Edit, Trash2, X, User, Lock, Crown, ShieldCheck, Search } from 'lucide-react';
import api from '../api';
import { PERMISSIONS } from '../permissions';

const EMPTY_FORM = { username: '', name: '', password: '', permissions: [], active: true };
const permLabel = (key) => PERMISSIONS.find(p => p.key === key)?.label || key;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admins')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const q = search.trim().toLowerCase();
  const filteredUsers = q
    ? users.filter(u => (u.username || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q))
    : users;

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const togglePerm = (key) => setForm(f => ({
    ...f,
    permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key],
  }));

  // validation
  const usernameValid = editing || form.username.trim().length >= 3;
  const passwordValid = editing ? (form.password === '' || form.password.length >= 6) : form.password.length >= 6;
  const formValid = usernameValid && passwordValid;

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ username: u.username, name: u.name || '', password: '', permissions: u.permissions || [], active: u.active !== false });
    setDialogOpen(true);
  };
  const closeDialog = () => { if (!saving) setDialogOpen(false); };

  const handleSave = async () => {
    if (!formValid) return;
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name.trim(), permissions: form.permissions, active: form.active };
        if (form.password) payload.password = form.password;
        await api.put(`/admins/${editing._id}`, payload);
      } else {
        await api.post('/admins', {
          username: form.username.trim(), password: form.password, name: form.name.trim(), permissions: form.permissions,
        });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admins/${u._id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting user.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 5 }}>
        <Box>
          <Typography sx={{ color: '#F6F1FF', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 3, mb: 1.5, textTransform: 'uppercase' }}>Team</Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#D4AF37', fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>Manage Users</Typography>
          <Typography sx={{ color: '#A99BC9', fontSize: '0.95rem', mt: 1 }}>Create sub-admins and choose exactly what each one can access.</Typography>
        </Box>
        <Button variant="contained" startIcon={<UserPlus size={18} />} onClick={openAdd}
          sx={{ borderRadius: '14px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 3.5, py: 1.3, '&:hover': { bgcolor: '#E8C84A' } }}>
          Add User
        </Button>
      </Box>

      <Paper className="glass-panel" sx={{ borderRadius: '24px', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <TextField
            placeholder="Search by name or username..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color="#8E7CAD" /></InputAdornment> }}
            sx={{ mb: 2, width: { xs: '100%', sm: 340 }, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)' } }}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 800, color: '#A99BC9', fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '2px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, color: '#8E7CAD' }}>Loading…</TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, color: '#8E7CAD' }}>{users.length === 0 ? 'No users yet.' : 'No users match your search.'}</TableCell></TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuper = u.role === 'superadmin';
                    return (
                      <TableRow key={u._id} hover sx={{ '&:hover': { bgcolor: 'rgba(212,175,55,0.03)' } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: '#F6F1FF', fontSize: '0.95rem' }}>{u.name || u.username}</Typography>
                          <Typography sx={{ color: '#A99BC9', fontSize: '0.8rem' }}>@{u.username}</Typography>
                        </TableCell>
                        <TableCell>
                          {isSuper
                            ? <Chip icon={<Crown size={13} />} label="Super Admin" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontWeight: 700, '& .MuiChip-icon': { color: '#D4AF37' } }} />
                            : <Chip label="Sub-admin" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.12)', color: '#c084fc', fontWeight: 700 }} />}
                        </TableCell>
                        <TableCell>
                          {isSuper ? (
                            <Typography sx={{ color: '#D4AF37', fontSize: '0.82rem', fontWeight: 600 }}>Full access</Typography>
                          ) : (u.permissions || []).length === 0 ? (
                            <Typography sx={{ color: '#7C6BA0', fontSize: '0.82rem' }}>No access granted</Typography>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {u.permissions.map(p => <Chip key={p} label={permLabel(p).replace(' (Catalog)', '')} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#C4B5D4', fontWeight: 600, fontSize: '0.7rem' }} />)}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={u.active !== false ? 'Active' : 'Disabled'} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: u.active !== false ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: u.active !== false ? '#10b981' : '#ef4444' }} />
                        </TableCell>
                        <TableCell align="right">
                          {isSuper ? (
                            <Tooltip title="Super Admin is managed via the server (create-admin)">
                              <span><IconButton size="small" disabled><ShieldCheck size={16} /></IconButton></span>
                            </Tooltip>
                          ) : (
                            <>
                              <IconButton size="small" onClick={() => openEdit(u)} sx={{ mr: 1, color: '#C4B5D4' }}><Edit size={16} /></IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(u)}><Trash2 size={16} /></IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#211042', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F6F1FF' }}>
          {editing ? `Edit ${editing.username}` : 'Add New User'}
          <IconButton onClick={closeDialog} sx={{ color: '#A99BC9' }}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {!editing && (
            <TextField fullWidth label="Username" value={form.username} onChange={(e) => setField('username', e.target.value)}
              required error={form.username.length > 0 && !usernameValid}
              helperText={form.username.length > 0 && !usernameValid ? 'At least 3 characters' : ' '}
              InputProps={{ startAdornment: <InputAdornment position="start"><User size={16} color="#D4AF37" /></InputAdornment> }}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          )}
          <TextField fullWidth label="Display Name (optional)" value={form.name} onChange={(e) => setField('name', e.target.value)}
            sx={{ mb: 2, mt: editing ? 1 : 0, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label={editing ? 'New Password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={(e) => setField('password', e.target.value)}
            required={!editing} error={form.password.length > 0 && !passwordValid}
            helperText={form.password.length > 0 && !passwordValid ? 'At least 6 characters' : ' '}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={16} color="#D4AF37" /></InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }}><Typography sx={{ color: '#8E7CAD', fontSize: '0.72rem', fontWeight: 700 }}>ACCESS PERMISSIONS</Typography></Divider>
          <FormGroup>
            {PERMISSIONS.map(p => (
              <FormControlLabel key={p.key}
                control={<Checkbox checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} sx={{ color: '#8E7CAD', '&.Mui-checked': { color: '#D4AF37' } }} />}
                label={<Typography sx={{ color: '#F6F1FF', fontSize: '0.92rem' }}>{p.label}</Typography>}
              />
            ))}
          </FormGroup>
          <Typography sx={{ color: '#7C6BA0', fontSize: '0.75rem', mt: 0.5 }}>Only checked areas will be accessible to this user.</Typography>

          {editing && (
            <>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />
              <FormControlLabel
                control={<Switch checked={form.active} onChange={(e) => setField('active', e.target.checked)} />}
                label={<Typography sx={{ color: '#F6F1FF', fontWeight: 600 }}>Account active {form.active ? '' : '(login blocked)'}</Typography>}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ borderRadius: '12px', color: '#A99BC9' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formValid || saving}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#1A0B30' }} /> : null}
            sx={{ borderRadius: '12px', bgcolor: '#D4AF37', color: '#1A0B30', fontWeight: 800, px: 4, '&:hover': { bgcolor: '#E8C84A' }, '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } }}>
            {saving ? 'Saving…' : editing ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUsers;
