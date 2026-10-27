import crypto from 'crypto';
import mongoose from 'mongoose';
import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import Service from '../models/Service.js';
import Business from '../models/Business.js';
import Notification from '../models/Notification.js';
import ServiceHistory from '../models/ServiceHistory.js';
import { calculateWaitTimePrediction } from './predictionService.js';
import {
  broadcastQueueUpdate,
  broadcastBusinessUpdate,
  sendUserNotification,
  broadcastTokenAlert,
  broadcastTokenUpdate,
  broadcastTokensBatchUpdate,
} from './socketService.js';
import { buildTokenUrl } from '../utils/urlHelper.js';

/**
 * Concurrency-Safe Atomic Queue Booking & Lifecycle Manager
 */

/**
 * Atomic token allocation
 */
export async function bookToken({
  queueId,
  customerName,
  phone = '',
  partySize = 1,
  isPriority = false,
  priorityReason = '',
  priorityCategory = 'Regular',
  priorityStatus = null,
  userId = null,
}) {
  // 1. Concurrency-Safe: Atomically increment queue tokenSequence
  const queue = await Queue.findOneAndUpdate(
    { _id: queueId, status: 'active' },
    { $inc: { tokenSequence: 1 } },
    { new: true }
  ).populate('service business');

  if (!queue) {
    throw new Error('Queue is either closed, paused, or does not exist.');
  }

  const service = queue.service;
  const business = queue.business;
  const seqNum = queue.tokenSequence;
  const tokenNumber = `QL-${service.prefix || 'TOK'}-${seqNum}`;

  // 2. Count current waiting tokens in this queue
  const currentWaitingCount = await Token.countDocuments({
    queue: queueId,
    status: { $in: ['waiting', 'calling'] },
  });

  // Priority verification status resolution:
  // If explicitly passed (e.g. from staff desk booking), use it.
  // Otherwise, if customer requested priority, mark as 'pending' for staff review.
  const resolvedPriorityStatus = priorityStatus || (isPriority ? 'pending' : 'none');
  const isPriorityVerified = resolvedPriorityStatus === 'verified';
  const priorityApprovedAt = isPriorityVerified ? new Date() : null;

  // 3. AI prediction for initial waiting time
  const prediction = await calculateWaitTimePrediction({
    businessId: business._id,
    serviceId: service._id,
    peopleAhead: currentWaitingCount,
    activeCounters: queue.activeCounters,
    defaultServiceMinutes: service.averageServiceMinutes,
    peakMultiplier: queue.peakMultiplier,
    isPriority: isPriorityVerified,
    partySize,
  });

  // 4. Generate unique cryptographic verification hash & QR payload
  const qrTokenHash = crypto.randomBytes(16).toString('hex');
  const qrCodeData = buildTokenUrl(tokenNumber, qrTokenHash);

  // 5. Persist Token record
  const token = await Token.create({
    tokenNumber,
    sequenceNumber: seqNum,
    queue: queue._id,
    business: business._id,
    service: service._id,
    user: userId,
    customerName,
    phone,
    partySize,
    isPriority: isPriorityVerified,
    priorityReason: isPriority ? priorityReason : '',
    priorityCategory: isPriority ? (priorityCategory || priorityReason || 'Priority') : 'Regular',
    priorityStatus: resolvedPriorityStatus,
    priorityApprovedAt,
    status: 'waiting',
    position: currentWaitingCount + 1,
    peopleAhead: currentWaitingCount,
    estimatedWaitMinutes: prediction.estimatedMins,
    qrCodeData,
    qrTokenHash,
    joinedAt: new Date(),
  });

  // 6. Generate Notification record
  if (userId) {
    const notif = await Notification.create({
      user: userId,
      token: token._id,
      business: business._id,
      type: 'TOKEN_CREATED',
      title: 'Token Generated!',
      message: `Token ${tokenNumber} booked for ${business.name} (${service.name}). Position #${currentWaitingCount + 1}.`,
    });
    sendUserNotification(userId.toString(), notif);
  }

  // 7. Real-time updates
  await reindexQueuePositions(queueId);
  broadcastTokenUpdate(token);

  return token;
}

/**
 * Re-indexes positions and estimated wait times for all waiting tokens in a queue
 * Implements fair priority queue scheduling:
 * 1. Tokens currently 'calling' at counter remain at front
 * 2. Verified priority tokens ('verified') are served in order of arrival
 * 3. Regular and unverified pending tokens are served in order of arrival
 */
export async function reindexQueuePositions(queueId) {
  const queue = await Queue.findById(queueId).populate('service business');
  if (!queue) return;

  const callingTokens = await Token.find({
    queue: queueId,
    status: 'calling',
  }).sort({ calledAt: 1, joinedAt: 1 });

  const verifiedPriorityTokens = await Token.find({
    queue: queueId,
    status: 'waiting',
    isPriority: true,
    priorityStatus: 'verified',
  }).sort({ joinedAt: 1 });

  const regularWaitingTokens = await Token.find({
    queue: queueId,
    status: 'waiting',
    $or: [
      { isPriority: false },
      { priorityStatus: { $ne: 'verified' } },
    ],
  }).sort({ joinedAt: 1 });

  const activeTokens = [...callingTokens, ...verifiedPriorityTokens, ...regularWaitingTokens];

  for (let index = 0; index < activeTokens.length; index++) {
    const t = activeTokens[index];
    const peopleAhead = index;
    const position = index + 1;

    const prediction = await calculateWaitTimePrediction({
      businessId: queue.business._id,
      serviceId: queue.service._id,
      peopleAhead,
      activeCounters: queue.activeCounters,
      defaultServiceMinutes: queue.service.averageServiceMinutes,
      peakMultiplier: queue.peakMultiplier,
      isPriority: Boolean(t.isPriority && t.priorityStatus === 'verified'),
      partySize: t.partySize,
    });

    t.peopleAhead = peopleAhead;
    t.position = position;
    t.estimatedWaitMinutes = prediction.estimatedMins;
    await t.save();
  }

  const queueData = {
    queueId: queue._id,
    activeCounters: queue.activeCounters,
    totalWaiting: activeTokens.length,
    currentServing: queue.currentServingToken,
    updatedAt: new Date(),
  };

  broadcastQueueUpdate(queueId.toString(), queueData);
  broadcastBusinessUpdate(queue.business._id.toString(), queueData);
  broadcastTokensBatchUpdate(activeTokens);
}

/**
 * Call next token in queue with priority scheduling
 */
export async function callNextToken(queueId) {
  const queue = await Queue.findById(queueId).populate('business service');
  if (!queue) throw new Error('Queue not found');

  // 1. Call verified priority token first
  let nextToken = await Token.findOne({
    queue: queueId,
    status: 'waiting',
    isPriority: true,
    priorityStatus: 'verified',
  }).sort({ joinedAt: 1 });

  // 2. Otherwise call earliest regular waiting token
  if (!nextToken) {
    nextToken = await Token.findOne({
      queue: queueId,
      status: 'waiting',
    }).sort({ joinedAt: 1 });
  }

  if (!nextToken) {
    throw new Error('No waiting tokens in queue');
  }

  nextToken.status = 'calling';
  nextToken.calledAt = new Date();
  await nextToken.save();

  queue.currentServingToken = nextToken._id;
  await queue.save();

  // Create & emit calling notification
  const title = 'Your Turn Now';
  const message = `Token ${nextToken.tokenNumber} is now called! Please proceed to the service counter immediately.`;

  if (nextToken.user) {
    const notif = await Notification.create({
      user: nextToken.user,
      token: nextToken._id,
      business: queue.business._id,
      type: 'CALLING_NOW',
      title,
      message,
    });
    sendUserNotification(nextToken.user.toString(), notif);
  }

  broadcastTokenAlert(nextToken._id.toString(), {
    tokenId: nextToken._id,
    tokenNumber: nextToken.tokenNumber,
    status: 'calling',
    title,
    message,
  });

  await reindexQueuePositions(queueId);
  broadcastTokenUpdate(nextToken);
  return nextToken;
}

/**
 * Update token status with valid state transitions & analytics logging
 */
export async function updateTokenStatus(tokenId, newStatus) {
  const query = mongoose.Types.ObjectId.isValid(tokenId)
    ? { _id: tokenId }
    : { tokenNumber: tokenId };
  const token = await Token.findOne(query).populate('queue business service');
  if (!token) throw new Error('Token not found');

  const validTransitions = {
    waiting: ['calling', 'serving', 'cancelled', 'skipped'],
    calling: ['serving', 'cancelled', 'completed', 'skipped'],
    serving: ['completed', 'cancelled', 'skipped'],
    skipped: ['waiting', 'calling', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[token.status].includes(newStatus)) {
    throw new Error(
      `Invalid token state transition from "${token.status}" to "${newStatus}"`
    );
  }

  const now = new Date();
  token.status = newStatus;

  if (newStatus === 'skipped') {
    token.skippedAt = now;
  } else if (newStatus === 'serving') {
    token.serviceStartedAt = now;
  } else if (newStatus === 'completed') {
    token.completedAt = now;

    // Calculate actual wait duration and service duration
    const waitDurationMins = Math.max(
      1,
      Math.round(((token.serviceStartedAt || now) - token.joinedAt) / 60000)
    );
    const serviceDurationMins = Math.max(
      1,
      Math.round((now - (token.serviceStartedAt || token.calledAt || now)) / 60000)
    );

    // Save to ServiceHistory collection for analytics & ML prediction
    await ServiceHistory.create({
      token: token._id,
      business: token.business._id,
      service: token.service._id,
      queue: token.queue._id,
      tokenNumber: token.tokenNumber,
      customerName: token.customerName,
      waitDurationMins,
      serviceDurationMins,
      date: now,
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      status: 'completed',
    });

    if (token.user) {
      const notif = await Notification.create({
        user: token.user,
        token: token._id,
        business: token.business._id,
        type: 'TOKEN_COMPLETED',
        title: 'Service Completed',
        message: `Your service for Token ${token.tokenNumber} is marked completed. Thank you for using QueueLess!`,
      });
      sendUserNotification(token.user.toString(), notif);
    }
  } else if (newStatus === 'cancelled') {
    token.cancelledAt = now;

    if (token.user) {
      const notif = await Notification.create({
        user: token.user,
        token: token._id,
        business: token.business._id,
        type: 'TOKEN_CANCELLED',
        title: 'Token Cancelled',
        message: `Token ${token.tokenNumber} has been cancelled.`,
      });
      sendUserNotification(token.user.toString(), notif);
    }
  }

  await token.save();
  await reindexQueuePositions(token.queue._id);

  broadcastTokenAlert(token._id.toString(), {
    tokenId: token._id,
    tokenNumber: token.tokenNumber,
    status: newStatus,
  });
  broadcastTokenUpdate(token);

  return token;
}

/**
 * Push back token in queue (e.g. +10 mins delay requested by user)
 */
export async function pushBackToken(tokenId, minutesDelay = 10) {
  const query = mongoose.Types.ObjectId.isValid(tokenId)
    ? { _id: tokenId }
    : { tokenNumber: tokenId };
  const token = await Token.findOne(query);
  if (!token) throw new Error('Token not found');
  if (token.status !== 'waiting') throw new Error('Only waiting tokens can be pushed back');

  // Push joinedAt forward in time so other customers advance ahead
  token.joinedAt = new Date(token.joinedAt.getTime() + minutesDelay * 60000);
  await token.save();

  await reindexQueuePositions(token.queue);
  broadcastTokenUpdate(token);
  return token;
}

/**
 * Review priority verification request (Approve or Reject with reason)
 */
export async function reviewPriorityToken(tokenId, { action, reason = '', reviewedBy = null }) {
  const query = mongoose.Types.ObjectId.isValid(tokenId)
    ? { _id: tokenId }
    : { tokenNumber: tokenId };
  const token = await Token.findOne(query).populate('queue business service user');
  if (!token) throw new Error('Token not found');

  if (action === 'approve') {
    token.priorityStatus = 'verified';
    token.isPriority = true;
    token.priorityApprovedAt = new Date();
    token.priorityReviewedBy = reviewedBy;
    token.priorityReviewNote = reason || 'Priority verified by staff desk';
  } else if (action === 'reject') {
    token.priorityStatus = 'rejected';
    token.isPriority = false;
    token.priorityReviewedBy = reviewedBy;
    token.priorityReviewNote = reason || 'Documentation verification declined';
  } else {
    throw new Error('Invalid priority review action. Must be "approve" or "reject"');
  }

  await token.save();

  // Create notification if associated with user
  if (token.user) {
    const notif = await Notification.create({
      user: token.user._id || token.user,
      token: token._id,
      business: token.business._id || token.business,
      type: action === 'approve' ? 'PRIORITY_APPROVED' : 'PRIORITY_REJECTED',
      title: action === 'approve' ? 'Priority Queue Approved' : 'Priority Request Declined',
      message: action === 'approve'
        ? `Your priority request for Token ${token.tokenNumber} has been approved. You have been advanced in the queue.`
        : `Your priority request for Token ${token.tokenNumber} was declined (${token.priorityReviewNote}). You remain in the regular queue.`,
    });
    sendUserNotification(token.user._id ? token.user._id.toString() : token.user.toString(), notif);
  }

  // Re-index queue positions with updated priority order
  if (token.queue) {
    await reindexQueuePositions(token.queue._id || token.queue);
  }

  broadcastTokenAlert(token._id.toString(), {
    tokenId: token._id,
    tokenNumber: token.tokenNumber,
    isPriority: token.isPriority,
    priorityStatus: token.priorityStatus,
    status: token.status,
  });
  broadcastTokenUpdate(token);

  return token;
}

