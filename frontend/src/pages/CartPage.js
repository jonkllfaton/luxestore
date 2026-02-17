import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const TAX_RATE = 0.08;
  const FREE_SHIPPING = 75;
  const SHIPPING = 9.99;
  const subtotal = cart.subtotal || 0;
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING;
  const tax = +((subtotal + shipping) * TAX_RATE).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart <span className="cart-count">({cart.itemCount} items)</span></h1>
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.product?._id || item._id} className="cart-item">
                <img
                  src={item.product?.images?.[0]?.url || `https://picsum.photos/seed/${item.product?._id}/120/120`}
                  alt={item.product?.name}
                  className="item-img"
                />
                <div className="item-details">
                  <h3 className="item-name">{item.product?.name || 'Product'}</h3>
                  <p className="item-price">${item.price?.toFixed(2)} each</p>
                </div>
                <div className="item-qty">
                  <button className="qty-btn" onClick={() => updateItem(item.product?._id, item.quantity - 1)} disabled={loading || item.quantity <= 1}>−</button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateItem(item.product?._id, item.quantity + 1)} disabled={loading || item.quantity >= (item.product?.stock || 99)}>+</button>
                </div>
                <div className="item-subtotal">${(item.price * item.quantity).toFixed(2)}</div>
                <button className="remove-btn" onClick={() => removeItem(item.product?._id)} title="Remove">✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="free-tag">FREE</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            {shipping > 0 && (
              <p className="free-threshold">Add ${(FREE_SHIPPING - subtotal).toFixed(2)} more for free shipping!</p>
            )}
            <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="divider" />
            <div className="summary-row total-row">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg checkout-btn">Proceed to Checkout</Link>
            <Link to="/products" className="btn btn-secondary continue-btn">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
