import prisma from '../prisma.js';

// Base noise profiles by zone
const ZONE_BASELINES = {
  SILENCE_ZONE: { base: 42, dayMax: 54, nightMax: 44, variance: 3.5 },
  RESIDENTIAL: { base: 49, dayMax: 62, nightMax: 50, variance: 4.2 },
  COMMERCIAL: { base: 64, dayMax: 76, nightMax: 60, variance: 5.5 },
  INDUSTRIAL: { base: 72, dayMax: 86, nightMax: 70, variance: 6.8 }
};

/**
 * Calculates realistic dBA value given zone and hour of day (0-23)
 */
export function calculateDiurnalNoise(zoneType, date = new Date(), previousDba = null) {
  const hour = date.getHours() + date.getMinutes() / 60;
  const config = ZONE_BASELINES[zoneType] || ZONE_BASELINES.COMMERCIAL;

  // Diurnal curve factor (-1 to +1)
  // Morning peak: 8:30am (hour 8.5)
  // Evening peak: 6:30pm (hour 18.5)
  // Night trough: 3:00am (hour 3)
  const morningFactor = Math.exp(-Math.pow(hour - 8.5, 2) / 4.5);
  const eveningFactor = Math.exp(-Math.pow(hour - 18.5, 2) / 5.5);
  const afternoonFactor = Math.exp(-Math.pow(hour - 13.5, 2) / 8.0) * 0.5;
  const nightFactor = (hour >= 23 || hour <= 5) ? -0.8 : 0;

  const diurnalMultiplier = Math.max(-0.9, Math.min(1.2, (morningFactor * 1.0 + eveningFactor * 1.1 + afternoonFactor * 0.4 + nightFactor)));

  const targetMean = config.base + (diurnalMultiplier * (config.dayMax - config.base) * 0.7);

  // Random micro-jitter (-1 to +1)
  const jitter = (Math.random() - 0.5) * 2 * config.variance;

  // 3% chance of an acoustic spike (honking, heavy machinery, siren)
  const hasSpike = Math.random() < 0.03;
  const spikeBonus = hasSpike ? (Math.random() * 12 + 6) : 0;

  let computedDba = targetMean + jitter + spikeBonus;

  // If previous reading exists, perform auto-regressive smoothing so changes look natural
  if (previousDba && previousDba > 20) {
    computedDba = (previousDba * 0.65) + (computedDba * 0.35);
  }

  // Bounds
  computedDba = Math.max(35.0, Math.min(105.0, computedDba));
  const peakDba = computedDba + (Math.random() * 4 + 1);
  const minDba = Math.max(30.0, computedDba - (Math.random() * 4 + 1));

  return {
    dba: parseFloat(computedDba.toFixed(1)),
    peakDba: parseFloat(peakDba.toFixed(1)),
    minDba: parseFloat(minDba.toFixed(1)),
    hasSpike
  };
}

/**
 * Periodically updates all active stations with new simulated readings
 */
export async function tickStationSimulations() {
  try {
    const stations = await prisma.monitoringStation.findMany({
      where: { status: 'ONLINE' }
    });

    if (!stations.length) return;

    const now = new Date();
    const isNight = now.getHours() >= 22 || now.getHours() < 6;

    for (const station of stations) {
      const { dba, peakDba, minDba, hasSpike } = calculateDiurnalNoise(
        station.zoneType,
        now,
        station.lastReadingDba
      );

      const threshold = isNight ? station.nightThresholdDba : station.dayThresholdDba;
      const isViolation = dba > threshold;

      // Save reading to database
      await prisma.noiseReading.create({
        data: {
          stationId: station.id,
          dba,
          peakDba,
          minDba,
          frequencyBandHz: Math.floor(Math.random() * 2000 + 500),
          isViolation,
          recordedAt: now
        }
      });

      // Update station telemetry
      await prisma.monitoringStation.update({
        where: { id: station.id },
        data: {
          lastReadingDba: dba,
          lastUpdated: now
        }
      });

      // Trigger automatic anomaly alert if critical or high sustained spike
      if (dba >= 85.0 || (isViolation && dba > threshold + 12.0)) {
        const existingAlert = await prisma.noiseAlert.findFirst({
          where: {
            stationId: station.id,
            isResolved: false,
            createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // within last 15 min
          }
        });

        if (!existingAlert) {
          const severity = dba >= 88.0 ? 'CRITICAL' : 'HIGH';
          await prisma.noiseAlert.create({
            data: {
              stationId: station.id,
              severity,
              alertType: hasSpike ? 'ACOUSTIC_SPIKE' : 'THRESHOLD_BREACH',
              location: station.name + ' (' + station.address + ')',
              dba,
              durationMinutes: Math.floor(Math.random() * 12 + 5),
              message: `${severity} noise event: ${dba} dBA recorded at ${station.name} exceeding regulatory limit of ${threshold} dBA.`
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error during station simulation tick:', err.message);
  }
}
