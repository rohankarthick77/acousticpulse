import prisma from '../prisma.js';

export const runSimulation = async (req, res) => {
  try {
    const {
      trafficRestriction = 0,
      heavyVehicleNightCurfew = 0,
      constructionBarriers = 0,
      industrialThrottling = 0,
      eventDecibelCap = 0
    } = req.body;

    const stations = await prisma.monitoringStation.findMany({
      where: { status: 'ONLINE' }
    });

    const baselineAvgDba = stations.length
      ? parseFloat((stations.reduce((a, b) => a + b.lastReadingDba, 0) / stations.length).toFixed(1))
      : 67.4;

    const baselinePeakDba = stations.length
      ? Math.max(...stations.map(s => s.lastReadingDba)) + 4.2
      : 84.5;

    const baselineViolations = 84;
    const baselineHealthScore = 72;
    const estimatedTotalAffectedPopulation = 320000;

    // Simulation Impact Weights
    // Traffic has largest influence (up to ~6.5 dBA reduction at 100%)
    const trafficDbaReduction = (trafficRestriction / 100) * 6.5;
    // Heavy vehicle curfew reduces night peak (~4.0 dBA)
    const curfewDbaReduction = (heavyVehicleNightCurfew / 100) * 3.8;
    // Construction barriers (~4.2 dBA)
    const constructionDbaReduction = (constructionBarriers / 100) * 4.2;
    // Industrial throttling (~3.5 dBA)
    const industrialDbaReduction = (industrialThrottling / 100) * 3.5;
    // Event decibel cap (~2.0 dBA)
    const eventDbaReduction = (eventDecibelCap / 100) * 2.0;

    const totalDbaReduction = parseFloat(
      (trafficDbaReduction + curfewDbaReduction + constructionDbaReduction + industrialDbaReduction + eventDbaReduction).toFixed(1)
    );

    const simulatedAvgDba = Math.max(38.0, parseFloat((baselineAvgDba - (totalDbaReduction * 0.7)).toFixed(1)));
    const simulatedPeakDba = Math.max(45.0, parseFloat((baselinePeakDba - totalDbaReduction).toFixed(1)));

    const violationReductionFactor = Math.min(0.92, (totalDbaReduction / 16.0));
    const simulatedViolations = Math.max(2, Math.round(baselineViolations * (1 - violationReductionFactor)));

    const healthScoreIncrease = Math.round(totalDbaReduction * 2.8);
    const simulatedHealthScore = Math.min(98, baselineHealthScore + healthScoreIncrease);

    const relievedPopulation = Math.round(estimatedTotalAffectedPopulation * (violationReductionFactor * 0.85));

    // Per station simulated impact
    const stationProjections = stations.map(st => {
      let zoneMultiplier = 1.0;
      if (st.zoneType === 'COMMERCIAL') zoneMultiplier = 1.2;
      if (st.zoneType === 'INDUSTRIAL') zoneMultiplier = 0.9;
      if (st.zoneType === 'RESIDENTIAL') zoneMultiplier = 1.4;

      const stationReduction = parseFloat((totalDbaReduction * 0.65 * zoneMultiplier).toFixed(1));
      const projectedDba = Math.max(36.0, parseFloat((st.lastReadingDba - stationReduction).toFixed(1)));

      return {
        id: st.id,
        name: st.name,
        zoneType: st.zoneType,
        currentDba: st.lastReadingDba,
        projectedDba,
        reductionDba: stationReduction
      };
    });

    return res.json({
      modelDisclaimer: 'Simulation results are generated via AcousticPulse Urban Acoustic Dispersion Algorithm and represent synthetic predictive modeling.',
      inputs: {
        trafficRestriction: Number(trafficRestriction),
        heavyVehicleNightCurfew: Number(heavyVehicleNightCurfew),
        constructionBarriers: Number(constructionBarriers),
        industrialThrottling: Number(industrialThrottling),
        eventDecibelCap: Number(eventDecibelCap)
      },
      baseline: {
        averageDba: baselineAvgDba,
        peakDba: parseFloat(baselinePeakDba.toFixed(1)),
        violations: baselineViolations,
        healthScore: baselineHealthScore,
        affectedPopulation: estimatedTotalAffectedPopulation
      },
      simulated: {
        averageDba: simulatedAvgDba,
        peakDba: simulatedPeakDba,
        violations: simulatedViolations,
        healthScore: simulatedHealthScore,
        relievedPopulation,
        totalDbaReduction
      },
      reductionsByIntervention: {
        traffic: parseFloat(trafficDbaReduction.toFixed(1)),
        heavyVehicles: parseFloat(curfewDbaReduction.toFixed(1)),
        construction: parseFloat(constructionDbaReduction.toFixed(1)),
        industrial: parseFloat(industrialDbaReduction.toFixed(1)),
        events: parseFloat(eventDbaReduction.toFixed(1))
      },
      stationProjections
    });
  } catch (error) {
    console.error('Run simulation error:', error);
    return res.status(500).json({ error: 'Failed to compute noise simulation scenario' });
  }
};
