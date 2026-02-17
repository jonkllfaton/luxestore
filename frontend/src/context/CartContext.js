import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 }); return; }
    try {
      const { data } = await cartAPI.get();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please log in to add items'); return; }
    setLoading(true);
    try {
      const { data } = await cartAPI.addItem(productId, quantity);
      setCart(data);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    setLoading(true);
    try {
      const { data } = await cartAPI.updateItem(productId, quantity);
      setCart(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setLoading(true);
    try {
      const { data } = await cartAPI.removeItem(productId);
      setCart(data);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 });
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
