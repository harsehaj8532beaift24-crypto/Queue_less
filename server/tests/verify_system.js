import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { connectDB, closeDatabaseConnection } from '../config/db.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Service from '../models/Service.js';
import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import ServiceHistory from '../models/ServiceHistory.js';
import { bookToken, callNextToken, updateTokenStatus } from '../services/queueService.js';
import { calculateWaitTimePrediction } from '../services/predictionService.js';

dotenv.config();

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 Starting QueueLess Backend Automated Verification Test');
  console.log('======================================================\n');

  try {
    // 1. Database Connection Test
    console.log('Test 1: MongoDB Database Connection');
    await connectDB();
    assert(mongoose.connection.readyState === 1, 'MongoDB connection is open and active');

    // 2. Authentication & Security Test
    console.log('\nTest 2: Password Hashing & JWT Verification');
    const user = await User.findOne({ email: 'customer@queueless.com' }).select('+passwordHash');
    assert(Boolean(user), 'Customer demo account exists in database');
    assert(!user.passwordHash.startsWith('password'), 'Password is stored as a secure bcrypt hash');
    const isPasswordValid = await user.comparePassword('password123');
    assert(isPasswordValid === true, 'bcrypt compare verifies valid password correctly');
    const isPasswordInvalid = await user.comparePassword('wrongpassword');
    assert(isPasswordInvalid === false, 'bcrypt compare rejects invalid password');

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'queueless_secret_dev_key', { expiresIn: '1h' });
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || 'queueless_secret_dev_key');
    assert(decoded.email === 'customer@queueless.com', 'JWT encodes and verifies payload securely');

    // 3. Business & Service Discovery Test
    console.log('\nTest 3: Business & Service Models');
    const businesses = await Business.find({});
    assert(businesses.length >= 5, `Retrieved ${businesses.length} businesses from MongoDB`);
    const apolloHospital = await Business.findOne({ category: 'hospital' });
    assert(Boolean(apolloHospital), 'Apollo Hospital found with category "hospital"');

    const services = await Service.find({ business: apolloHospital._id });
    assert(services.length >= 4, `Found ${services.length} services for Apollo Hospital`);

    // 4. Queue Concurrency & Atomic Booking Test
    console.log('\nTest 4: Atomic Queue Booking & Concurrency Protection');
    const opdQueue = await Queue.findOne({ business: apolloHospital._id });
    assert(Boolean(opdQueue), `Found active queue: ${opdQueue.name}`);

    const initialSeq = opdQueue.tokenSequence;

    // Simulate 3 concurrent booking calls simultaneously
    const bookingPromises = [
      bookToken({ queueId: opdQueue._id, customerName: 'Concurrent User 1', partySize: 1 }),
      bookToken({ queueId: opdQueue._id, customerName: 'Concurrent User 2', partySize: 2 }),
      bookToken({ queueId: opdQueue._id, customerName: 'Concurrent User 3', isPriority: true }),
    ];

    const bookedTokens = await Promise.all(bookingPromises);
    assert(bookedTokens.length === 3, 'All 3 concurrent booking requests succeeded');

    const tokenNums = bookedTokens.map((t) => t.tokenNumber);
    const uniqueNums = new Set(tokenNums);
    assert(uniqueNums.size === 3, `All allocated token numbers are unique: ${tokenNums.join(', ')}`);

    const refreshedQueue = await Queue.findById(opdQueue._id);
    assert(refreshedQueue.tokenSequence === initialSeq + 3, 'Queue tokenSequence incremented atomically');

    // 5. Token State Transition Lifecycle Test
    console.log('\nTest 5: Token State Transition & Queue Advancement');
    const firstToken = bookedTokens[0];
    assert(firstToken.status === 'waiting', 'Initial token status is "waiting"');

    // Call Next Token
    const calledToken = await callNextToken(opdQueue._id);
    assert(calledToken.status === 'calling', 'Called token status transitioned to "calling"');
    assert(Boolean(calledToken.calledAt), 'calledAt timestamp is recorded');

    // Start Serving
    const servingToken = await updateTokenStatus(calledToken._id, 'serving');
    assert(servingToken.status === 'serving', 'Token status transitioned to "serving"');
    assert(Boolean(servingToken.serviceStartedAt), 'serviceStartedAt timestamp is recorded');

    // Complete Token & ServiceHistory Logging
    const completedToken = await updateTokenStatus(servingToken._id, 'completed');
    assert(completedToken.status === 'completed', 'Token status transitioned to "completed"');
    assert(Boolean(completedToken.completedAt), 'completedAt timestamp is recorded');

    const historyRecord = await ServiceHistory.findOne({ token: completedToken._id });
    assert(Boolean(historyRecord), 'ServiceHistory record successfully created for completed token');
    assert(historyRecord.serviceDurationMins >= 1, `Recorded serviceDurationMins: ${historyRecord.serviceDurationMins}`);

    // 6. QR Code Verification Test
    console.log('\nTest 6: QR Code Verification');
    const secondToken = bookedTokens[1];
    assert(Boolean(secondToken.qrTokenHash), 'Token has a secure cryptographic qrTokenHash');

    // Lookup with genuine hash
    const verifiedToken = await Token.findOne({ qrTokenHash: secondToken.qrTokenHash });
    assert(Boolean(verifiedToken), 'QR hash successfully resolves to genuine token in MongoDB');

    // Lookup with fake hash
    const fakeToken = await Token.findOne({ qrTokenHash: 'tampered_fake_qr_hash_xyz' });
    assert(fakeToken === null, 'Counterfeit QR hash is properly rejected');

    // 7. Data-Driven AI Waiting Time Prediction Test
    console.log('\nTest 7: AI Waiting Time Prediction Engine');
    const prediction = await calculateWaitTimePrediction({
      businessId: apolloHospital._id,
      serviceId: opdQueue.service,
      peopleAhead: 5,
      activeCounters: 2,
      defaultServiceMinutes: 10,
    });
    assert(prediction.estimatedMins > 0, `Estimated wait time calculated: ${prediction.estimatedMins} mins`);
    assert(prediction.confidenceScore >= 70, `Confidence score: ${prediction.confidenceScore}%`);
    assert(Boolean(prediction.recommendation), `Smart arrival tip: "${prediction.recommendation}"`);

    // 8. MongoDB Aggregation Analytics Test
    console.log('\nTest 8: Database Aggregation Analytics');
    const aggregatedHistory = await ServiceHistory.aggregate([
      { $match: { business: apolloHospital._id } },
      { $group: { _id: null, avgWait: { $avg: '$waitDurationMins' }, total: { $sum: 1 } } },
    ]);
    assert(aggregatedHistory.length > 0, 'MongoDB aggregation pipeline executed successfully');
    assert(aggregatedHistory[0].total > 0, `Aggregated ${aggregatedHistory[0].total} historical records`);

    console.log('\n======================================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    await closeDatabaseConnection();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test suite encountered unhandled error:', error);
    await closeDatabaseConnection();
    process.exit(1);
  }
}

runTestSuite();
