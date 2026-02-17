const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;

// GET /api/orders — user's orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name images');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders
router.post('/', protect, async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  if (!shippingAddress || !paymentMethod) {
    return res.status(400).json({ message: 'Shipping address and payment method are required' });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // Validate stock
    for (const item of cart.items) {
      if (!item.product.isActive) throw new Error(`${item.product.name} is no longer available`);
      if (item.product.stock < item.quantity) throw new Error(`Insufficient stock for ${item.product.name}`);
    }

    const subtotal = cart.subtotal;
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const taxAmount = +((subtotal + shippingCost) * TAX_RATE).toFixed(2);
    const totalAmount = +(subtotal + shippingCost + taxAmount - cart.discount).toFixed(2);

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images?.[0]?.url,
        price: i.price,
        quantity: i.quantity,
      })),
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount,
    });

    // Decrement stock
    await Promise.all(
      cart.items.map((item) =>
        Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
      )
    );

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], discount: 0 });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
