import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI, authAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ---- Product Detail ----
export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    productsAPI.getById(id)
      .then(res => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!product) return <div className="page-loading">Product not found. <Link to="/products">Go back</Link></div>;

  const displayPrice = product.discount > 0 ? product.salePrice : product.price;

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        <Link to="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Products</Link>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 32 }}>
          <div>
            <img
              src={product.images?.[0]?.url || `https://picsum.photos/seed/${product._id}/600/600`}
              alt={product.name}
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{product.brand}</span>
            <h1 style={{ marginTop: 8, marginBottom: 16 }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ color: 'var(--accent)' }}>{'★'.repeat(Math.round(product.rating))}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>({product.numReviews} reviews)</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700 }}>${displayPrice?.toFixed(2)}</span>
              {product.discount > 0 && <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 12 }}>${product.price?.toFixed(2)}</span>}
              {product.discount > 0 && <span style={{ background: 'var(--accent)', color: '#0a0a0b', padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, marginLeft: 10 }}>-{product.discount}%</span>}
            </div>
            <p style={{ lineHeight: 1.8, marginBottom: 24 }}>{product.description}</p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Qty:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 12px' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>−</button>
                <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{product.stock} in stock</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={() => addItem(product._id, qty)} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Checkout ----
export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState({ street: '', city: '', state: '', zipCode: '', country: 'US' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await ordersAPI.create({ shippingAddress: form, paymentMethod });
      toast.success(`Order ${order.data.orderNumber} placed!`);
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        <h1 style={{ marginBottom: 40 }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 24, fontFamily: 'var(--font-body)' }}>Shipping Address</h3>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="form-input" required value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input className="form-input" required value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" required value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 24, fontFamily: 'var(--font-body)' }}>Payment Method</h3>
              {['cod', 'stripe', 'paypal'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }}>
                  <input type="radio" name="payment" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                  <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {m === 'cod' ? 'Cash on Delivery' : m === 'stripe' ? 'Credit Card (Stripe)' : 'PayPal'}
                  </span>
                </label>
              ))}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>

          <div className="card" style={{ padding: 28, position: 'sticky', top: 88 }}>
            <h3 style={{ marginBottom: 20 }}>Your Cart ({cart.itemCount} items)</h3>
            {cart.items.map(item => (
              <div key={item.product?._id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <img src={item.product?.images?.[0]?.url || 'https://picsum.photos/60/60'} alt="" style={{ width: 56, height: 56, borderRadius: 'var(--radius)', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{item.product?.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>x{item.quantity} · ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
              <span>Subtotal</span><span>${cart.subtotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Orders ----
export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll()
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  const statusColors = { pending: 'badge-warning', confirmed: 'badge-info', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        <h1 style={{ marginBottom: 40 }}>My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state"><p>No orders yet.</p><Link to="/products" className="btn btn-primary">Start Shopping</Link></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order._id} className="card">
                <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <code style={{ color: 'var(--accent)', fontWeight: 700 }}>{order.orderNumber}</code>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${statusColors[order.status] || 'badge-neutral'}`}>{order.status}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>${order.totalAmount?.toFixed(2)}</span>
                </div>
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {order.items.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <img src={item.image || 'https://picsum.photos/40/40'} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius)', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.name} ×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Profile ----
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateMe(form);
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ marginBottom: 40 }}>My Profile</h1>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>{user?.role}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
