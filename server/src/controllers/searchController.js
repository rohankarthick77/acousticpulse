import prisma from '../prisma.js';

export const globalSearch = async (req, res) => {
  try {
    const { q = '' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const query = q.trim();

    const [stations, complaints, alerts] = await Promise.all([
      prisma.monitoringStation.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { stationCode: { contains: query } },
            { address: { contains: query } },
            { zoneType: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          name: true,
          stationCode: true,
          address: true,
          zoneType: true,
          lastReadingDba: true,
          status: true
        }
      }),
      prisma.noiseComplaint.findMany({
        where: {
          OR: [
            { trackingId: { contains: query } },
            { title: { contains: query } },
            { locationAddress: { contains: query } },
            { sourceCategory: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          trackingId: true,
          title: true,
          sourceCategory: true,
          status: true,
          severity: true,
          locationAddress: true
        }
      }),
      prisma.noiseAlert.findMany({
        where: {
          OR: [
            { message: { contains: query } },
            { location: { contains: query } },
            { alertType: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          message: true,
          severity: true,
          location: true,
          dba: true,
          isResolved: true
        }
      })
    ]);

    const results = [
      ...stations.map(s => ({
        id: s.id,
        type: 'STATION',
        title: s.name,
        subtitle: `${s.stationCode} • ${s.zoneType} • ${s.lastReadingDba} dBA`,
        link: `/stations`,
        badge: s.status
      })),
      ...complaints.map(c => ({
        id: c.id,
        type: 'COMPLAINT',
        title: `${c.trackingId}: ${c.title}`,
        subtitle: `${c.sourceCategory} • ${c.locationAddress}`,
        link: `/complaints/${c.id}`,
        badge: c.status
      })),
      ...alerts.map(a => ({
        id: a.id,
        type: 'ALERT',
        title: a.message,
        subtitle: `${a.location} • ${a.dba ? a.dba + ' dBA' : ''}`,
        link: `/alerts`,
        badge: a.severity
      }))
    ];

    return res.json({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
};
