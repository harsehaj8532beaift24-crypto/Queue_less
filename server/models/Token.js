import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sequenceNumber: {
      type: Number,
      required: true,
    },
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: [true, 'Token must belong to a queue'],
      index: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Token must belong to a business'],
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Token must belong to a service'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    partySize: {
      type: Number,
      default: 1,
      min: 1,
    },
    isPriority: {
      type: Boolean,
      default: false,
    },
    priorityReason: {
      type: String,
      default: '',
    },
    priorityCategory: {
      type: String,
      default: 'Regular',
    },
    status: {
      type: String,
      enum: ['waiting', 'calling', 'serving', 'completed', 'cancelled', 'skipped'],
      default: 'waiting',
      index: true,
    },
    priorityStatus: {
      type: String,
      enum: ['none', 'verified', 'pending', 'rejected', 'expired'],
      default: 'none',
      index: true,
    },
    priorityApprovedAt: {
      type: Date,
      default: null,
    },
    priorityReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    priorityReviewNote: {
      type: String,
      default: '',
    },
    position: {
      type: Number,
      default: 1,
      min: 1,
    },
    peopleAhead: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    qrTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    serviceStartedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    skippedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Concurrency & Scope Protection: Unique sequence number per queue
tokenSchema.index({ queue: 1, sequenceNumber: 1 }, { unique: true });

// Ordering index for fast queue retrieval & re-indexing
tokenSchema.index({ queue: 1, status: 1, joinedAt: 1 });

// Customer history index
tokenSchema.index({ user: 1, status: 1, joinedAt: -1 });

const Token = mongoose.model('Token', tokenSchema);
export default Token;
