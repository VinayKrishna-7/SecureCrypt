import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import secretRoutes from './routes/secretRoutes.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect Database
connectDB();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allows frontend fetching without conflicting CSP rules
  })
);

// CORS configuration
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, raw views)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-delete-token', 'x-sender-token']
  })
);

// Body Parsers with limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Apply General Rate Limiter to all API routes
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SecureCrypt API (Zero-Knowledge View-Once)',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Secrets API routes (Zero-Knowledge E2EE)
app.use('/api/secrets', secretRoutes);

// Fallback 404 handler for undefined API routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[SecureCrypt] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle graceful shutdown
const shutdown = () => {
  console.log('\n[SecureCrypt] Shutting down server gracefully...');
  server.close(() => {
    console.log('[SecureCrypt] Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
