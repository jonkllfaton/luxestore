require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys'];

const brands = {
  Electronics: ['Sony', 'Samsung', 'Apple', 'LG', 'Bose', 'Dell', 'Logitech'],
  Clothing: ['Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Gap'],
  Books: ['Penguin', 'Random House', 'HarperCollins', 'Scholastic'],
  'Home & Garden': ['IKEA', 'Dyson', 'KitchenAid', 'Cuisinart'],
  Sports: ['Nike', 'Under Armour', 'Wilson', 'Callaway'],
  Beauty: ['L\'Oréal', 'Maybelline', 'Neutrogena', 'CeraVe'],
  Toys: ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price'],
};

const productTemplates = {
  Electronics: [
    { name: 'Wireless Noise-Canceling Headphones', basePrice: 299 },
    { name: '4K Smart TV 55"', basePrice: 799 },
    { name: 'Mechanical Gaming Keyboard', basePrice: 149 },
    { name: 'USB-C Docking Station', basePrice: 89 },
    { name: 'Portable Bluetooth Speaker', basePrice: 59 },
    { name: 'Wireless Charging Pad', basePrice: 39 },
    { name: 'Gaming Mouse RGB', basePrice: 79 },
    { name: '27" 4K Monitor', basePrice: 499 },
  ],
  Clothing: [
    { name: 'Classic Fit Jeans', basePrice: 59 },
    { name: 'Performance Running Shoes', basePrice: 129 },
    { name: 'Casual Hoodie', basePrice: 49 },
    { name: 'Slim Fit Chinos', basePrice: 69 },
    { name: 'Athletic T-Shirt Pack', basePrice: 39 },
    { name: 'Winter Puffer Jacket', basePrice: 179 },
    { name: 'Yoga Leggings', basePrice: 55 },
    { name: 'Canvas Sneakers', basePrice: 45 },
  ],
  Books: [
    { name: 'The Art of Clean Code', basePrice: 35 },
    { name: 'Design Patterns in Practice', basePrice: 45 },
    { name: 'Modern JavaScript Essentials', basePrice: 29 },
    { name: 'Machine Learning Fundamentals', basePrice: 55 },
    { name: 'System Design Interview Guide', basePrice: 39 },
    { name: 'Clean Architecture', basePrice: 42 },
  ],
  'Home & Garden': [
    { name: 'Robot Vacuum Cleaner', basePrice: 299 },
    { name: 'Air Purifier HEPA', basePrice: 199 },
    { name: 'Stand Mixer 5-Quart', basePrice: 349 },
    { name: 'Coffee Maker with Grinder', basePrice: 149 },
    { name: 'Smart Thermostat', basePrice: 249 },
    { name: 'Indoor Herb Garden Kit', basePrice: 49 },
    { name: 'Cordless Vacuum', basePrice: 179 },
    { name: 'Instant Pot 6-Quart', basePrice: 99 },
  ],
  Sports: [
    { name: 'Yoga Mat Premium', basePrice: 69 },
    { name: 'Adjustable Dumbbells Set', basePrice: 299 },
    { name: 'Road Cycling Helmet', basePrice: 119 },
    { name: 'Tennis Racket Pro', basePrice: 149 },
    { name: 'Resistance Bands Set', basePrice: 35 },
    { name: 'Foam Roller Recovery', basePrice: 29 },
    { name: 'Jump Rope Speed', basePrice: 19 },
    { name: 'Pull-Up Bar Doorframe', basePrice: 39 },
  ],
  Beauty: [
    { name: 'Vitamin C Serum', basePrice: 45 },
    { name: 'Hyaluronic Acid Moisturizer', basePrice: 35 },
    { name: 'Electric Face Cleansing Brush', basePrice: 79 },
    { name: 'SPF 50 Sunscreen', basePrice: 25 },
    { name: 'Retinol Night Cream', basePrice: 55 },
    { name: 'Micellar Cleansing Water', basePrice: 15 },
    { name: 'Hair Repair Mask', basePrice: 29 },
    { name: 'Lip Care Set', basePrice: 22 },
  ],
  Toys: [
    { name: 'STEM Building Blocks 500pc', basePrice: 49 },
    { name: 'Remote Control Car', basePrice: 69 },
    { name: 'Classic Board Game Set', basePrice: 39 },
    { name: 'Art Supply Kit Kids', basePrice: 35 },
    { name: 'Wooden Puzzle Set', basePrice: 29 },
    { name: 'Stuffed Animal Collection', basePrice: 25 },
    { name: 'Science Experiment Kit', basePrice: 45 },
    { name: 'Musical Instrument Starter Set', basePrice: 59 },
  ],
};

const generateSlug = (name, index) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${index}`;

const generateProducts = () => {
  const products = [];
  let index = 1;

  for (const [category, templates] of Object.entries(productTemplates)) {
    const categoryBrands = brands[category];

    // Generate 4 variants per template (different models/sizes)
    templates.forEach((template) => {
      const variants = ['Standard', 'Pro', 'Premium', 'Lite'];
      variants.forEach((variant, vi) => {
        const priceMultiplier = [1, 1.4, 1.8, 0.7][vi];
        const price = +(template.basePrice * priceMultiplier).toFixed(2);
        const brand = categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
        const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0;

        products.push({
          name: `${brand} ${template.name} ${variant}`,
          slug: generateSlug(`${brand}-${template.name}-${variant}`, index++),
          description: `High-quality ${template.name.toLowerCase()} from ${brand}. The ${variant} edition offers excellent performance and reliability for everyday use. Perfect for professionals and enthusiasts alike.`,
          shortDescription: `${brand} ${template.name} - ${variant} Edition`,
          price,
          comparePrice: discount > 0 ? +(price / (1 - discount / 100)).toFixed(2) : undefined,
          category,
          brand,
          sku: `SKU-${category.slice(0, 3).toUpperCase()}-${String(index).padStart(5, '0')}`,
          stock: Math.floor(Math.random() * 200) + 5,
          rating: +(Math.random() * 2 + 3).toFixed(1),
          numReviews: Math.floor(Math.random() * 500),
          isFeatured: Math.random() > 0.85,
          discount,
          tags: [category.toLowerCase(), brand.toLowerCase(), variant.toLowerCase()],
          images: [
            {
              url: `https://picsum.photos/seed/${index}/600/600`,
              alt: `${brand} ${template.name} ${variant}`,
            },
          ],
        });
      });
    });
  }

  return products;
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    await User.deleteMany({});

    const products = generateProducts();
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`✅ Admin: admin@store.com / admin123`);

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'user@store.com',
      password: 'user1234',
    });
    console.log(`✅ User: user@store.com / user1234`);

    mongoose.disconnect();
    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
