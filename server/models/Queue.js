import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Queue must belong to a business'],
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Queue must correspond to a service/department'],
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
      index: true,
    },
    currentServingToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      default: null,
    },
    activeCounters: {
      type: Number,
      required: true,
      min: [1, 'Active counters must be at least 1'],
      default: 1,
    },
    totalCounters: {
      type: Number,
      required: true,
      min: [1, 'Total counters must be at least 1'],
      default: 1,
    },
    peakMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 3.0,
    },
    tokenSequence: {
      type: Number,
      default: 100, // Starts at 100 for clean 3-digit token IDs like QL-OPD-101
    },
  },
  {
    timestamps: true,
  }
);

queueSchema.index({ business: 1, service: 1 });

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
