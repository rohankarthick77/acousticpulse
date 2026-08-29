import prisma from '../prisma.js';

export const getAlerts = async (req, res) => {
  try {
    const { severity, isResolved, limit = 50 } = req.query;

    const where = {};
    if (severity && severity !== 'ALL') where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';

    const alerts = await prisma.noiseAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        station: {
          select: {
            id: true,
            name: true,
            stationCode: true,
            zoneType: true,
            dayThresholdDba: true,
            nightThresholdDba: true
          }
        }
      }
    });

    return res.json({ alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    return res.status(500).json({ error: 'Failed to retrieve alerts' });
  }
};

export const getAlertStats = async (req, res) => {
  try {
    const activeCounts = await prisma.noiseAlert.groupBy({
      by: ['severity'],
      where: { isResolved: false },
      _count: { id: true }
    });

    const summary = {
      INFO: 0,
      WARNING: 0,
      HIGH: 0,
      CRITICAL: 0,
      totalUnresolved: 0
    };

    activeCounts.forEach(c => {
      summary[c.severity] = c._count.id;
      summary.totalUnresolved += c._count.id;
    });

    return res.json({ summary });
  } catch (error) {
    console.error('Get alert stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve alert stats' });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.noiseAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });

    return res.json({ message: 'Alert marked as resolved', alert });
  } catch (error) {
    console.error('Resolve alert error:', error);
    return res.status(500).json({ error: 'Failed to resolve alert' });
  }
};
