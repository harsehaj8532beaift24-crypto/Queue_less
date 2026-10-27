import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [120, 'Business name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['hospital', 'bank', 'salon', 'govt', 'cafeteria', 'other'],
      index: true,
    },
    categoryName: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    },
    openHours: {
      type: String,
      default: '08:00 AM - 08:00 PM',
    },
    peakHours: {
      type: [String],
      default: ['10:00 AM - 12:30 PM', '04:00 PM - 06:30 PM'],
    },
    aiTip: {
      type: String,
      default: 'Queue velocity is optimal during mid-day hours.',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for services
businessSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'business',
});

// Virtual for queues
businessSchema.virtual('queues', {
  ref: 'Queue',
  localField: '_id',
  foreignField: 'business',
});

// Text index for search
businessSchema.index({ name: 'text', address: 'text', city: 'text' });

const Business = mongoose.model('Business', businessSchema);
export default Business;
