import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to cwd

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  jwtSecret: process.env.JWT_SECRET || 'acousticpulse_super_secret_jwt_key_2026_smart_city',
  env: process.env.NODE_ENV || 'development',
  simulationIntervalMs: 8000,
  thresholds: {
    safe: 55.0,
    moderate: 65.0,
    high: 75.0,
    critical: 85.0
  }
};
