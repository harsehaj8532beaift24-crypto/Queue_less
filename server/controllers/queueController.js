import mongoose from 'mongoose';
import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import { bookToken, callNextToken, reindexQueuePositions } from '../services/queueService.js';

/**
 * Get queues
 * GET /api/queues
 */
export async function getQueues(req, res, next) {
  try {
    const filter = {};
    if (req.query.businessId) {
      filter.business = req.query.businessId;
    }
    const queues = await Queue.find(filter)
      .populate('business', 'name category city')
      .populate('service', 'name prefix averageServiceMinutes')
      .populate('currentServingToken');

    res.status(200).json({
      success: true,
      data: queues,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single queue status and active tokens
 * GET /api/queues/:queueId/status
 */
export async function getQueueStatus(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.queueId)) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }
    const queue = await Queue.findById(req.params.queueId)
      .populate('business')
      .populate('service')
      .populate('currentServingToken');

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    const waitingTokens = await Token.find({
      queue: queue._id,
      status: { $in: ['waiting', 'calling'] },
    }).sort({ joinedAt: 1 });

    const servingTokens = await Token.find({
      queue: queue._id,
      status: 'serving',
    });

    res.status(200).json({
      success: true,
      data: {
        queue,
        waitingCount: waitingTokens.length,
        waitingTokens,
        servingTokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Join a queue (Atomic booking)
 * POST /api/queues/:queueId/join
 */
export async function joinQueue(req, res, next) {
  try {
    const { queueId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }
    const {
      customerName,
      phone,
      partySize = 1,
      isPriority = false,
      priorityReason = '',
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required to book a token',
      });
    }

    const userId = req.user ? req.user._id : null;

    const token = await bookToken({
      queueId,
      customerName: customerName.trim(),
      phone: phone ? phone.trim() : '',
      partySize: Math.max(1, Number(partySize) || 1),
      isPriority: Boolean(isPriority),
      priorityReason,
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Token booked successfully',
      data: token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Call the next token in the queue (staff/admin)
 * POST /api/queues/:queueId/next
 */
export async function callNext(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.queueId)) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }
    const token = await callNextToken(req.params.queueId);
    res.status(200).json({
      success: true,
      message: `Token ${token.tokenNumber} is now calling!`,
      data: token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update queue active counters or status
 * PATCH /api/queues/:queueId/counters
 */
export async function updateQueueCounters(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.queueId)) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }
    const { activeCounters, status } = req.body;
    const updates = {};

    if (activeCounters !== undefined) {
      updates.activeCounters = Math.max(1, Number(activeCounters));
    }
    if (status) {
      updates.status = status;
    }

    const queue = await Queue.findByIdAndUpdate(req.params.queueId, updates, {
      new: true,
      runValidators: true,
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    await reindexQueuePositions(queue._id);

    res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    next(error);
  }
}
