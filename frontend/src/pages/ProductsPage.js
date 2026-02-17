import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import './ProductsPage.css';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
];

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food', 'Other'];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const isFeatured = searchParams.get('isFeatured') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 20 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (isFeatured) params.isFeatured = isFeatured;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await productsAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, isFeatured, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', search);
  };

  const goPage = (n) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', n);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <div>
            <h1>All Products</h1>
            <p>{total} products found</p>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className="filters-panel">
            <div className="filter-section">
              <h4>Category</h4>
              <button
                className={`filter-btn ${!category ? 'active' : ''}`}
                onClick={() => updateParam('category', '')}
              >All</button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`filter-btn ${category === c ? 'active' : ''}`}
                  onClick={() => updateParam('category', c)}
                >{c}</button>
              ))}
            </div>

            <div className="filter-section">
              <h4>Sort By</h4>
              <select className="form-select" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input type="number" className="form-input" placeholder="Min $" value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)} min="0" />
                <input type="number" className="form-input" placeholder="Max $" value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)} min="0" />
              </div>
            </div>

            <div className="filter-section">
              <button
                className={`filter-btn ${isFeatured ? 'active' : ''}`}
                onClick={() => updateParam('isFeatured', isFeatured ? '' : 'true')}
              >⭐ Featured Only</button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="products-grid-wrap">
            {loading ? (
              <div className="loading-wrap"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p>No products found.</p>
                <button className="btn btn-secondary" onClick={() => setSearchParams({})}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-3">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button onClick={() => goPage(page - 1)} disabled={page === 1}>‹</button>
                    {Array.from({ length: pages }, (_, i) => i + 1)
                      .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
                      .reduce((acc, n, i, arr) => {
                        if (i > 0 && n - arr[i-1] > 1) acc.push('...');
                        acc.push(n);
                        return acc;
                      }, [])
                      .map((n, i) => typeof n === 'string' ? (
                        <span key={i} className="page-ellipsis">…</span>
                      ) : (
                        <button key={n} className={page === n ? 'active' : ''} onClick={() => goPage(n)}>{n}</button>
                      ))
                    }
                    <button onClick={() => goPage(page + 1)} disabled={page === pages}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
