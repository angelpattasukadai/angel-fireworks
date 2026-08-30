import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Wholesale from './pages/Wholesale';
import { Box } from '@mui/material';

const CART_STORAGE_KEY = 'angel_cart';

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity) => {
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) {
      setCart(cart.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setCart([...cart, { product, quantity, price: product.discountedPrice || product.price }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => item.product._id === productId ? { ...item, quantity: newQty } : item));
  };

  const clearCart = () => setCart([]);

  return (
    <Router>
      <ScrollToTop />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar cartCount={cart.reduce((a, c) => a + c.quantity, 0)} />
        <Box component="main" sx={{ flexGrow: 1, pt: '80px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog addToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/checkout" element={<Checkout cart={cart} removeFromCart={removeFromCart} updateCartQuantity={updateCartQuantity} clearCart={clearCart} />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
