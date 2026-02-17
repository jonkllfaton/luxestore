import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const StarRating = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map((s) => (
      <span key={s} style={{ opacity: s <= Math.round(rating) ? 1 : 0.25 }}>★</span>
    ))}
  </div>
);

export default function ProductCard({ product }) {
  const { addItem, loading } = useCart();

  const displayPrice = product.discount > 0 ? product.salePrice : product.price;
  const originalPrice = product.discount > 0 ? product.price : null;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-img-wrap">
        <img
          src={product.images?.[0]?.url || `https://picsum.photos/seed/${product._id}/400/400`}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="product-discount-badge">-{product.discount}%</span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="product-stock-badge">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <div className="product-out-of-stock">Out of Stock</div>
        )}
      </Link>

      <div className="product-info">
        <div className="product-meta">
          <span className="product-brand">{product.brand}</span>
          <span className="product-category">{product.category}</span>
        </div>
        <Link to={`/products/${product._id}`} className="product-name">{product.name}</Link>
        <div className="product-rating">
          <StarRating rating={product.rating} />
          <span className="review-count">({product.numReviews})</span>
        </div>
        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">${displayPrice?.toFixed(2)}</span>
            {originalPrice && <span className="price-original">${originalPrice.toFixed(2)}</span>}
          </div>
          <button
            className="btn btn-primary btn-sm add-cart-btn"
            onClick={() => addItem(product._id, 1)}
            disabled={loading || product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
