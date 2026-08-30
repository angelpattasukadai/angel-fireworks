import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageCatalog from './pages/ManageCatalog';
import ManageGallery from './pages/ManageGallery';
import ManageUsers from './pages/ManageUsers';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RequirePermission from './components/RequirePermission';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* All admin pages share the layout and require a valid token */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/catalog" element={<RequirePermission perm="products"><ManageCatalog /></RequirePermission>} />
          <Route path="/gallery" element={<RequirePermission perm="gallery"><ManageGallery /></RequirePermission>} />
          <Route path="/users" element={<RequirePermission perm="super"><ManageUsers /></RequirePermission>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
