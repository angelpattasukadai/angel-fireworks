import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../auth';

// Guards a route: if there's no token, redirect to /login.
const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
