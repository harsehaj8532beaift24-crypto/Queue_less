import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Service must belong to a business'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service/Department name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    prefix: {
      type: String,
      required: [true, 'Token prefix is required'],
      trim: true,
      uppercase: true,
      maxlength: 10,
    },
    averageServiceMinutes: {
      type: Number,
      required: [true, 'Average service duration is required'],
      min: [1, 'Service duration must be at least 1 minute'],
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ business: 1, prefix: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
