import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AcousticPulse database seed...');

  // Clean existing tables in correct order
  await prisma.notification.deleteMany({});
  await prisma.complaintTimeline.deleteMany({});
  await prisma.noiseComplaint.deleteMany({});
  await prisma.noiseAlert.deleteMany({});
  await prisma.noiseReading.deleteMany({});
  await prisma.monitoringStation.deleteMany({});
  await prisma.acousticProfile.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@12345', salt);
  const officerPassword = await bcrypt.hash('Officer@12345', salt);
  const citizenPassword = await bcrypt.hash('Citizen@12345', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@acousticpulse.gov',
      passwordHash: adminPassword,
      name: 'Dr. Vikramaditya Rao',
      role: 'ADMIN',
      department: 'Smart City Urban Analytics Command',
      badgeNumber: 'SC-ADM-001',
      phone: '+91 98401 23456',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const officer1 = await prisma.user.create({
    data: {
      email: 'officer.chennai@acousticpulse.gov',
      passwordHash: officerPassword,
      name: 'Inspector Ananya Sundaram',
      role: 'AUTHORITY',
      department: 'Pollution Control & Acoustic Compliance Division',
      badgeNumber: 'PC-OFF-402',
      phone: '+91 98402 34567',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }
  });

  const officer2 = await prisma.user.create({
    data: {
      email: 'officer.south@acousticpulse.gov',
      passwordHash: officerPassword,
      name: 'Officer Rajesh Kumar',
      role: 'AUTHORITY',
      department: 'Rapid Noise Response Taskforce',
      badgeNumber: 'PC-OFF-408',
      phone: '+91 98403 45678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const citizen = await prisma.user.create({
    data: {
      email: 'citizen@acousticpulse.gov',
      passwordHash: citizenPassword,
      name: 'Karthik Subramanian',
      role: 'CITIZEN',
      department: 'Urban Resident',
      phone: '+91 98404 56789',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log('👤 Seeded 4 default user accounts (Admin, 2 Officers, Citizen).');

  // 2. Seed Acoustic Profiles
  await prisma.acousticProfile.createMany({
    data: [
      {
        name: 'Quiet Zone',
        category: 'QUIET_ZONE',
        lowerDba: 0,
        upperDba: 50,
        description: 'Eco-parks, sanctuary spaces, and certified hospital silence zones.',
        healthRisk: 'Negligible. Fosters restorative sleep and mental wellness.',
        recommendedAction: 'Preserve tree buffer belts and enforce strict vehicular honking bans.',
        colorHex: '#10b981'
      },
      {
        name: 'Residential Sanctuary',
        category: 'RESIDENTIAL',
        lowerDba: 50,
        upperDba: 60,
        description: 'Suburban living corridors, apartment townships, and school premises.',
        healthRisk: 'Low daytime impact. Sustained night exposure >55 dBA may disturb sleep.',
        recommendedAction: 'Establish heavy transport night curfews between 10 PM and 6 AM.',
        colorHex: '#3b82f6'
      },
      {
        name: 'Moderate Urban Corridor',
        category: 'MODERATE_URBAN',
        lowerDba: 60,
        upperDba: 70,
        description: 'Mixed residential-commercial districts, secondary arterial roads, shopping streets.',
        healthRisk: 'Moderate chronic cardiovascular and cognitive fatigue risk if unmanaged.',
        recommendedAction: 'Synchronize traffic lights to reduce stop-and-go acceleration noise.',
        colorHex: '#f59e0b'
      },
      {
        name: 'High Noise Zone',
        category: 'HIGH_NOISE',
        lowerDba: 70,
        upperDba: 80,
        description: 'Major expressways, train terminals, construction complexes, and bus depots.',
        healthRisk: 'High annoyance, hearing strain, heightened hypertension risk.',
        recommendedAction: 'Erect sound barrier walls and mandate construction acoustic dampening.',
        colorHex: '#f97316'
      },
      {
        name: 'Critical Noise Hotspot',
        category: 'CRITICAL_NOISE',
        lowerDba: 80,
        upperDba: 120,
        description: 'Heavy industrial machining complexes, flight paths, flyover intersections.',
        healthRisk: 'Severe risk of permanent acoustic trauma and sleep deprivation.',
        recommendedAction: 'Immediate enforcement inspection and mandatory industrial silencer retrofitting.',
        colorHex: '#ef4444'
      }
    ]
  });

  console.log('🏷️ Seeded 5 Acoustic Profiles.');

  // 3. Seed Monitoring Stations (Sathyamangalam Smart City Noise Grid)
  const stationsData = [
    {
      stationCode: 'AP-STN-01',
      name: 'Sathyamangalam Bus Stand Terminal',
      zoneType: 'COMMERCIAL',
      latitude: 11.5042,
      longitude: 77.2415,
      status: 'ONLINE',
      dayThresholdDba: 68.0,
      nightThresholdDba: 58.0,
      address: 'Central Bus Stand, Mysore Trunk Rd, Sathyamangalam',
      description: 'Central transit terminal with inter-state buses and busy commercial shop clusters.',
      lastReadingDba: 74.8
    },
    {
      stationCode: 'AP-STN-02',
      name: 'Bannari Amman Institute Campus (BIT)',
      zoneType: 'SILENCE_ZONE',
      latitude: 11.4965,
      longitude: 77.2762,
      status: 'ONLINE',
      dayThresholdDba: 50.0,
      nightThresholdDba: 40.0,
      address: 'Alathukombai Post, Sathyamangalam, Erode Dt.',
      description: 'Academic campus, engineering research labs and student residential silence zone.',
      lastReadingDba: 48.2
    },
    {
      stationCode: 'AP-STN-03',
      name: 'Bhavani River Bridge North Hub',
      zoneType: 'COMMERCIAL',
      latitude: 11.5078,
      longitude: 77.2458,
      status: 'ONLINE',
      dayThresholdDba: 65.0,
      nightThresholdDba: 55.0,
      address: 'Bhavani River Overbridge, Sathyamangalam',
      description: 'Arterial bridge intersection connecting northern highway traffic.',
      lastReadingDba: 68.6
    },
    {
      stationCode: 'AP-STN-04',
      name: 'Government Hospital Silence Zone',
      zoneType: 'SILENCE_ZONE',
      latitude: 11.5065,
      longitude: 77.2389,
      status: 'ONLINE',
      dayThresholdDba: 50.0,
      nightThresholdDba: 40.0,
      address: 'Hospital Rd, Opp Taluk Office, Sathyamangalam',
      description: 'Government General Hospital healthcare perimeter with 0-honking regulation.',
      lastReadingDba: 46.9
    },
    {
      stationCode: 'AP-STN-05',
      name: 'Sathy Daily Flower Market',
      zoneType: 'COMMERCIAL',
      latitude: 11.5019,
      longitude: 77.2427,
      status: 'ONLINE',
      dayThresholdDba: 68.0,
      nightThresholdDba: 60.0,
      address: 'Market Road, Sathyamangalam',
      description: 'South India major wholesale flower auction terminal with intense early morning bustling.',
      lastReadingDba: 78.4
    },
    {
      stationCode: 'AP-STN-06',
      name: 'SIPCOT Industrial Growth Center',
      zoneType: 'INDUSTRIAL',
      latitude: 11.4720,
      longitude: 77.2285,
      status: 'ONLINE',
      dayThresholdDba: 75.0,
      nightThresholdDba: 70.0,
      address: 'SIPCOT Industrial Area, Periyakodiveri, Sathyamangalam',
      description: 'Textile processing, spinning mills, agro-machinery fabrication plants.',
      lastReadingDba: 81.3
    },
    {
      stationCode: 'AP-STN-07',
      name: 'Bannari Amman Temple Toll Gate (NH 948)',
      zoneType: 'HIGH_NOISE',
      latitude: 11.5458,
      longitude: 77.1685,
      status: 'ONLINE',
      dayThresholdDba: 70.0,
      nightThresholdDba: 60.0,
      address: 'NH 948 Coimbatore-Bengaluru Highway, Bannari',
      description: 'Major pilgrimage spot and heavy interstate cargo checkpoint leading to Dimbam Ghats.',
      lastReadingDba: 76.5
    },
    {
      stationCode: 'AP-STN-08',
      name: 'Sathyamangalam Tiger Reserve (STR) Forest Gate',
      zoneType: 'SILENCE_ZONE',
      latitude: 11.5580,
      longitude: 77.1420,
      status: 'ONLINE',
      dayThresholdDba: 45.0,
      nightThresholdDba: 38.0,
      address: 'STR Checkpost, Hasanur Ghat Entry, Sathyamangalam',
      description: 'Protected wildlife sanctuary buffer corridor with strict nighttime transit speed & sound limits.',
      lastReadingDba: 41.2
    },
    {
      stationCode: 'AP-STN-09',
      name: 'Rangasamudram Residential Layout',
      zoneType: 'RESIDENTIAL',
      latitude: 11.4985,
      longitude: 77.2340,
      status: 'ONLINE',
      dayThresholdDba: 55.0,
      nightThresholdDba: 45.0,
      address: 'Rangasamudram Extension, Sathyamangalam',
      description: 'Peaceful residential township with school corridors and family dwellings.',
      lastReadingDba: 53.4
    },
    {
      stationCode: 'AP-STN-10',
      name: 'Kodivery Dam Eco-Recreation Zone',
      zoneType: 'SILENCE_ZONE',
      latitude: 11.5285,
      longitude: 77.3025,
      status: 'ONLINE',
      dayThresholdDba: 55.0,
      nightThresholdDba: 45.0,
      address: 'Kodivery Dam & Park Rd, Gobichettipalayam Border',
      description: 'Water reservoir eco-tourism spot with natural cascading water acoustics.',
      lastReadingDba: 52.8
    },
    {
      stationCode: 'AP-STN-11',
      name: 'Sathy Bazar Street & Clock Tower',
      zoneType: 'COMMERCIAL',
      latitude: 11.5038,
      longitude: 77.2460,
      status: 'ONLINE',
      dayThresholdDba: 65.0,
      nightThresholdDba: 55.0,
      address: 'Bazar Street, Clock Tower Junction, Sathyamangalam',
      description: 'Old town retail shopping street and vehicular bottleneck.',
      lastReadingDba: 69.2
    },
    {
      stationCode: 'AP-STN-12',
      name: 'Athani Road Highway Junction',
      zoneType: 'COMMERCIAL',
      latitude: 11.5120,
      longitude: 77.2580,
      status: 'MAINTENANCE',
      dayThresholdDba: 68.0,
      nightThresholdDba: 58.0,
      address: 'Athani Main Rd Bypass, Sathyamangalam',
      description: 'Highway freight bypass junction connecting Gobichettipalayam and Bhavani.',
      lastReadingDba: 66.5
    }
  ];

  const createdStations = [];
  for (const s of stationsData) {
    const st = await prisma.monitoringStation.create({ data: s });
    createdStations.push(st);
  }

  console.log(`📡 Seeded ${createdStations.length} Monitoring Stations across Chennai.`);

  // 4. Seed Temporal Historical Readings (over past 30 days & dense past 24h)
  const now = new Date();
  const readings = [];

  for (const station of createdStations) {
    // 30 daily data points
    for (let d = 30; d >= 1; d--) {
      const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      // 4 samples per day (morning, afternoon, evening, night)
      const hours = [8, 14, 19, 23];
      for (const h of hours) {
        date.setHours(h, Math.floor(Math.random() * 60), 0, 0);

        let base = station.zoneType === 'INDUSTRIAL' ? 74 : station.zoneType === 'COMMERCIAL' ? 66 : station.zoneType === 'RESIDENTIAL' ? 52 : 44;
        if (h === 8 || h === 19) base += 6.5; // Rush peak
        if (h === 23) base -= 8.0; // Night drop

        const dba = parseFloat((base + (Math.random() * 8 - 4)).toFixed(1));
        const threshold = (h >= 22 || h < 6) ? station.nightThresholdDba : station.dayThresholdDba;

        readings.push({
          stationId: station.id,
          dba,
          peakDba: parseFloat((dba + Math.random() * 6 + 1).toFixed(1)),
          minDba: parseFloat((dba - Math.random() * 5 - 1).toFixed(1)),
          frequencyBandHz: 1000,
          isViolation: dba > threshold,
          recordedAt: new Date(date)
        });
      }
    }

    // Past 24 hours: 1 sample every hour for rich diurnal curve
    for (let h = 24; h >= 0; h--) {
      const date = new Date(now.getTime() - h * 60 * 60 * 1000);
      const hourVal = date.getHours();

      let base = station.zoneType === 'INDUSTRIAL' ? 74 : station.zoneType === 'COMMERCIAL' ? 66 : station.zoneType === 'RESIDENTIAL' ? 52 : 44;
      if (hourVal >= 8 && hourVal <= 10) base += 8.0;
      if (hourVal >= 17 && hourVal <= 20) base += 9.5;
      if (hourVal >= 1 && hourVal <= 5) base -= 12.0;

      const dba = parseFloat((base + (Math.random() * 6 - 3)).toFixed(1));
      const isNight = hourVal >= 22 || hourVal < 6;
      const threshold = isNight ? station.nightThresholdDba : station.dayThresholdDba;

      readings.push({
        stationId: station.id,
        dba,
        peakDba: parseFloat((dba + Math.random() * 5 + 2).toFixed(1)),
        minDba: parseFloat((dba - Math.random() * 4 - 2).toFixed(1)),
        frequencyBandHz: 1000,
        isViolation: dba > threshold,
        recordedAt: new Date(date)
      });
    }
  }

  await prisma.noiseReading.createMany({ data: readings });
  console.log(`📊 Seeded ${readings.length} temporal noise readings.`);

  // 5. Seed Noise Complaints
  const complaintsData = [
    {
      trackingId: 'AP-2026-004281',
      citizenId: citizen.id,
      citizenName: citizen.name,
      citizenEmail: citizen.email,
      citizenPhone: citizen.phone,
      title: 'Unlawful Heavy Piling Noise Past Midnight',
      sourceCategory: 'CONSTRUCTION',
      locationAddress: 'Rangasamudram 2nd Cross, Sathyamangalam',
      latitude: 11.4990,
      longitude: 77.2350,
      severity: 'CRITICAL',
      description: 'Continuous hydraulic pile hammer operation running at 1:30 AM without acoustic barriers. Vibrations and loud banging echoing across residential houses.',
      status: 'IN_PROGRESS',
      assignedOfficerId: officer1.id,
      beforeDba: 88.5,
      createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            authorId: citizen.id,
            fromStatus: 'NONE',
            toStatus: 'SUBMITTED',
            actionNote: 'Complaint registered by resident with audio decibel log.'
          },
          {
            authorId: officer1.id,
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_REVIEW',
            actionNote: 'Under review by Pollution Control Desk.'
          },
          {
            authorId: officer1.id,
            fromStatus: 'UNDER_REVIEW',
            toStatus: 'ASSIGNED',
            actionNote: 'Assigned to Inspector Ananya Sundaram for night dispatch.'
          },
          {
            authorId: officer1.id,
            fromStatus: 'ASSIGNED',
            toStatus: 'IN_PROGRESS',
            actionNote: 'Field patrol dispatched to site. Notice of violation served to contractor.'
          }
        ]
      }
    },
    {
      trackingId: 'AP-2026-004282',
      citizenId: citizen.id,
      citizenName: citizen.name,
      citizenEmail: citizen.email,
      citizenPhone: citizen.phone,
      title: 'Commercial DG Generator Humming in Hospital Silence Zone',
      sourceCategory: 'COMMERCIAL',
      locationAddress: 'Behind Sathyamangalam GH, Hospital Road',
      latitude: 11.5068,
      longitude: 77.2392,
      severity: 'HIGH',
      description: 'An unshielded 250 kVA diesel generator installed by a nearby retail banquet is producing severe low-frequency rumble affecting patient wards.',
      status: 'VERIFIED',
      assignedOfficerId: officer2.id,
      beforeDba: 76.2,
      createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            authorId: citizen.id,
            fromStatus: 'NONE',
            toStatus: 'SUBMITTED',
            actionNote: 'Complaint submitted by hospital ward administrator.'
          },
          {
            authorId: officer2.id,
            fromStatus: 'SUBMITTED',
            toStatus: 'VERIFIED',
            actionNote: 'Sound level meter confirmed 76.2 dBA in 50 dBA silence zone.'
          }
        ]
      }
    },
    {
      trackingId: 'AP-2026-004283',
      citizenName: 'Deepa Narayanan',
      citizenEmail: 'deepa.n@gmail.com',
      citizenPhone: '+91 94441 88990',
      title: 'High Decibel Public Address Speakers at Community Hall',
      sourceCategory: 'LOUDSPEAKER',
      locationAddress: 'Bazar Street, Clock Tower Junction, Sathyamangalam',
      latitude: 11.5035,
      longitude: 77.2455,
      severity: 'MODERATE',
      description: 'Outdoor cone speakers facing public roadway exceeding 80 dBA during evening hours without sound limiter permission.',
      status: 'RESOLVED',
      assignedOfficerId: officer1.id,
      resolutionNotes: 'Officer inspected venue, calibrated speaker array, and lowered volume by 18 dBA to conform with municipal limits.',
      beforeDba: 82.4,
      afterDba: 61.0,
      resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            authorId: null,
            fromStatus: 'NONE',
            toStatus: 'SUBMITTED',
            actionNote: 'Public complaint logged.'
          },
          {
            authorId: officer1.id,
            fromStatus: 'SUBMITTED',
            toStatus: 'ASSIGNED',
            actionNote: 'Assigned to Sathy zonal officer.'
          },
          {
            authorId: officer1.id,
            fromStatus: 'ASSIGNED',
            toStatus: 'RESOLVED',
            actionNote: 'Sound level reduced. Complaint verified and closed.'
          }
        ]
      }
    },
    {
      trackingId: 'AP-2026-004284',
      citizenName: 'Meera Raghavan',
      citizenEmail: 'meera.r@outlook.com',
      citizenPhone: '+91 98410 77665',
      title: 'Industrial Metal Cutting & Grinding at Odd Hours',
      sourceCategory: 'INDUSTRIAL',
      locationAddress: 'Sector 3, Periyakodiveri SIPCOT Industrial Road',
      latitude: 11.4730,
      longitude: 77.2290,
      severity: 'HIGH',
      description: 'Continuous high-frequency screeching noise from open-air steel shearing workshop occurring past 11 PM.',
      status: 'SUBMITTED',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            authorId: null,
            fromStatus: 'NONE',
            toStatus: 'SUBMITTED',
            actionNote: 'Complaint registered by neighborhood resident.'
          }
        ]
      }
    },
    {
      trackingId: 'AP-2026-004285',
      citizenName: 'Suresh Menon',
      citizenEmail: 'suresh.menon@techhub.in',
      citizenPhone: '+91 97900 11223',
      title: 'Heavy Truck Air Horn Usage at Highway Checkpoint',
      sourceCategory: 'TRAFFIC',
      locationAddress: 'Bannari Toll Gate Approach, NH 948',
      latitude: 11.5450,
      longitude: 77.1690,
      severity: 'MODERATE',
      description: 'Constant aggressive multi-tone horn blasting at night from inter-state cargo trailers waiting at the ghat entry gate.',
      status: 'UNDER_REVIEW',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            authorId: null,
            fromStatus: 'NONE',
            toStatus: 'SUBMITTED',
            actionNote: 'Complaint registered.'
          },
          {
            authorId: officer2.id,
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_REVIEW',
            actionNote: 'Forest checkpoint & traffic police coordination requested.'
          }
        ]
      }
    }
  ];

  for (const c of complaintsData) {
    await prisma.noiseComplaint.create({
      data: c
    });
  }

  console.log(`📋 Seeded ${complaintsData.length} Citizen Complaints with full lifecycle timelines.`);

  // 6. Seed Noise Alerts
  await prisma.noiseAlert.createMany({
    data: [
      {
        stationId: createdStations[5].id, // SIPCOT Industrial
        severity: 'CRITICAL',
        alertType: 'ACOUSTIC_SPIKE',
        location: 'SIPCOT Industrial Growth Center, Periyakodiveri',
        dba: 88.4,
        durationMinutes: 18,
        message: 'Critical acoustic spike: 88.4 dBA detected in Industrial Zone. Exceeds standard limit of 75.0 dBA.',
        isResolved: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        stationId: createdStations[0].id, // Sathy Bus Stand
        severity: 'HIGH',
        alertType: 'THRESHOLD_BREACH',
        location: 'Sathyamangalam Bus Stand Terminal',
        dba: 79.2,
        durationMinutes: 25,
        message: 'Sustained high commercial transit noise level recorded during evening rush.',
        isResolved: false,
        createdAt: new Date(Date.now() - 110 * 60 * 1000)
      },
      {
        stationId: createdStations[4].id, // Flower Market
        severity: 'HIGH',
        alertType: 'THRESHOLD_BREACH',
        location: 'Sathy Daily Flower Market',
        dba: 84.1,
        durationMinutes: 35,
        message: 'Persistent wholesale transport noise during early morning auction hours.',
        isResolved: false,
        createdAt: new Date(Date.now() - 180 * 60 * 1000)
      },
      {
        stationId: createdStations[11].id, // Athani Junction
        severity: 'WARNING',
        alertType: 'STATION_OFFLINE',
        location: 'Athani Road Highway Junction',
        dba: null,
        durationMinutes: 60,
        message: 'Station sensor telemetry offline for routine scheduled calibration.',
        isResolved: true,
        resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 240 * 60 * 1000)
      }
    ]
  });

  console.log('🚨 Seeded Noise Alerts.');

  // 7. Seed Smart Recommendations
  await prisma.recommendation.createMany({
    data: [
      {
        title: 'Residential Quiet Hours Window Regulation',
        category: 'QUIET_HOURS',
        impactEstimate: '18.4% nighttime noise exposure reduction across 4 key residential wards.',
        targetArea: 'Anna Nagar & Kilpauk Corridors',
        recommendedTimeWindow: '11:00 PM – 05:30 AM',
        expectedReductionDba: 6.8,
        confidenceScore: 94.5,
        description: 'Enforce strict construction halts, heavy transport rerouting, and zero DG generator runs after 11 PM.'
      },
      {
        title: 'Intelligent Green Acoustic Buffers on Arterial Roads',
        category: 'ACOUSTIC_BARRIERS',
        impactEstimate: '4.5 to 7.0 dBA attenuation of high-frequency vehicular tire rumble.',
        targetArea: 'OMR IT Corridor & Velachery Junction',
        recommendedTimeWindow: 'Permanent Infrastructure',
        expectedReductionDba: 5.5,
        confidenceScore: 89.0,
        description: 'Plant dense multi-tiered evergreen shrubs (Ficus, Conocarpus) along central medians and sound wall barriers.'
      },
      {
        title: 'Heavy Commercial Transit Night Bypass Divergence',
        category: 'TRAFFIC_MANAGEMENT',
        impactEstimate: 'Elimination of ~120 nighttime acoustic spikes per hour in urban core.',
        targetArea: 'T. Nagar & Poonamallee High Rd',
        recommendedTimeWindow: '10:00 PM – 06:00 AM',
        expectedReductionDba: 8.2,
        confidenceScore: 91.8,
        description: 'Mandate interstate logistics trailers to take Outer Ring Road bypass instead of central commercial arteries.'
      },
      {
        title: 'Automated Acoustic Camera Honking Penalty System',
        category: 'TRAFFIC_MANAGEMENT',
        impactEstimate: '65% reduction in repetitive acoustic horn abuse near hospital silence zones.',
        targetArea: 'Kilpauk Silence Zone & Central Railway Approach',
        recommendedTimeWindow: '24/7 Enforcement',
        expectedReductionDba: 6.0,
        confidenceScore: 96.0,
        description: 'Deploy directional acoustic sensors paired with ANPR cameras to automatically fine illegal pressure horns.'
      }
    ]
  });

  console.log('💡 Seeded Policy Recommendations.');

  // 8. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: officer1.id,
        title: 'Critical Spike Detected in Guindy',
        message: 'Station AP-STN-03 recorded 88.4 dBA at 14:05 PM.',
        type: 'CRITICAL',
        link: '/alerts'
      },
      {
        userId: officer1.id,
        title: 'Complaint AP-2026-004281 Assigned',
        message: 'You have been assigned to investigate heavy piling noise in Anna Nagar.',
        type: 'COMPLAINT',
        link: '/complaints'
      },
      {
        userId: admin.id,
        title: 'Daily Urban Noise Health Score: 74/100',
        message: 'Moderate city acoustic health recorded over the last 24h cycle.',
        type: 'INFO',
        link: '/analytics'
      }
    ]
  });

  console.log('🔔 Seeded Notifications.');
  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
