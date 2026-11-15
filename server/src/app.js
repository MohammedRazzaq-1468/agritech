import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, tests)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Global Rate Limiting
app.use('/api', globalLimiter);

// Root and base API status endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AgriSmart AI Backend Server Operational',
    data: {
      status: 'online',
      version: '1.0.0',
      apiV1: '/api/v1',
      health: '/api/v1/health'
    },
    error: null
  });
});

app.get('/api', (req, res) => {
  res.redirect('/api/v1');
});

// Mount API v1 Routes
app.use('/api/v1', routes);

// 404 Route Catch-All
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    data: null,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: [`The endpoint ${req.originalUrl} does not exist.`]
    }
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;

