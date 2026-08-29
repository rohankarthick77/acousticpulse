import prisma from '../prisma.js';
import { calculateUrbanHealthScore } from '../services/healthScoreService.js';
import { tickStationSimulations } from '../services/noiseSimulationService.js';

export const getNoiseStats = async (req, res) => {
  try {
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const past48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [stations, totalStationsCount, activeStationsCount] = await Promise.all([
      prisma.monitoringStation.findMany({ select: { lastReadingDba: true, status: true } }),
      prisma.monitoringStation.count(),
      prisma.monitoringStation.count({ where: { status: 'ONLINE' } })
    ]);

    const activeReadings = stations.filter(s => s.status === 'ONLINE').map(s => s.lastReadingDba);
    const avgCurrentDba = activeReadings.length
      ? parseFloat((activeReadings.reduce((a, b) => a + b, 0) / activeReadings.length).toFixed(1))
      : 64.8;

    // Yesterday average for trend delta
    const yesterdayReadings = await prisma.noiseReading.aggregate({
      where: {
        recordedAt: { gte: past48h, lt: past24h }
      },
      _avg: { dba: true }
    });

    const yesterdayAvg = yesterdayReadings._avg.dba ? parseFloat(yesterdayReadings._avg.dba.toFixed(1)) : avgCurrentDba + 1.2;
    const trendPercentage = parseFloat((((avgCurrentDba - yesterdayAvg) / yesterdayAvg) * 100).toFixed(1));

    // Critical zones (>80 dBA)
    const criticalZonesCount = stations.filter(s => s.status === 'ONLINE' && s.lastReadingDba >= 80).length;

    // 24h Violations count
    const violationsCount = await prisma.noiseReading.count({
      where: {
        isViolation: true,
        recordedAt: { gte: past24h }
      }
    });

    // Open Complaints count
    const openComplaintsCount = await prisma.noiseComplaint.count({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] }
      }
    });

    // Health Score calculation
    const healthScore = await calculateUrbanHealthScore();

    return res.json({
      averageDba: avgCurrentDba,
      yesterdayAvgDba: yesterdayAvg,
      trendPercentage,
      totalStations: totalStationsCount,
      activeStations: activeStationsCount,
      criticalZones: criticalZonesCount,
      violations24h: violationsCount,
      openComplaints: openComplaintsCount,
      healthScore
    });
  } catch (error) {
    console.error('Get noise stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve noise statistics' });
  }
};

export const getNoiseTrends = async (req, res) => {
  try {
    const { range = '24h', stationId } = req.query;

    const now = new Date();
    let pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (range === '7d') pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (range === '30d') pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const where = { recordedAt: { gte: pastDate } };
    if (stationId) where.stationId = stationId;

    const readings = await prisma.noiseReading.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      select: {
        dba: true,
        peakDba: true,
        minDba: true,
        isViolation: true,
        recordedAt: true,
        stationId: true
      }
    });

    // Bucket into hourly time intervals
    const hourlyBuckets = {};
    for (let i = 0; i < 24; i++) {
      hourlyBuckets[i] = { hour: i, sumDba: 0, sumPeak: 0, count: 0, violations: 0 };
    }

    readings.forEach(r => {
      const h = new Date(r.recordedAt).getHours();
      hourlyBuckets[h].sumDba += r.dba;
      hourlyBuckets[h].sumPeak += r.peakDba;
      hourlyBuckets[h].count += 1;
      if (r.isViolation) hourlyBuckets[h].violations += 1;
    });

    const hourlyData = Object.values(hourlyBuckets).map(b => {
      const avg = b.count ? parseFloat((b.sumDba / b.count).toFixed(1)) : 52.0;
      const peak = b.count ? parseFloat((b.sumPeak / b.count).toFixed(1)) : avg + 5.0;
      const hourFormatted = `${b.hour.toString().padStart(2, '0')}:00`;
      const threshold = (b.hour >= 22 || b.hour < 6) ? 55.0 : 65.0;

      return {
        hour: b.hour,
        timeLabel: hourFormatted,
        averageDba: avg,
        peakDba: peak,
        violations: b.violations,
        threshold
      };
    });

    return res.json({
      range,
      data: hourlyData,
      totalReadings: readings.length
    });
  } catch (error) {
    console.error('Get noise trends error:', error);
    return res.status(500).json({ error: 'Failed to retrieve noise trends' });
  }
};

export const getHourlyHeatmap = async (req, res) => {
  try {
    const stations = await prisma.monitoringStation.findMany({
      where: { status: 'ONLINE' },
      select: { id: true, name: true, zoneType: true }
    });

    const past7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const readings = await prisma.noiseReading.findMany({
      where: { recordedAt: { gte: past7d } },
      select: { stationId: true, dba: true, recordedAt: true }
    });

    // Build matrix [stationId][hour (0..23)]
    const matrix = stations.map(station => {
      const stationReadings = readings.filter(r => r.stationId === station.id);
      const hours = Array.from({ length: 24 }, (_, hour) => {
        const matches = stationReadings.filter(r => new Date(r.recordedAt).getHours() === hour);
        if (!matches.length) return 50.0;
        const avg = matches.reduce((acc, m) => acc + m.dba, 0) / matches.length;
        return parseFloat(avg.toFixed(1));
      });

      return {
        stationId: station.id,
        stationName: station.name,
        zoneType: station.zoneType,
        hours
      };
    });

    return res.json({ heatmap: matrix });
  } catch (error) {
    console.error('Get hourly heatmap error:', error);
    return res.status(500).json({ error: 'Failed to retrieve temporal heatmap' });
  }
};

export const getViolations = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const violations = await prisma.noiseReading.findMany({
      where: { isViolation: true },
      orderBy: { recordedAt: 'desc' },
      take: parseInt(limit),
      include: {
        station: {
          select: {
            id: true,
            name: true,
            stationCode: true,
            zoneType: true,
            address: true,
            dayThresholdDba: true,
            nightThresholdDba: true
          }
        }
      }
    });

    return res.json({ violations });
  } catch (error) {
    console.error('Get violations error:', error);
    return res.status(500).json({ error: 'Failed to retrieve violations' });
  }
};

export const triggerSimulateTick = async (req, res) => {
  try {
    await tickStationSimulations();
    return res.json({ message: 'Simulation tick executed successfully', timestamp: new Date() });
  } catch (error) {
    console.error('Simulate tick error:', error);
    return res.status(500).json({ error: 'Failed to execute simulation tick' });
  }
};
