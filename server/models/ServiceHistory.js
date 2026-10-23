import mongoose from 'mongoose';

const serviceHistorySchema = new mongoose.Schema(
  {
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    tokenNumber: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    waitDurationMins: {
      type: Number,
      required: true,
      default: 0,
    },
    serviceDurationMins: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    hourOfDay: {
      type: Number,
      min: 0,
      max: 23,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'no_show'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for aggregation pipelines
serviceHistorySchema.index({ business: 1, date: -1 });
serviceHistorySchema.index({ business: 1, hourOfDay: 1 });

const ServiceHistory = mongoose.model('ServiceHistory', serviceHistorySchema);
export default ServiceHistory;
