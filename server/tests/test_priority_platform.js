import assert from 'assert';

async function testPriorityAndPlatform() {
  console.log('Testing Priority Verification Workflow & Platform Governance...\n');

  // 1. Fetch businesses to locate Apollo Health Supercenter
  const bizRes = await fetch('http://localhost:5000/api/businesses').then(r => r.json());
  assert(bizRes.success, 'Businesses retrieved');
  const apollo = bizRes.data.find(b => b.name.includes('Apollo'));
  const opdService = apollo.departments[0];
  const queueId = opdService.queueId;

  // 2. Book regular customer token A
  const regularTokenRes = await fetch(`http://localhost:5000/api/queues/${queueId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Regular Customer A',
      phone: '+91 99999 11111',
      partySize: 1,
      isPriority: false,
    }),
  }).then(r => r.json());
  assert(regularTokenRes.success, 'Regular token booked');
  const regularToken = regularTokenRes.data;
  console.log('✅ 1. Booked Regular Token:', regularToken.tokenNumber);

  // 3. Book priority customer token B (submitted with priority request)
  const priorityTokenRes = await fetch(`http://localhost:5000/api/queues/${queueId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Priority Claimant B',
      phone: '+91 99999 22222',
      partySize: 1,
      isPriority: true,
      priorityReason: 'Medical Emergency',
    }),
  }).then(r => r.json());
  assert(priorityTokenRes.success, 'Priority token booked');
  const priorityToken = priorityTokenRes.data;
  assert.strictEqual(priorityToken.priorityStatus, 'pending', 'Priority status initially PENDING');
  console.log('✅ 2. Booked Priority Token (Pending Verification):', priorityToken.tokenNumber, '| Status:', priorityToken.priorityStatus);

  // 4. Staff fetches priority verification requests
  const requestsRes = await fetch(`http://localhost:5000/api/tokens/priority/requests?businessId=${apollo._id}`).then(r => r.json());
  assert(requestsRes.success, 'Priority requests retrieved');
  const foundRequest = requestsRes.data.find(r => r.tokenNumber === priorityToken.tokenNumber);
  assert(Boolean(foundRequest), 'Found pending request in priority queue');
  console.log('✅ 3. Staff Desk retrieved Priority Verification Request for token:', foundRequest.tokenNumber);

  // 5. Staff reviews and approves the priority request
  const approveRes = await fetch(`http://localhost:5000/api/tokens/${priorityToken.tokenNumber}/priority`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'approve',
      reason: 'Medical triage documentation verified at desk',
    }),
  }).then(r => r.json());
  assert(approveRes.success, 'Priority request approved');
  assert.strictEqual(approveRes.data.priorityStatus, 'verified', 'Token priority is now verified');
  assert.strictEqual(approveRes.data.isPriority, true, 'Token isPriority flag is now true');
  console.log('✅ 4. Staff Approved Priority: Status =', approveRes.data.priorityStatus, '| Note =', approveRes.data.priorityReviewNote);

  // 6. Test Platform Admin Endpoint
  const platformRes = await fetch('http://localhost:5000/api/analytics/platform').then(r => r.json());
  assert(platformRes.success, 'Platform analytics retrieved');
  assert(platformRes.data.totalUsers >= 3, 'Platform users reported');
  assert(platformRes.data.totalBusinesses >= 5, 'Platform businesses reported');
  assert(platformRes.data.systemHealth.database.includes('Connected'), 'Database health optimal');
  console.log('✅ 5. Platform Admin Governance Metrics: Users =', platformRes.data.totalUsers, '| Venues =', platformRes.data.totalBusinesses, '| Health =', platformRes.data.systemHealth.database);

  console.log('\n🎉 ALL PRIORITY & PLATFORM GOVERNANCE WORKFLOWS VERIFIED (100% PASS)');
}

testPriorityAndPlatform().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
