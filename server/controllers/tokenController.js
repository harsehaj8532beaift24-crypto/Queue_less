import Token from '../models/Token.js';
import { updateTokenStatus, pushBackToken } from '../services/queueService.js';

/**
 * Get tokens for current authenticated user
 * GET /api/tokens/my
 */
export async function getMyTokens(req, res, next) {
  try {
    const filter = {};
    if (req.user) {
      filter.user = req.user._id;
    } else if (req.query.phone) {
      filter.phone = req.query.phone;
    } else {
      // If no auth and no phone, return empty list
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

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
 * Get token by ID
 * GET /api/tokens/:tokenId
 */
export async function getTokenById(req, res, next) {
  try {
    const token = await Token.findById(req.params.tokenId)
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
    const token = await Token.findById(req.params.tokenId);
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
