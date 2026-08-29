// AcousticPulse Automated Verification Script
const BASE_URL = 'http://localhost:5001/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting AcousticPulse API automated test suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await fetchJson('/health');
    assert(health.status === 200 && health.data.status === 'HEALTHY', 'Health check endpoint is live');

    // 2. Auth: Admin Login
    const adminLogin = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@acousticpulse.gov', password: 'Admin@12345' })
    });
    assert(adminLogin.status === 200 && adminLogin.data.token && adminLogin.data.user.role === 'ADMIN', 'Admin authentication');
    const adminToken = adminLogin.data.token;

    // 3. Auth: Officer Login
    const officerLogin = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'officer.chennai@acousticpulse.gov', password: 'Officer@12345' })
    });
    assert(officerLogin.status === 200 && officerLogin.data.user.role === 'AUTHORITY', 'Authority Officer authentication');
    const officerToken = officerLogin.data.token;

    // 4. Stations List
    const stations = await fetchJson('/stations');
    assert(stations.status === 200 && stations.data.stations.length >= 12, `Stations listed (${stations.data.stations?.length} nodes)`);

    // 5. Noise Statistics & Health Score
    const noiseStats = await fetchJson('/noise/stats');
    assert(
      noiseStats.status === 200 &&
      typeof noiseStats.data.averageDba === 'number' &&
      noiseStats.data.healthScore?.score >= 0,
      `Noise statistics & Urban Health Score (${noiseStats.data.healthScore?.score}/100)`
    );

    // 6. 24h Diurnal Trends
    const trends = await fetchJson('/noise/trends?range=24h');
    assert(trends.status === 200 && trends.data.data.length === 24, '24-hour diurnal curve bucketed data');

    // 7. Citizen Complaint Submission
    const complaintSubmit = await fetchJson('/complaints', {
      method: 'POST',
      body: JSON.stringify({
        title: 'High Decibel Construction Drilling at Night',
        sourceCategory: 'CONSTRUCTION',
        locationAddress: '32 Nelson Manickam Road, Chennai',
        severity: 'HIGH',
        description: 'Pneumatic drill continuous operation without sound curtain barriers.',
        citizenName: 'Deepak V',
        citizenPhone: '+91 98400 99887'
      })
    });
    assert(
      complaintSubmit.status === 201 &&
      complaintSubmit.data.trackingId?.startsWith('AP-'),
      `Citizen complaint submitted with Tracking ID (${complaintSubmit.data.trackingId})`
    );
    const newComplaintId = complaintSubmit.data.complaint.id;

    // 8. Authority Workflow: Status Update & Timeline
    const updateStatus = await fetchJson(`/complaints/${newComplaintId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        actionNote: 'Patrol dispatched to Nelson Manickam Road. Contractor ordered to halt drilling.',
        beforeDba: 83.5,
        afterDba: 56.0
      })
    });
    assert(
      updateStatus.status === 200 &&
      updateStatus.data.complaint.status === 'IN_PROGRESS' &&
      updateStatus.data.complaint.beforeDba === 83.5,
      'Authority complaint status mutation and before/after dBA verification'
    );

    // 9. Alerts Query & Resolution
    const alerts = await fetchJson('/alerts');
    assert(alerts.status === 200 && alerts.data.alerts.length > 0, `Alert feed retrieved (${alerts.data.alerts.length} alerts)`);

    // 10. Simulator: Mitigation Calculation
    const sim = await fetchJson('/simulator/run', {
      method: 'POST',
      body: JSON.stringify({
        trafficRestriction: 30,
        heavyVehicleNightCurfew: 50,
        constructionBarriers: 40,
        industrialThrottling: 20,
        eventDecibelCap: 25
      })
    });
    assert(
      sim.status === 200 &&
      sim.data.simulated.totalDbaReduction > 0 &&
      sim.data.simulated.relievedPopulation > 0,
      `Policy simulator calculation (-${sim.data.simulated.totalDbaReduction} dBA, ~${sim.data.simulated.relievedPopulation} relieved)`
    );

    // 11. Reports Generation
    const report = await fetchJson('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ reportType: 'DAILY_SUMMARY', timeRange: '30d' })
    });
    assert(
      report.status === 200 &&
      report.data.metadata?.reportId &&
      report.data.stations.length > 0,
      `Report dataset generated (${report.data.metadata?.reportId})`
    );

    console.log(`\n========================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('❌ Unexpected test runner error:', err);
    process.exit(1);
  }
}

runTests();
