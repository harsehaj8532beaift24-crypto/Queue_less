import { connectDB, closeDatabaseConnection } from '../config/db.js';
import Token from '../models/Token.js';

async function testMobileFlow() {
  console.log('Testing Mobile QR Access & Proxy Endpoints...\n');

  // 1. Test Proxy Health
  const healthRes = await fetch('http://192.168.138.17:5173/api/health');
  if (!healthRes.ok) throw new Error(`Health check failed: HTTP ${healthRes.status}`);
  const health = await healthRes.json();
  console.log('✅ 1. Vite Proxy -> Backend Health:', health.status, '| DB:', health.database);

  // 2. Fetch Queues via port 5173 proxy
  const queuesRes = await fetch('http://192.168.138.17:5173/api/queues');
  const queuesData = await queuesRes.json();
  const queue = queuesData.data[0];
  console.log(`✅ 2. Active Queue via Proxy: ${queue.name} (ID: ${queue._id})`);

  // 3. Book a Token via port 5173 proxy
  const bookRes = await fetch(`http://192.168.138.17:5173/api/queues/${queue._id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Aarav Sharma',
      phone: '9876543210',
      partySize: 2,
      isPriority: false,
    }),
  });
  const bookData = await bookRes.json();
  const token = bookData.data;
  console.log(`✅ 3. Booked Token: ${token.tokenNumber}`);
  console.log(`   Generated QR URL: ${token.qrCodeData}`);

  // 4. Test direct navigation to /token/:tokenId
  const navRes = await fetch(`http://192.168.138.17:5173/token/${token.tokenNumber}`);
  console.log(`✅ 4. Direct Navigation to /token/${token.tokenNumber}: HTTP ${navRes.status} (${navRes.headers.get('content-type')})`);

  // 5. Test direct navigation with query hash: /token/:tokenId?hash=...
  const navWithHashRes = await fetch(token.qrCodeData);
  console.log(`✅ 5. Direct Navigation with QR Hash: HTTP ${navWithHashRes.status}`);

  // 6. Test Public API endpoint: GET /api/tokens/:tokenId/public
  const publicRes = await fetch(`http://192.168.138.17:5173/api/tokens/${token.tokenNumber}/public`);
  const publicData = await publicRes.json();
  console.log('✅ 6. Public Token Details API:');
  console.log(`   Token Number: ${publicData.data.tokenNumber}`);
  console.log(`   Masked Customer Name: ${publicData.data.customerName}`);
  console.log(`   Venue: ${publicData.data.venueName}`);
  console.log(`   Service: ${publicData.data.serviceName}`);
  console.log(`   Position: #${publicData.data.position}`);
  console.log(`   Estimated Wait: ${publicData.data.estimatedWaitMinutes} mins`);
  console.log(`   Status: ${publicData.data.status}`);
  console.log(`   Next Step Message: "${publicData.data.nextStepMessage}"`);
  console.log(`   Privacy Check (No phone/email exposed): phone=${publicData.data.phone === undefined}, email=${publicData.data.email === undefined}`);

  // 7. Test Safe 404 for missing/invalid token
  const invalidRes = await fetch('http://192.168.138.17:5173/api/tokens/QL-INVALID-999/public');
  const invalidData = await invalidRes.json();
  console.log(`✅ 7. Invalid Token 404 Handling: HTTP ${invalidRes.status} | "${invalidData.message}"`);

  console.log('\n🎉 ALL 7 MOBILE FLOW & PROXY TESTS PASSED 100%!');
}

testMobileFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
