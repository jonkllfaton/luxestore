const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    images: [{ url: String, alt: String }],
    category: {
      type: String,
      required: true,
      index: true,
      enum: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food', 'Other'],
    },
    subcategory: { type: String },
    brand: { type: String, trim: true },
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    weight: { type: Number },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    tags: [String],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Full text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ price: 1, rating: -1 });

// Virtual for discounted price
productSchema.virtual('salePrice').get(function () {
  if (this.discount > 0) {
    return +(this.price * (1 - this.discount / 100)).toFixed(2);
  }
  return this.price;
});

// Update rating on review changes
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.rating = +(
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length
    ).toFixed(1);
  }
};

module.exports = mongoose.model('Product', productSchema);
