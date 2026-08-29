import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { tickStationSimulations } from './services/noiseSimulationService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import noiseRoutes from './routes/noiseRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AcousticPulse Urban Noise Intelligence Backend',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/noise', noiseRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Express Server
const server = app.listen(config.port, () => {
  console.log(`🚀 AcousticPulse API Server running on http://localhost:${config.port}`);

  // Start background live noise simulation interval
  setInterval(() => {
    tickStationSimulations();
  }, config.simulationIntervalMs);
});

export default app;
