import mongoose from 'mongoose';
import Token from '../models/Token.js';
import Business from '../models/Business.js';
import { updateTokenStatus } from '../services/queueService.js';

/**
 * QR Code Verification Endpoint (Staff In-App Camera Scanner & Manual Lookup)
 * POST /api/qr/verify
 * Accepts: { qrData, hash, tokenNumber, businessId }
 */
export async function verifyQR(req, res, next) {
  try {
    const { qrData, hash, tokenNumber, businessId } = req.body;

    let searchHash = hash ? hash.trim() : null;
    let searchTokenNumber = tokenNumber ? tokenNumber.trim() : null;

    // Parse payload if provided as raw URL, JSON string, or identifier from QR scanner
    if (qrData && typeof qrData === 'string') {
      const trimmed = qrData.trim();
      try {
        if (trimmed.includes('?') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          // Parse URL parameters (e.g. /verify-token?token=QL-OPD-101&hash=abc123)
          const dummyOrigin = 'http://localhost';
          const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `${dummyOrigin}/${trimmed}`);
          const urlToken = urlObj.searchParams.get('token');
          const urlHash = urlObj.searchParams.get('hash');
          if (urlHash) searchHash = urlHash.trim();
          if (urlToken) searchTokenNumber = urlToken.trim();
        } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const parsed = JSON.parse(trimmed);
          if (parsed.hash) searchHash = parsed.hash.trim();
          if (parsed.tokenId || parsed.tokenNumber) searchTokenNumber = (parsed.tokenId || parsed.tokenNumber).trim();
        } else if (trimmed.length === 32 && /^[0-9a-fA-F]+$/.test(trimmed)) {
          searchHash = trimmed;
        } else {
          searchTokenNumber = trimmed;
        }
      } catch {
        if (trimmed.length === 32) searchHash = trimmed;
        else searchTokenNumber = trimmed;
      }
    }

    if (!searchHash && !searchTokenNumber) {
      return res.status(400).json({
        success: false,
        verified: false,
        outcome: 'NOT_FOUND',
        message: 'A valid QR verification payload or Token ID is required.',
      });
    }

    // Build database query
    const query = {};
    if (searchHash) {
      query.qrTokenHash = searchHash;
    } else if (searchTokenNumber) {
      query.tokenNumber = searchTokenNumber.toUpperCase();
    }

    const token = await Token.findOne(query)
      .populate('business', 'name category city address')
      .populate('service', 'name prefix averageServiceMinutes')
      .populate('queue', 'name activeCounters currentServingToken');

    if (!token) {
      return res.status(404).json({
        success: false,
        verified: false,
        outcome: 'NOT_FOUND',
        message: 'Invalid or counterfeit token: no corresponding booking exists in the MongoDB database.',
      });
    }

    // Authorization Verification:
    // Ensure that staff member is authorized for the token's business
    const staffUser = req.user;
    const requestedBizId = businessId || (staffUser && staffUser.business);

    if (requestedBizId && staffUser && staffUser.role !== 'admin') {
      const tokenBizId = token.business?._id ? token.business._id.toString() : token.business.toString();
      if (tokenBizId !== requestedBizId.toString()) {
        return res.status(403).json({
          success: false,
          verified: false,
          outcome: 'UNAUTHORIZED',
          message: `Staff authorization mismatch: this token is issued for "${token.business?.name || 'another venue'}" and cannot be processed at your current counter.`,
          data: {
            tokenNumber: token.tokenNumber,
            venueName: token.business?.name,
            currentVenueRequired: requestedBizId,
          },
        });
      }
    }

    // Check token state validity and assign standard outcome
    let outcome = 'VALID_WAITING';
    let isEligible = false;
    let message = 'Token verified successfully and eligible for service.';

    switch (token.status) {
      case 'waiting':
        outcome = 'VALID_WAITING';
        isEligible = true;
        message = 'Token verified. Customer is in queue and eligible to be called or served.';
        break;
      case 'calling':
        outcome = 'VALID_CALLED';
        isEligible = true;
        message = 'Token has been called to the counter and is awaiting presentation.';
        break;
      case 'serving':
        outcome = 'VALID_CALLED';
        isEligible = true;
        message = 'Customer is currently marked as being served at the counter.';
        break;
      case 'completed':
        outcome = 'ALREADY_SERVED';
        isEligible = false;
        message = 'This token was already served and completed. Duplicate service is rejected.';
        break;
      case 'cancelled':
        outcome = 'CANCELLED';
        isEligible = false;
        message = 'This token was cancelled and is no longer active.';
        break;
      case 'skipped':
        outcome = 'SKIPPED';
        isEligible = false;
        message = 'This token was marked as skipped due to counter no-show.';
        break;
      default:
        outcome = 'NOT_FOUND';
        isEligible = false;
        message = `Unrecognized token status: ${token.status}`;
    }

    // Priority Queue Verification:
    // Determine priority authorization directly from database fields
    const priorityEligible = Boolean(token.isPriority && (token.priorityStatus === 'verified' || !token.priorityStatus));
    const priorityStatusDisplay = token.priorityStatus || (token.isPriority ? 'verified' : 'none');

    return res.status(200).json({
      success: true,
      verified: true,
      outcome,
      isEligible,
      message,
      data: {
        tokenId: token._id,
        tokenNumber: token.tokenNumber,
        customerName: token.customerName,
        phone: token.phone,
        partySize: token.partySize,
        isPriority: token.isPriority,
        priorityStatus: priorityStatusDisplay,
        priorityReason: token.priorityReason,
        priorityEligible,
        status: token.status,
        position: token.position,
        peopleAhead: token.peopleAhead,
        estimatedWaitMinutes: token.estimatedWaitMinutes,
        businessId: token.business?._id,
        venueName: token.business?.name,
        venueAddress: token.business?.address,
        serviceId: token.service?._id,
        serviceName: token.service?.name,
        queueId: token.queue?._id,
        joinedAt: token.joinedAt,
        calledAt: token.calledAt,
        serviceStartedAt: token.serviceStartedAt,
        completedAt: token.completedAt,
        skippedAt: token.skippedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Token View for mobile phone cameras scanning the QR code
 * GET /api/qr/view/:ref
 * Unauthenticated: returns sanitized, privacy-masked token details
 */
export async function publicViewToken(req, res, next) {
  try {
    const { ref } = req.params;
    if (!ref || !ref.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Token reference is required.',
      });
    }

    const trimmed = ref.trim();
    const query = trimmed.length === 32 && /^[0-9a-fA-F]+$/.test(trimmed)
      ? { qrTokenHash: trimmed }
      : { tokenNumber: trimmed.toUpperCase() };

    const token = await Token.findOne(query)
      .populate('business', 'name category city address')
      .populate('service', 'name prefix averageServiceMinutes')
      .populate('queue', 'name activeCounters');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found in database. Please ensure you have scanned a genuine QueueLess pass.',
      });
    }

    // Mask customer name for privacy (e.g. "Johnathan Doe" -> "J*** D**")
    const maskName = (name) => {
      if (!name) return 'Customer';
      return name.split(' ').map((part) => {
        if (part.length <= 1) return part;
        return part[0] + '*'.repeat(Math.min(part.length - 1, 3));
      }).join(' ');
    };

    // Mask phone number for privacy
    const maskPhone = (phone) => {
      if (!phone || phone.length < 4) return 'Protected';
      return '*'.repeat(Math.max(0, phone.length - 4)) + phone.slice(-4);
    };

    return res.status(200).json({
      success: true,
      data: {
        tokenNumber: token.tokenNumber,
        customerName: maskName(token.customerName),
        maskedPhone: maskPhone(token.phone),
        status: token.status,
        position: token.position,
        peopleAhead: token.peopleAhead,
        estimatedWaitMinutes: token.estimatedWaitMinutes,
        venueName: token.business?.name,
        venueCategory: token.business?.category,
        venueCity: token.business?.city,
        venueAddress: token.business?.address,
        serviceName: token.service?.name,
        isPriority: token.isPriority,
        priorityStatus: token.priorityStatus || (token.isPriority ? 'verified' : 'none'),
        joinedAt: token.joinedAt,
        calledAt: token.calledAt,
        completedAt: token.completedAt,
        skippedAt: token.skippedAt,
        qrTokenHash: token.qrTokenHash,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Execute Queue Action (Staff verified action after scan: call, serve, complete, skip)
 * POST /api/qr/action
 * Body: { tokenId, action, businessId }
 */
export async function executeQueueAction(req, res, next) {
  try {
    const { tokenId, action, businessId } = req.body;
    if (!tokenId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Token ID and action are required.',
      });
    }

    const query = mongoose.Types.ObjectId.isValid(tokenId)
      ? { _id: tokenId }
      : { tokenNumber: tokenId };

    const token = await Token.findOne(query);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found.',
      });
    }

    // Business authorization check
    if (businessId && token.business.toString() !== businessId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Token belongs to another business.',
      });
    }

    // Prevent duplicate serving
    if (token.status === 'completed' && (action === 'serve' || action === 'complete')) {
      return res.status(400).json({
        success: false,
        message: 'This token was already served and cannot be served again.',
      });
    }

    let targetStatus;
    switch (action) {
      case 'call':
        targetStatus = 'calling';
        break;
      case 'serve':
        targetStatus = 'serving';
        break;
      case 'complete':
        targetStatus = 'completed';
        break;
      case 'skip':
        targetStatus = 'skipped';
        break;
      case 'cancel':
        targetStatus = 'cancelled';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Invalid queue action requested: ${action}`,
        });
    }

    const updated = await updateTokenStatus(token._id, targetStatus);

    return res.status(200).json({
      success: true,
      message: `Token ${updated.tokenNumber} status updated to "${targetStatus}".`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
