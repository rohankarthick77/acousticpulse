import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { config } from '../config.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'CITIZEN', department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: ['ADMIN', 'AUTHORITY', 'CITIZEN'].includes(role) ? role : 'CITIZEN',
        department: department || null,
        phone: phone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        badgeNumber: true,
        phone: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create user account' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      badgeNumber: user.badgeNumber,
      phone: user.phone,
      avatar: user.avatar
    };

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        badgeNumber: true,
        phone: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

export const getDemoAccounts = (req, res) => {
  return res.json({
    accounts: [
      {
        role: 'ADMIN',
        email: 'admin@acousticpulse.gov',
        password: 'Admin@12345',
        title: 'Municipal Administrator',
        description: 'Full administrative access to stations, settings, and users.'
      },
      {
        role: 'AUTHORITY',
        email: 'officer.chennai@acousticpulse.gov',
        password: 'Officer@12345',
        title: 'Environmental Control Officer',
        description: 'Authority access to manage complaints, violations, and resolutions.'
      },
      {
        role: 'CITIZEN',
        email: 'citizen@acousticpulse.gov',
        password: 'Citizen@12345',
        title: 'Urban Resident / Citizen',
        description: 'Citizen access to submit complaints and view public noise mapping.'
      }
    ]
  });
};
