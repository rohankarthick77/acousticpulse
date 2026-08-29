import prisma from '../prisma.js';

/**
 * Generates tracking ID e.g. AP-2026-004821
 */
function generateTrackingId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `AP-${year}-${randomNum}`;
}

export const getComplaints = async (req, res) => {
  try {
    const { status, category, severity, search, limit = 50, page = 1, myOnly } = req.query;

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.sourceCategory = category;
    if (severity && severity !== 'ALL') where.severity = severity;

    // Filter by logged-in citizen if citizen or requested
    if (myOnly === 'true' && req.user) {
      where.citizenId = req.user.id;
    }

    if (search) {
      where.OR = [
        { trackingId: { contains: search } },
        { title: { contains: search } },
        { locationAddress: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, totalCount, statusCounts] = await Promise.all([
      prisma.noiseComplaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          assignedOfficer: {
            select: { id: true, name: true, badgeNumber: true, email: true, department: true }
          },
          citizen: {
            select: { id: true, name: true, email: true, phone: true }
          },
          timeline: {
            orderBy: { createdAt: 'asc' },
            take: 1
          }
        }
      }),
      prisma.noiseComplaint.count({ where }),
      prisma.noiseComplaint.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);

    const countsMap = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      VERIFIED: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
      CLOSED: 0
    };

    statusCounts.forEach(sc => {
      countsMap[sc.status] = sc._count.id;
    });

    return res.json({
      complaints,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      counts: countsMap
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    return res.status(500).json({ error: 'Failed to retrieve complaints' });
  }
};

export const getComplaintByIdOrTracking = async (req, res) => {
  try {
    const { identifier } = req.params;

    const complaint = await prisma.noiseComplaint.findFirst({
      where: {
        OR: [
          { id: identifier },
          { trackingId: identifier }
        ]
      },
      include: {
        assignedOfficer: {
          select: { id: true, name: true, email: true, badgeNumber: true, department: true }
        },
        citizen: {
          select: { id: true, name: true, email: true, phone: true }
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, role: true, badgeNumber: true }
            }
          }
        }
      }
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    return res.json({ complaint });
  } catch (error) {
    console.error('Get complaint detail error:', error);
    return res.status(500).json({ error: 'Failed to retrieve complaint' });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      sourceCategory,
      locationAddress,
      latitude,
      longitude,
      severity = 'MODERATE',
      description,
      evidenceUrl,
      audioSampleUrl,
      citizenName,
      citizenEmail,
      citizenPhone
    } = req.body;

    if (!title || !sourceCategory || !locationAddress || !description) {
      return res.status(400).json({ error: 'Title, category, location address, and description are required' });
    }

    const trackingId = generateTrackingId();
    const citizenId = req.user ? req.user.id : null;

    const complaint = await prisma.noiseComplaint.create({
      data: {
        trackingId,
        citizenId,
        citizenName: req.user ? req.user.name : (citizenName || 'Anonymous Resident'),
        citizenEmail: req.user ? req.user.email : citizenEmail,
        citizenPhone: req.user ? req.user.phone : citizenPhone,
        title,
        sourceCategory,
        locationAddress,
        latitude: latitude ? parseFloat(latitude) : 13.0827,
        longitude: longitude ? parseFloat(longitude) : 80.2707,
        severity,
        description,
        evidenceUrl: evidenceUrl || null,
        audioSampleUrl: audioSampleUrl || null,
        status: 'SUBMITTED',
        timeline: {
          create: {
            authorId: citizenId,
            fromStatus: 'NONE',
            toStatus: 'SUBMITTED',
            actionNote: 'Complaint registered in AcousticPulse citizen portal.'
          }
        }
      },
      include: {
        timeline: true
      }
    });

    // Create system notification for authorities
    await prisma.notification.create({
      data: {
        title: 'New Citizen Noise Complaint',
        message: `Tracking ID #${trackingId}: ${title} reported at ${locationAddress}.`,
        type: 'COMPLAINT',
        link: `/complaints/${complaint.id}`
      }
    });

    return res.status(201).json({
      message: 'Complaint submitted successfully',
      trackingId: complaint.trackingId,
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    return res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      assignedOfficerId,
      actionNote,
      resolutionNotes,
      beforeDba,
      afterDba
    } = req.body;

    const existing = await prisma.noiseComplaint.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedOfficerId !== undefined) updateData.assignedOfficerId = assignedOfficerId || null;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (beforeDba !== undefined) updateData.beforeDba = parseFloat(beforeDba);
    if (afterDba !== undefined) updateData.afterDba = parseFloat(afterDba);
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const updated = await prisma.noiseComplaint.update({
      where: { id },
      data: updateData,
      include: {
        assignedOfficer: true
      }
    });

    // Record timeline step
    const fromStatus = existing.status;
    const toStatus = status || existing.status;
    const note = actionNote || `Status updated from ${fromStatus} to ${toStatus}`;

    await prisma.complaintTimeline.create({
      data: {
        complaintId: id,
        authorId: req.user ? req.user.id : null,
        fromStatus,
        toStatus,
        actionNote: note
      }
    });

    return res.json({
      message: 'Complaint updated successfully',
      complaint: updated
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    return res.status(500).json({ error: 'Failed to update complaint' });
  }
};

export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.noiseComplaint.delete({ where: { id } });
    return res.json({ message: 'Complaint removed successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    return res.status(500).json({ error: 'Failed to delete complaint' });
  }
};
