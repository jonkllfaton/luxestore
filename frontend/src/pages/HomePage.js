import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import './HomePage.css';

const categories = [
  { name: 'Electronics', icon: '⚡', color: '#5ca0e0' },
  { name: 'Clothing', icon: '👕', color: '#c9a96e' },
  { name: 'Books', icon: '📚', color: '#5cbe8a' },
  { name: 'Home & Garden', icon: '🏠', color: '#e05c8a' },
  { name: 'Sports', icon: '🏃', color: '#e07a5c' },
  { name: 'Beauty', icon: '✨', color: '#b05ce0' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          productsAPI.getAll({ isFeatured: true, limit: 4 }),
          productsAPI.getAll({ sort: '-createdAt', limit: 8 }),
        ]);
        setFeatured(featRes.data.products);
        setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <span className="hero-eyebrow">New Collection 2024</span>
          <h1 className="hero-title">Discover<br /><span className="accent">Premium</span><br />Products</h1>
          <p className="hero-sub">Over 200+ curated products from the world's leading brands. Quality, style, and value — all in one place.</p>
          <div className="hero-cta">
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
            <Link to="/products?isFeatured=true" className="btn btn-secondary btn-lg">Featured Items</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">200+</span><span className="stat-label">Products</span></div>
            <div className="stat"><span className="stat-num">1K+</span><span className="stat-label">Transactions</span></div>
            <div className="stat"><span className="stat-num">4.8★</span><span className="stat-label">Avg Rating</span></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/products" className="see-all">View all →</Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`} className="category-card">
                <span className="cat-icon" style={{ color: cat.color }}>{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Products</h2>
              <Link to="/products?isFeatured=true" className="see-all">View all →</Link>
            </div>
            {loading ? (
              <div className="spinner" />
            ) : (
              <div className="grid grid-4">
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>New Arrivals</h2>
            <Link to="/products?sort=-createdAt" className="see-all">View all →</Link>
          </div>
          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="grid grid-4">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="section">
        <div className="container">
          <div className="promo-banner">
            <div>
              <h3>Free Shipping on Orders Over $75</h3>
              <p>Shop today and enjoy complimentary shipping on qualifying orders.</p>
            </div>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
