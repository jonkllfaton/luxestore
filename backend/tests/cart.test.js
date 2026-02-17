const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');

describe('Cart Routes', () => {
  let token, product;

  beforeEach(async () => {
    await User.create({ name: 'User', email: 'user@test.com', password: 'pass1234' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pass1234' });
    token = loginRes.body.token;

    product = await Product.create({
      name: 'Widget', slug: 'widget-001', description: 'A widget', price: 29.99,
      category: 'Electronics', brand: 'TestBrand', stock: 100,
    });
  });

  describe('GET /api/cart', () => {
    it('should return empty cart for new user', async () => {
      const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 2 });
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(2);
    });

    it('should increment quantity for existing item', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 1 });

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 2 });

      expect(res.body.items[0].quantity).toBe(3);
    });

    it('should reject quantity exceeding stock', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 9999 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/cart/items/:productId', () => {
    it('should remove item from cart', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 1 });

      const res = await request(app)
        .delete(`/api/cart/items/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });
  });
});
