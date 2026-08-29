import prisma from '../prisma.js';

export const getAcousticProfiles = async (req, res) => {
  try {
    const profiles = await prisma.acousticProfile.findMany({
      orderBy: { lowerDba: 'asc' }
    });

    const stations = await prisma.monitoringStation.findMany({
      where: { status: 'ONLINE' },
      select: { id: true, name: true, address: true, lastReadingDba: true, zoneType: true }
    });

    // Classify active stations into profiles
    const enrichedProfiles = profiles.map(profile => {
      const matchingStations = stations.filter(st => {
        if (profile.upperDba >= 100) return st.lastReadingDba >= profile.lowerDba;
        return st.lastReadingDba >= profile.lowerDba && st.lastReadingDba < profile.upperDba;
      });

      const avgDba = matchingStations.length
        ? parseFloat((matchingStations.reduce((a, b) => a + b.lastReadingDba, 0) / matchingStations.length).toFixed(1))
        : profile.lowerDba + 3;

      const peakDba = matchingStations.length
        ? Math.max(...matchingStations.map(s => s.lastReadingDba))
        : profile.upperDba - 2;

      return {
        ...profile,
        locationCount: matchingStations.length,
        averageDba: avgDba,
        peakDba: peakDba,
        stations: matchingStations
      };
    });

    return res.json({ profiles: enrichedProfiles });
  } catch (error) {
    console.error('Get acoustic profiles error:', error);
    return res.status(500).json({ error: 'Failed to retrieve acoustic profiles' });
  }
};
