/**
 * QueueLess AI Waiting Time Predictor & Queue Analytics Engine
 * Predicts queue waiting times using dynamic velocity metrics, active counter status,
 * historical peak multipliers, and special priority bonuses.
 */

export function predictWaitTime({
  peopleAhead = 0,
  activeCounters = 1,
  avgServiceTimeMins = 10,
  peakMultiplier = 1.0,
  isPriority = false,
  partySize = 1,
}) {
  if (peopleAhead <= 0) {
    return {
      estimatedMins: 0,
      confidenceScore: 99,
      queueVelocity: 'High',
      recommendation: 'Your turn is next! Please proceed to the service counter now.',
    };
  }

  // Ensure active counters is at least 1 to avoid division by zero
  const safeCounters = Math.max(1, activeCounters);

  // Base raw calculation
  let rawTime = (peopleAhead * avgServiceTimeMins) / safeCounters;

  // Party size adjustment (each additional person adds +30% time)
  if (partySize > 1) {
    rawTime *= 1 + (partySize - 1) * 0.25;
  }

  // Peak hour crowd multiplier
  rawTime *= peakMultiplier;

  // Senior / Emergency Priority Bonus (cuts effective waiting time estimate)
  if (isPriority) {
    rawTime *= 0.65;
  }

  const finalMins = Math.max(1, Math.round(rawTime));

  // AI Confidence metric calculation (based on sample size & counters)
  const confidenceScore = Math.min(98, Math.max(78, 95 - peopleAhead * 1.2 + safeCounters * 2));

  // Velocity rating
  let queueVelocity = 'Moderate';
  if (finalMins / Math.max(1, peopleAhead) < 3) {
    queueVelocity = 'Fast';
  } else if (finalMins / Math.max(1, peopleAhead) > 7) {
    queueVelocity = 'Slow';
  }

  // AI smart arrival tip
  let recommendation = '';
  if (finalMins > 20) {
    recommendation = `Optimal arrival time: Arrive in ${finalMins - 7} mins. Feel free to wait comfortably nearby.`;
  } else if (finalMins > 10) {
    recommendation = `Estimated arrival window: Proceed towards venue in ${finalMins - 4} mins.`;
  } else {
    recommendation = 'Please remain near the waiting lobby area. Turn coming up very soon!';
  }

  return {
    estimatedMins: finalMins,
    confidenceScore: Math.round(confidenceScore),
    queueVelocity,
    recommendation,
  };
}

/**
 * Generates dynamic hourly traffic distribution data for analytics charts
 */
export function generateHourlyTraffic(venueId) {
  const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM'];
  
  // Seed random variation based on venue
  const baseLoad = venueId === 'v1' ? [12, 25, 45, 62, 50, 30, 28, 48, 55, 38, 20, 10]
                : venueId === 'v2' ? [5, 18, 52, 78, 65, 40, 58, 60, 25, 10, 0, 0]
                : [10, 15, 30, 42, 38, 45, 50, 52, 65, 70, 40, 20];

  return hours.map((hour, index) => ({
    hour,
    count: baseLoad[index],
    isPeak: baseLoad[index] > 50,
  }));
}

/**
 * Calculates business KPI metrics
 */
export function calculateBusinessMetrics(venue, tokens = []) {
  const venueTokens = tokens.filter(t => t.venueId === venue.id);
  const completedTokens = venueTokens.filter(t => t.status === 'COMPLETED');
  const waitingTokens = venueTokens.filter(t => t.status === 'WAITING' || t.status === 'CALLING');
  
  const avgWaitTime = completedTokens.length > 0
    ? Math.round(completedTokens.reduce((acc, curr) => acc + (curr.estimatedWaitMins || 10), 0) / completedTokens.length)
    : venue.avgServiceTimeMins;

  const efficiencyScore = Math.min(99, Math.round(85 + (venue.activeCounters / venue.totalCounters) * 12));

  return {
    totalServed: venue.todayServed + completedTokens.length,
    currentWaiting: venue.currentQueueLength + waitingTokens.length,
    avgWaitMins: avgWaitTime,
    efficiencyScore,
    activeCounters: venue.activeCounters,
    totalCounters: venue.totalCounters,
  };
}
