import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDB, closeDatabaseConnection } from '../config/db.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Service from '../models/Service.js';
import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import Notification from '../models/Notification.js';
import ServiceHistory from '../models/ServiceHistory.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const INITIAL_VENUES_DATA = [
  {
    name: 'Apollo Health Supercenter',
    category: 'hospital',
    categoryName: 'Hospital',
    address: 'Sector 4, Central Avenue, Tech City',
    city: 'Tech City',
    rating: 4.8,
    reviewsCount: 342,
    openHours: '08:00 AM - 08:00 PM',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    departments: [
      { name: 'General OPD', avgTime: 10, prefix: 'OPD' },
      { name: 'Pediatrics', avgTime: 15, prefix: 'PED' },
      { name: 'Diagnostics & Blood Test', avgTime: 8, prefix: 'LAB' },
      { name: 'Pharmacy Counter', avgTime: 5, prefix: 'PHARM' },
    ],
    peakHours: ['10:00 AM - 12:30 PM', '04:00 PM - 06:30 PM'],
    aiTip: 'Queue velocity is 22% faster during 02:00 PM - 03:30 PM today.',
  },
  {
    name: 'National Apex Premier Bank',
    category: 'bank',
    categoryName: 'Bank',
    address: 'Financial Hub, 5th Main Street',
    city: 'Metropolis',
    rating: 4.6,
    reviewsCount: 219,
    openHours: '09:30 AM - 04:30 PM',
    image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=600&q=80',
    departments: [
      { name: 'Cash Deposit & Withdrawal', avgTime: 5, prefix: 'CASH' },
      { name: 'Loans & Mortgages', avgTime: 20, prefix: 'LOAN' },
      { name: 'Account Opening & KYC', avgTime: 12, prefix: 'KYC' },
      { name: 'Forex & High Net Value', avgTime: 15, prefix: 'HNV' },
    ],
    peakHours: ['11:00 AM - 01:30 PM'],
    aiTip: 'Cash counters move fast! Average wait time is currently under 10 minutes.',
  },
  {
    name: 'Urban Blade Stylists & Spa',
    category: 'salon',
    categoryName: 'Salon & Spa',
    address: 'Lifestyle Plaza, 3rd Floor',
    city: 'Tech City',
    rating: 4.9,
    reviewsCount: 184,
    openHours: '10:00 AM - 09:00 PM',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    departments: [
      { name: 'Haircut & Styling', avgTime: 20, prefix: 'HAIR' },
      { name: 'Facial & Skincare', avgTime: 35, prefix: 'SKIN' },
      { name: 'Beard Grooming', avgTime: 15, prefix: 'BEARD' },
    ],
    peakHours: ['05:00 PM - 08:30 PM'],
    aiTip: 'Stylist Counter #2 has an open slot coming up in 15 mins.',
  },
  {
    name: 'Passport & Regional Citizen Kendra',
    category: 'govt',
    categoryName: 'Govt Office',
    address: 'Civic Center Complex, Building B',
    city: 'Capital Region',
    rating: 4.2,
    reviewsCount: 420,
    openHours: '09:00 AM - 05:00 PM',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
    departments: [
      { name: 'Passport Renewal Desk', avgTime: 15, prefix: 'PASS' },
      { name: 'Biometrics Verification', avgTime: 6, prefix: 'BIO' },
      { name: 'Citizen Document Attestation', avgTime: 10, prefix: 'DOC' },
    ],
    peakHours: ['10:00 AM - 01:00 PM'],
    aiTip: 'Post-lunch slots (02:00 PM - 03:30 PM) experience 30% shorter waiting lines.',
  },
  {
    name: 'Metro Central Express Cafeteria',
    category: 'cafeteria',
    categoryName: 'Cafeteria',
    address: 'Tech Park Block C, Ground Floor',
    city: 'Tech City',
    rating: 4.5,
    reviewsCount: 156,
    openHours: '08:00 AM - 10:00 PM',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    departments: [
      { name: 'Specialty Coffee & Bakery', avgTime: 4, prefix: 'CAFE' },
      { name: 'Hot Meals & Lunch Buffet', avgTime: 7, prefix: 'MEAL' },
      { name: 'Fresh Juices & Salads', avgTime: 4, prefix: 'JUICE' },
    ],
    peakHours: ['01:00 PM - 02:30 PM', '05:30 PM - 07:00 PM'],
    aiTip: 'Express Coffee Counter is currently clear with 0 queue length.',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting QueueLess Database Seeding...');
    await connectDB();

    // 1. Clear existing collections
    console.log('🧹 Purging previous demo data...');
    await Promise.all([
      User.deleteMany({}),
      Business.deleteMany({}),
      Service.deleteMany({}),
      Queue.deleteMany({}),
      Token.deleteMany({}),
      Notification.deleteMany({}),
      ServiceHistory.deleteMany({}),
    ]);

    // 2. Seed Users
    console.log('👤 Creating standard demo users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@queueless.com',
      passwordHash,
      role: 'admin',
      phone: '+1 555-0100',
    });

    const staffUser = await User.create({
      name: 'Service Staff Desk',
      email: 'staff@queueless.com',
      passwordHash,
      role: 'staff',
      phone: '+1 555-0101',
    });

    const customerUser = await User.create({
      name: 'Alex Johnson',
      email: 'customer@queueless.com',
      passwordHash,
      role: 'customer',
      phone: '+1 555-0102',
    });

    // 3. Seed Venues, Services, and Queues
    console.log('🏢 Creating businesses, services, and live queues...');
    for (const vData of INITIAL_VENUES_DATA) {
      const business = await Business.create({
        name: vData.name,
        category: vData.category,
        categoryName: vData.categoryName,
        address: vData.address,
        city: vData.city,
        rating: vData.rating,
        reviewsCount: vData.reviewsCount,
        openHours: vData.openHours,
        peakHours: vData.peakHours,
        aiTip: vData.aiTip,
        image: vData.image,
        owner: adminUser._id,
      });

      for (const dept of vData.departments) {
        const service = await Service.create({
          business: business._id,
          name: dept.name,
          prefix: dept.prefix,
          averageServiceMinutes: dept.avgTime,
        });

        const queue = await Queue.create({
          business: business._id,
          service: service._id,
          name: `${dept.name} Queue`,
          activeCounters: 2,
          totalCounters: 4,
          tokenSequence: 100,
        });

        // 4. Create sample historical data for analytics and AI prediction training
        for (let i = 0; i < 15; i++) {
          const hour = 8 + (i % 11); // 8 AM to 6 PM
          const waitMins = Math.floor(Math.random() * 12 + 4);
          const serviceMins = Math.floor(dept.avgTime + (Math.random() * 6 - 3));

          await ServiceHistory.create({
            token: new mongoose.Types.ObjectId(),
            business: business._id,
            service: service._id,
            queue: queue._id,
            tokenNumber: `QL-${dept.prefix}-${100 + i}`,
            customerName: `Customer #${100 + i}`,
            waitDurationMins: Math.max(2, waitMins),
            serviceDurationMins: Math.max(3, serviceMins),
            date: new Date(Date.now() - (15 - i) * 3600000),
            hourOfDay: hour,
            dayOfWeek: new Date().getDay(),
            status: 'completed',
          });
        }
      }
    }

    console.log('\n======================================================');
    console.log('✅ QueueLess Database Successfully Seeded!');
    console.log('======================================================');
    console.log('🔑 Coursework Demo Credentials:');
    console.log('   Admin:    admin@queueless.com    / password123');
    console.log('   Staff:    staff@queueless.com    / password123');
    console.log('   Customer: customer@queueless.com / password123');
    console.log('======================================================\n');

    await closeDatabaseConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
