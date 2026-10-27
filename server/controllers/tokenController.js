import mongoose from 'mongoose';
import Token from '../models/Token.js';
import { updateTokenStatus, pushBackToken, reviewPriorityToken } from '../services/queueService.js';

function findTokenQuery(idOrNumber) {
  if (!idOrNumber) return { _id: new mongoose.Types.ObjectId() };
  const trimmed = String(idOrNumber).trim();
  const conditions = [{ tokenNumber: trimmed.toUpperCase() }];

  if (mongoose.Types.ObjectId.isValid(trimmed) && trimmed.length === 24) {
    conditions.push({ _id: trimmed });
  }
  if (trimmed.length === 32 && /^[0-9a-fA-F]+$/.test(trimmed)) {
    conditions.push({ qrTokenHash: trimmed });
  }
  return conditions.length > 1 ? { $or: conditions } : conditions[0];
}

/**
 * Get tokens for current authenticated user
 * GET /api/tokens/my
 */
export async function getMyTokens(req, res, next) {
  try {
    const conditions = [];

    if (req.user) {
      conditions.push({ user: req.user._id });
    }
    if (req.query.phone) {
      conditions.push({ phone: req.query.phone });
    }
    if (req.query.tokenIds) {
      const rawIds = req.query.tokenIds.split(',').map((s) => s.trim()).filter(Boolean);
      const validObjectIds = rawIds.filter((id) => mongoose.Types.ObjectId.isValid(id) && id.length === 24);
      if (validObjectIds.length > 0) {
        conditions.push({ _id: { $in: validObjectIds } });
      }
      if (rawIds.length > 0) {
        conditions.push({ tokenNumber: { $in: rawIds.map((r) => r.toUpperCase()) } });
      }
    }

    if (conditions.length === 0) {
      // If no auth, phone, or tokenIds, return empty list
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const filter = conditions.length === 1 ? conditions[0] : { $or: conditions };

    const tokens = await Token.find(filter)
      .sort({ joinedAt: -1 })
      .populate('business', 'name category address city image')
      .populate('service', 'name prefix averageServiceMinutes')
      .populate('queue', 'name activeCounters');

    res.status(200).json({
      success: true,
      count: tokens.length,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all tokens for a business (for staff/admin dashboard)
 * GET /api/tokens/business/:businessId
 */
export async function getBusinessTokens(req, res, next) {
  try {
    const { businessId } = req.params;
    const tokens = await Token.find({ business: businessId })
      .sort({ joinedAt: -1 })
      .limit(100)
      .populate('service', 'name prefix averageServiceMinutes')
      .populate('queue', 'name activeCounters');

    res.status(200).json({
      success: true,
      count: tokens.length,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public-facing Token Details Endpoint (For QR Code Scans from Mobile Cameras)
 * GET /api/tokens/:tokenId/public
 * Supports lookup by Token Number, MongoDB _id, or QR Token Hash
 */
export async function getPublicToken(req, res, next) {
  try {
    const rawId = req.params.tokenId;
    const queryHash = req.query.hash;

    if (!rawId || !rawId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid Token ID or QR reference is required.',
      });
    }

    const trimmed = rawId.trim();
    const conditions = [];

    // Check if query is 32-char hex hash
    if (trimmed.length === 32 && /^[0-9a-fA-F]+$/.test(trimmed)) {
      conditions.push({ qrTokenHash: trimmed });
    }
    if (queryHash && queryHash.trim().length === 32 && /^[0-9a-fA-F]+$/.test(queryHash.trim())) {
      conditions.push({ qrTokenHash: queryHash.trim() });
    }

    // Check token number (uppercase)
    const upperToken = trimmed.toUpperCase();
    conditions.push({ tokenNumber: upperToken });

    // Check valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      conditions.push({ _id: trimmed });
    }

    // Compound format handling e.g. QL-OPD-101-RAHUL
    if (upperToken.includes('-')) {
      const parts = upperToken.split('-');
      if (parts.length >= 3 && parts[0] === 'QL') {
        conditions.push({ tokenNumber: `${parts[0]}-${parts[1]}-${parts[2]}` });
      }
    }

    const query = conditions.length > 1 ? { $or: conditions } : conditions[0];

    const token = await Token.findOne(query)
      .populate('business', 'name category city address image')
      .populate('service', 'name prefix averageServiceMinutes')
      .populate('queue', 'name activeCounters currentServingToken');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found in database. Please ensure you have scanned an authentic QueueLess pass.',
      });
    }

    // Mask customer name for privacy (e.g. "Rahul Sharma" -> "R*** S***")
    const maskName = (name) => {
      if (!name) return 'Customer';
      return name
        .split(' ')
        .map((part) => {
          if (part.length <= 1) return part;
          return part[0] + '*'.repeat(Math.min(part.length - 1, 3));
        })
        .join(' ');
    };

    // Construct clear, user-friendly next-step guidance
    let nextStepMessage = 'Please wait nearby. Your token will be called to the counter soon.';
    switch (token.status) {
      case 'waiting':
        nextStepMessage = 'You are in queue. Watch the live display or keep this page open for your turn.';
        break;
      case 'calling':
        nextStepMessage = 'Your token is being called! Please proceed to the service desk immediately.';
        break;
      case 'serving':
        nextStepMessage = 'You are currently being attended to at the service desk.';
        break;
      case 'completed':
        nextStepMessage = 'Your service has been completed. Thank you for using QueueLess.';
        break;
      case 'cancelled':
        nextStepMessage = 'This booking was cancelled and is no longer active.';
        break;
      case 'skipped':
        nextStepMessage = 'This token was skipped due to a counter no-show.';
        break;
      default:
        nextStepMessage = 'Status update pending.';
    }

    const isPriorityVerified = Boolean(
      token.isPriority && (token.priorityStatus === 'verified' || !token.priorityStatus)
    );

    return res.status(200).json({
      success: true,
      data: {
        tokenId: token._id,
        tokenNumber: token.tokenNumber,
        bookingRef: token.tokenNumber,
        status: token.status,
        customerName: maskName(token.customerName),
        venueName: token.business?.name || 'Assigned Venue',
        venueCategory: token.business?.category || 'General',
        venueCity: token.business?.city || '',
        venueAddress: token.business?.address || '',
        serviceName: token.service?.name || 'General Desk',
        servicePrefix: token.service?.prefix || 'GEN',
        position: token.position,
        peopleAhead: token.peopleAhead ?? 0,
        estimatedWaitMinutes: token.estimatedWaitMinutes ?? 0,
        isPriority: isPriorityVerified,
        priorityStatus: token.priorityStatus || (token.isPriority ? 'verified' : 'none'),
        priorityReason: token.isPriority ? token.priorityReason : '',
        joinedAt: token.joinedAt,
        calledAt: token.calledAt,
        completedAt: token.completedAt,
        qrTokenHash: token.qrTokenHash,
        qrCodeData: token.qrCodeData,
        nextStepMessage,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get token by ID
 * GET /api/tokens/:tokenId
 */
export async function getTokenById(req, res, next) {
  try {
    const token = await Token.findOne(findTokenQuery(req.params.tokenId))
      .populate('business')
      .populate('service')
      .populate('queue');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    res.status(200).json({
      success: true,
      data: token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel a token
 * PATCH /api/tokens/:tokenId/cancel
 */
export async function cancelToken(req, res, next) {
  try {
    const token = await Token.findOne(findTokenQuery(req.params.tokenId));
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    // Authorization check: Customer can only cancel their own token; Staff/Admin can cancel any
    if (
      req.user &&
      req.user.role === 'customer' &&
      token.user &&
      token.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this token.',
      });
    }

    const updated = await updateTokenStatus(token._id, 'cancelled');
    res.status(200).json({
      success: true,
      message: 'Token cancelled successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Push back token in queue (+10 mins)
 * PATCH /api/tokens/:tokenId/pushback
 */
export async function pushBack(req, res, next) {
  try {
    const { delayMins = 10 } = req.body;
    const updated = await pushBackToken(req.params.tokenId, Number(delayMins));
    res.status(200).json({
      success: true,
      message: `Token position moved back by ~${delayMins} minutes.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update token status (Staff/Admin endpoint)
 * PATCH /api/tokens/:tokenId/status
 */
export async function changeTokenStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'New status is required',
      });
    }

    const updated = await updateTokenStatus(req.params.tokenId, status);
    res.status(200).json({
      success: true,
      message: `Token status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * QR Code Verification Endpoint (Staff QR Scanner)
 * POST /api/tokens/verify-qr
 */
export async function verifyTokenQR(req, res, next) {
  try {
    const { qrData, hash, tokenNumber } = req.body;

    let searchHash = hash;
    let searchTokenNumber = tokenNumber;

    // Parse payload if provided as raw JSON string from QR scanner
    if (qrData && typeof qrData === 'string') {
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.hash) searchHash = parsed.hash;
        if (parsed.tokenId) searchTokenNumber = parsed.tokenId;
      } catch {
        // Raw string might be a hash or token number
        if (qrData.length === 32) searchHash = qrData;
        else searchTokenNumber = qrData;
      }
    }

    if (!searchHash && !searchTokenNumber) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'QR Verification hash or Token ID is required',
      });
    }

    const query = {};
    if (searchHash) query.qrTokenHash = searchHash;
    else if (searchTokenNumber) query.tokenNumber = searchTokenNumber;

    const token = await Token.findOne(query)
      .populate('business', 'name category city address')
      .populate('service', 'name prefix averageServiceMinutes')
      .populate('queue', 'name activeCounters');

    if (!token) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Invalid or counterfeit token: record not found in database.',
      });
    }

    // Check token state validity
    const isEligibleForService = token.status === 'waiting' || token.status === 'calling';
    const isCurrentlyServing = token.status === 'serving';

    let verificationMessage = 'Token verified successfully and eligible for service.';
    if (token.status === 'completed') {
      verificationMessage = 'Token was already completed.';
    } else if (token.status === 'cancelled') {
      verificationMessage = 'Token was cancelled.';
    }

    res.status(200).json({
      success: true,
      verified: true,
      isEligible: isEligibleForService || isCurrentlyServing,
      message: verificationMessage,
      data: {
        tokenId: token._id,
        tokenNumber: token.tokenNumber,
        customerName: token.customerName,
        phone: token.phone,
        partySize: token.partySize,
        isPriority: token.isPriority,
        priorityReason: token.priorityReason,
        status: token.status,
        venueName: token.business?.name,
        departmentName: token.service?.name,
        joinedAt: token.joinedAt,
        calledAt: token.calledAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Review priority verification request (Staff / Admin)
 * PATCH /api/tokens/:tokenId/priority
 */
export async function reviewPriority(req, res, next) {
  try {
    const { action, reason } = req.body;
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject".',
      });
    }

    const reviewed = await reviewPriorityToken(req.params.tokenId, {
      action,
      reason,
      reviewedBy: req.user?._id,
    });

    res.status(200).json({
      success: true,
      message: `Priority request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      data: reviewed,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get pending and verified priority requests for a business
 * GET /api/tokens/priority/requests?businessId=...
 */
export async function getPriorityRequests(req, res, next) {
  try {
    const { businessId } = req.query;
    const filter = {
      $or: [
        { isPriority: true },
        { priorityStatus: { $in: ['pending', 'verified', 'rejected'] } },
      ],
    };
    if (businessId && mongoose.Types.ObjectId.isValid(businessId)) {
      filter.business = new mongoose.Types.ObjectId(businessId);
    }

    const requests = await Token.find(filter)
      .populate('business', 'name category')
      .populate('service', 'name prefix')
      .populate('priorityReviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}

