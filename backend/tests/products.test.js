const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');

const sampleProduct = {
  name: 'Test Headphones',
  slug: 'test-headphones-001',
  description: 'Great test headphones with excellent sound quality',
  price: 99.99,
  category: 'Electronics',
  brand: 'TestBrand',
  stock: 50,
  images: [{ url: 'https://example.com/img.jpg', alt: 'headphones' }],
};

describe('Product Routes', () => {
  let adminToken, userToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin',
    });
    const user = await User.create({
      name: 'User', email: 'user@test.com', password: 'user1234',
    });

    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'admin123' });
    const userRes = await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'user1234' });

    adminToken = adminRes.body.token;
    userToken = userRes.body.token;
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      await Product.create([
        sampleProduct,
        { ...sampleProduct, name: 'Test Speaker', slug: 'test-speaker-002', price: 49.99, category: 'Electronics' },
        { ...sampleProduct, name: 'Test Jeans', slug: 'test-jeans-003', price: 59.99, category: 'Clothing' },
      ]);
    });

    it('should return paginated products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(3);
      expect(res.body.total).toBe(3);
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/products?category=Clothing');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].category).toBe('Clothing');
    });

    it('should filter by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=50&maxPrice=80');
      expect(res.status).toBe(200);
      expect(res.body.products.every((p) => p.price >= 50 && p.price <= 80)).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app).get('/api/products?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.pages).toBe(2);
    });
  });

  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleProduct);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(sampleProduct.name);
    });

    it('should reject product creation by regular user', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleProduct);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product', async () => {
      const product = await Product.create(sampleProduct);
      const res = await request(app).get(`/api/products/${product._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(sampleProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/products/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});
