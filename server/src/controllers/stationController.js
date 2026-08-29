import prisma from '../prisma.js';

export const getStations = async (req, res) => {
  try {
    const { status, zoneType, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (zoneType) where.zoneType = zoneType;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { stationCode: { contains: search } },
        { address: { contains: search } }
      ];
    }

    const stations = await prisma.monitoringStation.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    const now = new Date();
    const isNight = now.getHours() >= 22 || now.getHours() < 6;

    // Enhance each station with 24h summary
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const enhanced = await Promise.all(
      stations.map(async (st) => {
        const stats = await prisma.noiseReading.aggregate({
          where: {
            stationId: st.id,
            recordedAt: { gte: past24h }
          },
          _avg: { dba: true },
          _max: { dba: true },
          _min: { dba: true },
          _count: { id: true }
        });

        // 24h violation count
        const violations = await prisma.noiseReading.count({
          where: {
            stationId: st.id,
            isViolation: true,
            recordedAt: { gte: past24h }
          }
        });

        // Recent 10 readings for sparkline
        const recentReadings = await prisma.noiseReading.findMany({
          where: { stationId: st.id },
          orderBy: { recordedAt: 'desc' },
          take: 12,
          select: { dba: true, recordedAt: true }
        });

        const activeThreshold = isNight ? st.nightThresholdDba : st.dayThresholdDba;
        const currentDba = st.lastReadingDba || (stats._avg.dba ? parseFloat(stats._avg.dba.toFixed(1)) : 55.0);

        let severity = 'SAFE';
        if (currentDba >= 80) severity = 'CRITICAL';
        else if (currentDba >= 70) severity = 'HIGH';
        else if (currentDba >= 55) severity = 'MODERATE';

        return {
          ...st,
          currentDba,
          activeThreshold,
          isNight,
          severity,
          isViolating: currentDba > activeThreshold,
          stats24h: {
            avgDba: stats._avg.dba ? parseFloat(stats._avg.dba.toFixed(1)) : currentDba,
            maxDba: stats._max.dba ? parseFloat(stats._max.dba.toFixed(1)) : currentDba + 6,
            minDba: stats._min.dba ? parseFloat(stats._min.dba.toFixed(1)) : Math.max(35, currentDba - 8),
            readingsCount: stats._count.id,
            violationsCount: violations
          },
          sparkline: recentReadings.reverse().map(r => r.dba)
        };
      })
    );

    return res.json({ stations: enhanced });
  } catch (error) {
    console.error('Get stations error:', error);
    return res.status(500).json({ error: 'Failed to retrieve monitoring stations' });
  }
};

export const getStationById = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await prisma.monitoringStation.findUnique({
      where: { id },
      include: {
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!station) {
      return res.status(404).json({ error: 'Monitoring station not found' });
    }

    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Hourly aggregated readings over last 24h
    const readings = await prisma.noiseReading.findMany({
      where: {
        stationId: station.id,
        recordedAt: { gte: past24h }
      },
      orderBy: { recordedAt: 'asc' }
    });

    return res.json({
      station,
      readings
    });
  } catch (error) {
    console.error('Get station by id error:', error);
    return res.status(500).json({ error: 'Failed to retrieve station details' });
  }
};

export const createStation = async (req, res) => {
  try {
    const {
      stationCode,
      name,
      zoneType,
      latitude,
      longitude,
      dayThresholdDba = 65.0,
      nightThresholdDba = 55.0,
      address,
      description
    } = req.body;

    if (!stationCode || !name || !latitude || !longitude || !address) {
      return res.status(400).json({ error: 'Station code, name, latitude, longitude, and address are required' });
    }

    const existing = await prisma.monitoringStation.findUnique({ where: { stationCode } });
    if (existing) {
      return res.status(409).json({ error: 'Station code already in use' });
    }

    const station = await prisma.monitoringStation.create({
      data: {
        stationCode,
        name,
        zoneType: zoneType || 'COMMERCIAL',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        dayThresholdDba: parseFloat(dayThresholdDba),
        nightThresholdDba: parseFloat(nightThresholdDba),
        address,
        description,
        status: 'ONLINE',
        lastReadingDba: 52.0,
        lastUpdated: new Date()
      }
    });

    return res.status(201).json({
      message: 'Monitoring station created successfully',
      station
    });
  } catch (error) {
    console.error('Create station error:', error);
    return res.status(500).json({ error: 'Failed to create monitoring station' });
  }
};

export const updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      zoneType,
      latitude,
      longitude,
      dayThresholdDba,
      nightThresholdDba,
      address,
      description,
      status
    } = req.body;

    const station = await prisma.monitoringStation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(zoneType && { zoneType }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(dayThresholdDba !== undefined && { dayThresholdDba: parseFloat(dayThresholdDba) }),
        ...(nightThresholdDba !== undefined && { nightThresholdDba: parseFloat(nightThresholdDba) }),
        ...(address && { address }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });

    return res.json({
      message: 'Monitoring station updated successfully',
      station
    });
  } catch (error) {
    console.error('Update station error:', error);
    return res.status(500).json({ error: 'Failed to update monitoring station' });
  }
};

export const deleteStation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.monitoringStation.delete({ where: { id } });
    return res.json({ message: 'Monitoring station deleted successfully' });
  } catch (error) {
    console.error('Delete station error:', error);
    return res.status(500).json({ error: 'Failed to delete monitoring station' });
  }
};
