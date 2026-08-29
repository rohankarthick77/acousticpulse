import prisma from '../prisma.js';

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        badgeNumber: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            complaints: true,
            assignedJobs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department, badgeNumber } = req.body;

    if (role && !['ADMIN', 'AUTHORITY', 'CITIZEN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(department !== undefined && { department }),
        ...(badgeNumber !== undefined && { badgeNumber })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        badgeNumber: true
      }
    });

    return res.json({ message: 'User updated successfully', user: updated });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};
