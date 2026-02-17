import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">◈</span>
          <span>LUXE<span className="brand-accent">STORE</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/products?category=Electronics" className="nav-link" onClick={() => setMenuOpen(false)}>Electronics</NavLink>
          <NavLink to="/products?category=Clothing" className="nav-link" onClick={() => setMenuOpen(false)}>Clothing</NavLink>
          <NavLink to="/products?isFeatured=true" className="nav-link" onClick={() => setMenuOpen(false)}>Featured</NavLink>
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {cart.itemCount > 0 && <span className="cart-badge">{cart.itemCount}</span>}
          </Link>

          {user ? (
            <div className="user-menu-wrap">
              <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item accent" onClick={() => setUserMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button className="dropdown-item danger" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
