import ServiceHistory from '../models/ServiceHistory.js';

/**
 * AI-Assisted Queue Waiting Time Prediction Engine
 * Computes dynamic wait times using real historical durations from MongoDB,
 * current queue velocity, counter capacity, and time-of-day multipliers.
 */
export async function calculateWaitTimePrediction({
  businessId,
  serviceId,
  peopleAhead = 0,
  activeCounters = 1,
  defaultServiceMinutes = 10,
  peakMultiplier = 1.0,
  isPriority = false,
  partySize = 1,
}) {
  if (peopleAhead <= 0) {
    return {
      estimatedMins: 0,
      confidenceScore: 99,
      queueVelocity: 'High',
      recommendation: 'Your turn is next! Please proceed directly to the service counter.',
      isDataDriven: true,
      sampleSize: 0,
    };
  }

  const safeCounters = Math.max(1, activeCounters);

  // 1. Data-driven step: Query actual recent service durations from MongoDB
  let actualAvgMins = defaultServiceMinutes;
  let sampleSize = 0;
  let isDataDriven = false;

  try {
    if (businessId && serviceId) {
      const recentHistories = await ServiceHistory.find({
        business: businessId,
        service: serviceId,
        status: 'completed',
        serviceDurationMins: { $gt: 0, $lt: 120 }, // Filter outliers
      })
        .sort({ date: -1 })
        .limit(25)
        .lean();

      if (recentHistories && recentHistories.length >= 3) {
        const totalDuration = recentHistories.reduce(
          (sum, h) => sum + h.serviceDurationMins,
          0
        );
        actualAvgMins = Math.round((totalDuration / recentHistories.length) * 10) / 10;
        sampleSize = recentHistories.length;
        isDataDriven = true;
      }
    }
  } catch (err) {
    console.warn('[PredictionEngine] Using fallback default duration:', err.message);
  }

  // 2. Base duration calculation
  let rawWaitTime = (peopleAhead * actualAvgMins) / safeCounters;

  // 3. Multi-person party adjustment (each extra member adds +25% service time)
  if (partySize > 1) {
    rawWaitTime *= 1 + (partySize - 1) * 0.25;
  }

  // 4. Peak multiplier
  rawWaitTime *= peakMultiplier;

  // 5. Priority queue adjustment (e.g. senior citizen / medical emergency)
  if (isPriority) {
    rawWaitTime *= 0.65;
  }

  const estimatedMins = Math.max(1, Math.round(rawWaitTime));

  // 6. Confidence metric calculation (scales with sample size and counter stability)
  let confidenceScore = isDataDriven
    ? Math.min(96, 85 + sampleSize * 0.4)
    : Math.min(84, Math.max(68, 80 - peopleAhead * 0.8 + safeCounters * 1.5));
  confidenceScore = Math.round(confidenceScore);

  // 7. Velocity rating
  let queueVelocity = 'Moderate';
  const minsPerPerson = estimatedMins / Math.max(1, peopleAhead);
  if (minsPerPerson < 3.5) {
    queueVelocity = 'Fast';
  } else if (minsPerPerson > 8.0) {
    queueVelocity = 'Slow';
  }

  // 8. Smart arrival recommendation
  let recommendation = '';
  if (estimatedMins > 25) {
    recommendation = `Optimal arrival: Arrive in ~${estimatedMins - 10} mins. Feel free to wait comfortably nearby.`;
  } else if (estimatedMins > 10) {
    recommendation = `Estimated arrival window: Head toward the venue lobby in ~${estimatedMins - 5} mins.`;
  } else {
    recommendation = 'Please remain inside or near the service area. Turn coming up very shortly!';
  }

  return {
    estimatedMins,
    confidenceScore,
    queueVelocity,
    recommendation,
    avgServiceTimeUsed: actualAvgMins,
    isDataDriven,
    sampleSize,
  };
}
