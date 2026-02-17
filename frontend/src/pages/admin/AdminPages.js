import React, { useEffect, useState } from 'react';
import { productsAPI, adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await productsAPI.getAll({ page, limit: 20 });
      setProducts(data.products);
      setPages(data.pages);
    } catch (err) { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product removed');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="admin-page" style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ marginBottom: 32 }}>Products</h1>
        {loading ? <div className="spinner" style={{ margin: '80px auto' }} /> : (
          <div className="card">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td><span className="badge badge-neutral">{p.category}</span></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td><span className={`badge ${p.stock < 10 ? 'badge-danger' : 'badge-success'}`}>{p.stock}</span></td>
                    <td>{'★'.repeat(Math.round(p.rating))} ({p.numReviews})</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p._id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pages > 1 && (
              <div className="pagination" style={{ padding: '20px' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                <span style={{ color: 'var(--text-secondary)', padding: '0 12px' }}>Page {page} of {pages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getOrders({ limit: 50 })
      .then(res => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, { status });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
      toast.success('Order updated');
    } catch { toast.error('Failed to update'); }
  };

  const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ marginBottom: 32 }}>Orders</h1>
        {loading ? <div className="spinner" style={{ margin: '80px auto' }} /> : (
          <div className="card">
            <table className="table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Date</th><th>Status</th><th>Update</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td><code style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{o.orderNumber}</code></td>
                    <td>{o.user?.name}<br /><small style={{ color: 'var(--text-muted)' }}>{o.user?.email}</small></td>
                    <td>${o.totalAmount?.toFixed(2)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-warning">{o.status}</span></td>
                    <td>
                      <select className="form-select" style={{ padding: '6px 10px', fontSize: '0.8rem', width: 'auto' }}
                        value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers()
      .then(res => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ marginBottom: 32 }}>Users ({users.length})</h1>
        {loading ? <div className="spinner" style={{ margin: '80px auto' }} /> : (
          <div className="card">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>{u.role}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
