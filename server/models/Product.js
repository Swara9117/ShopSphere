const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    brand: { type: String, default: '' },
    images: {
      type: [String],
      validate: {
        validator(images) {
          return images.length >= 1 && images.length <= 5;
        },
        message: 'Product must have between 1 and 5 images',
      },
    },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('image').get(function () {
  return this.images?.[0] || '/images/sample.jpg';
});

module.exports = mongoose.model('Product', productSchema);
