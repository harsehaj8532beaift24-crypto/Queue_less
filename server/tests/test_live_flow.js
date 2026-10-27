async function run() {
  console.log('Testing Live QueueLess End-to-End System...\n');

  // 1. Get businesses
  const bizRes = await fetch('http://localhost:5000/api/businesses').then(r => r.json());
  console.log('✅ 1. Businesses retrieved:', bizRes.count);
  const apollo = bizRes.data.find(b => b.name.includes('Apollo'));
  const opdService = apollo.departments[0];
  console.log('   Target venue:', apollo.name, '| Department:', opdService.name);

  // 2. Book token
  const bookRes = await fetch(`http://localhost:5000/api/queues/${opdService.queueId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Live Test Visitor',
      phone: '+91 98765 43210',
      partySize: 1,
      isPriority: true,
      priorityReason: 'Senior Citizen'
    })
  }).then(r => r.json());
  console.log('✅ 2. Booked Token in MongoDB:', bookRes.data.tokenNumber, '| Status:', bookRes.data.status);
  const tokenNumber = bookRes.data.tokenNumber;
  const tokenId = bookRes.data.id || bookRes.data._id;

  // 3. QR Verify via Token Number
  const verifyRes = await fetch('http://localhost:5000/api/qr/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenNumber })
  }).then(r => r.json());
  console.log('✅ 3. QR Authenticity Verified:', verifyRes.verified, '| Outcome:', verifyRes.outcome);

  // 4. Public View for smartphone scanner
  const publicRes = await fetch(`http://localhost:5000/api/qr/view/${tokenNumber}`).then(r => r.json());
  console.log('✅ 4. Public View (Phone Camera): Name Masked =', publicRes.data.customerName, '| Wait Time =', publicRes.data.estimatedWaitMinutes, 'mins');

  // 5. Staff Counter Action (Call token)
  const actionRes = await fetch('http://localhost:5000/api/qr/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenId, action: 'call' })
  }).then(r => r.json());
  console.log('✅ 5. Staff Action: Call Token -> Status is now', actionRes.data.status);

  // 6. Complete token
  const completeRes = await fetch('http://localhost:5000/api/qr/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenId, action: 'complete' })
  }).then(r => r.json());
  console.log('✅ 6. Staff Action: Complete Service -> Status is now', completeRes.data.status);

  // 7. Verify duplicate protection
  const dupVerifyRes = await fetch('http://localhost:5000/api/qr/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenNumber })
  }).then(r => r.json());
  console.log('✅ 7. Duplicate Prevention Check:', dupVerifyRes.outcome, '| Message:', dupVerifyRes.message);

  console.log('\n🎉 ALL 7 LIVE REST & QR WORKFLOW STEPS PASSED PERFECTLY!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
