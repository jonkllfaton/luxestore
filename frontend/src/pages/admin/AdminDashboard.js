import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import './AdminDashboard.css';

const StatCard = ({ title, value, icon, color, link }) => (
  <Link to={link || '#'} className="stat-card">
    <div className="stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div className="stat-info">
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value}</p>
    </div>
  </Link>
);

const statusColor = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!data) return <div className="page-loading">Failed to load dashboard</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Overview of your store's performance</p>
          </div>
          <div className="admin-nav-links">
            <Link to="/admin/products" className="btn btn-secondary btn-sm">Products</Link>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">Orders</Link>
            <Link to="/admin/users" className="btn btn-secondary btn-sm">Users</Link>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard title="Total Revenue" value={`$${data.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="💰" color="#c9a96e" link="/admin/orders" />
          <StatCard title="Total Orders" value={data.stats.totalOrders.toLocaleString()} icon="📦" color="#5ca0e0" link="/admin/orders" />
          <StatCard title="Products" value={data.stats.totalProducts.toLocaleString()} icon="🛍️" color="#5cbe8a" link="/admin/products" />
          <StatCard title="Customers" value={data.stats.totalUsers.toLocaleString()} icon="👥" color="#e05c8a" link="/admin/users" />
        </div>

        <div className="admin-grid">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className="see-all">View all →</Link>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td><code className="order-num">{order.orderNumber}</code></td>
                      <td>{order.user?.name}</td>
                      <td>${order.totalAmount?.toFixed(2)}</td>
                      <td><span className={`badge ${statusColor[order.status] || 'badge-neutral'}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock */}
          <div className="card">
            <div className="card-header">
              <h3>Low Stock Alert</h3>
              <Link to="/admin/products" className="see-all">Manage →</Link>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((p) => (
                    <tr key={p._id}>
                      <td className="product-name-cell">{p.name}</td>
                      <td>{p.category}</td>
                      <td>
                        <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.lowStockProducts.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--success)' }}>✓ All products are well-stocked</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card order-breakdown">
          <div className="card-header"><h3>Order Status Breakdown</h3></div>
          <div className="breakdown-grid">
            {data.ordersByStatus.map((s) => (
              <div key={s._id} className="breakdown-item">
                <span className={`badge ${statusColor[s._id] || 'badge-neutral'}`}>{s._id}</span>
                <span className="breakdown-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
