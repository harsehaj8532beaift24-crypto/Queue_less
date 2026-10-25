import mongoose from 'mongoose';
import Business from '../models/Business.js';
import Service from '../models/Service.js';
import Queue from '../models/Queue.js';
import Token from '../models/Token.js';

/**
 * Get all active businesses with nested services and live queue stats
 * GET /api/businesses
 */
export async function getAllBusinesses(req, res, next) {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ];
    }

    const businesses = await Business.find(filter).sort({ rating: -1 }).lean();

    // Attach services and live queue counts
    const businessIds = businesses.map((b) => b._id);
    const services = await Service.find({ business: { $in: businessIds }, isActive: true }).lean();
    const queues = await Queue.find({ business: { $in: businessIds } }).lean();

    // Query active waiting tokens per queue
    const queueIds = queues.map((q) => q._id);
    const activeWaiting = await Token.aggregate([
      { $match: { queue: { $in: queueIds }, status: { $in: ['waiting', 'calling'] } } },
      { $group: { _id: '$queue', count: { $sum: 1 } } },
    ]);
    const waitingMap = {};
    activeWaiting.forEach((w) => {
      waitingMap[w._id.toString()] = w.count;
    });

    const enrichedBusinesses = businesses.map((biz) => {
      const bizServices = services.filter((s) => s.business.toString() === biz._id.toString());
      const bizQueues = queues.filter((q) => q.business.toString() === biz._id.toString());

      // Sum active counters and total waiting tokens
      let totalActiveCounters = 0;
      let totalCounters = 0;
      let totalQueueLength = 0;
      let avgTime = 10;

      bizQueues.forEach((q) => {
        totalActiveCounters += q.activeCounters || 1;
        totalCounters += q.totalCounters || 1;
        totalQueueLength += waitingMap[q._id.toString()] || 0;
      });

      if (bizServices.length > 0) {
        avgTime = Math.round(
          bizServices.reduce((sum, s) => sum + s.averageServiceMinutes, 0) / bizServices.length
        );
      }

      return {
        ...biz,
        id: biz._id,
        activeCounters: totalActiveCounters || 3,
        totalCounters: totalCounters || 5,
        currentQueueLength: totalQueueLength,
        avgServiceTimeMins: avgTime,
        departments: bizServices.map((s) => {
          const q = bizQueues.find((item) => item.service.toString() === s._id.toString());
          return {
            id: s._id,
            queueId: q?._id,
            name: s.name,
            prefix: s.prefix,
            avgTime: s.averageServiceMinutes,
            queueLength: q ? waitingMap[q._id.toString()] || 0 : 0,
            activeCounters: q?.activeCounters || 1,
          };
        }),
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedBusinesses.length,
      data: enrichedBusinesses,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single business by ID
 * GET /api/businesses/:id
 */
export async function getBusinessById(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    const services = await Service.find({ business: business._id, isActive: true });
    const queues = await Queue.find({ business: business._id }).populate('service');

    res.status(200).json({
      success: true,
      data: {
        ...business.toObject(),
        services,
        queues,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new business (admin/staff)
 * POST /api/businesses
 */
export async function createBusiness(req, res, next) {
  try {
    const businessData = {
      ...req.body,
      owner: req.user?._id,
    };
    const business = await Business.create(businessData);
    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update business details
 * PATCH /api/businesses/:id
 */
export async function updateBusiness(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }
    res.status(200).json({
      success: true,
      data: business,
    });
  } catch (error) {
    next(error);
  }
}
