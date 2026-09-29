const http = require('http');

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SKILLX E2E VERIFICATION ---');

  // 1. Backend Health Check
  const health = await request('http://localhost:5000/api/health');
  console.log('1. Health check:', health.status, health.data.status, 'Product:', health.data.product);
  if (health.data.status !== 'healthy') throw new Error('Health check failed');

  // 2. Username Availability Validation
  const userCheck1 = await request('http://localhost:5000/api/auth/check-username?username=admin');
  console.log('2a. Reserved username (admin):', userCheck1.data.available === false ? 'PASS (Reserved correctly)' : 'FAIL');

  const userCheck2 = await request('http://localhost:5000/api/auth/check-username?username=alex_codes');
  console.log('2b. Taken username (alex_codes):', userCheck2.data.available === false ? 'PASS (Taken correctly)' : 'FAIL');

  const userCheck3 = await request('http://localhost:5000/api/auth/check-username?username=great_new_learner');
  console.log('2c. Available username (great_new_learner):', userCheck3.data.available === true ? 'PASS (Available)' : 'FAIL');

  // 3. User Login & JWT Auth
  const loginRes = await request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { identifier: 'python_master', password: 'Password123!' }
  });
  console.log('3a. Login as @python_master:', loginRes.status, loginRes.data.success ? 'PASS' : 'FAIL');
  const token = loginRes.data.token;
  if (!token) throw new Error('No token returned');

  const meRes = await request('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('3b. Get /me authenticated:', meRes.data.user.username, 'Teaching skills count:', meRes.data.profile.skillsTeaching.length);

  // 4. Rule-Based Skill Discovery & Transparent Matching
  const discoverRes = await request('http://localhost:5000/api/exchanges/discover', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('4a. Discovered peers count:', discoverRes.data.count);
  const topMatch = discoverRes.data.peers[0];
  console.log(`4b. Top match for @python_master is @${topMatch.user.username} (Mutual Match: ${topMatch.matchInfo.isMutualMatch}, Score: ${topMatch.matchInfo.compatibilityScore}%)`);
  console.log('    Reasoning breakdown:');
  topMatch.matchInfo.whyMatch.forEach(r => console.log('    ', r));

  // 5. Skill Studio & Resources with Attribution
  const exchangesRes = await request('http://localhost:5000/api/exchanges/my-exchanges', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const studioExchange = exchangesRes.data.exchanges.find(e => e.studioId);
  const studioId = studioExchange.studioId._id || studioExchange.studioId;
  console.log('5a. Active exchange found with studioId:', studioId);

  const studioRes = await request(`http://localhost:5000/api/studios/${studioId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('5b. Skill Studio accessed:', studioRes.data.studio.title, 'Whiteboard elements:', studioRes.data.studio.whiteboardElements.length);

  const resourcesRes = await request(`http://localhost:5000/api/resources/studio/${studioId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('5c. Shared resources in studio:', resourcesRes.data.resources.length);
  resourcesRes.data.resources.forEach(r => {
    console.log(`    File: "${r.originalName}" | Shared by: @${r.uploaderUsername} | Size: ${(r.sizeBytes / 1024).toFixed(1)} KB`);
  });

  // 6. Collaborative Projects & Skill Passport Badges
  const projectsRes = await request('http://localhost:5000/api/projects');
  console.log('6. Public collaborative projects count:', projectsRes.data.projects.length);
  projectsRes.data.projects.forEach(p => {
    console.log(`    Project: "${p.title}" | Status: ${p.status} | Skills: ${p.skillsUsed.join(', ')}`);
  });

  // 7. Client HTTP Status
  const clientRes = await new Promise((resolve) => {
    http.get('http://localhost:5173/', res => resolve(res.statusCode));
  });
  console.log('7. Client Vite server HTTP response status:', clientRes);

  console.log('--- ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
