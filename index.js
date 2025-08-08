// Load environment variables first
require('dotenv').config();

// Conditionally load New Relic if license key is valid
if (process.env.NEW_RELIC_LICENSE_KEY &&
    process.env.NEW_RELIC_LICENSE_KEY !== 'your_new_relic_license_key_here' &&
    process.env.NEW_RELIC_LICENSE_KEY.length >= 40) {  // New Relic keys are typically 40 characters
  try {
    global.newrelic = require('newrelic');
    console.log('✅ New Relic monitoring enabled');
  } catch (error) {
    console.warn('⚠️  New Relic failed to initialize:', error.message);
    global.newrelic = null;
  }
} else {
  console.log('ℹ️  New Relic monitoring disabled (no valid license key provided)');
  global.newrelic = null;
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes and middleware
const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const db = require('./db/connection');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with response time tracking
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // New Relic custom attributes
  if (global.newrelic && typeof global.newrelic.addCustomAttribute === 'function') {
    try {
      global.newrelic.addCustomAttribute('requestMethod', req.method);
      global.newrelic.addCustomAttribute('requestPath', req.path);
      global.newrelic.addCustomAttribute('userAgent', req.get('User-Agent') || 'unknown');
    } catch (error) {
      logger.warn('Failed to add New Relic custom attributes', { error: error.message });
    }
  }
  
  // Log request completion
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    };
    
    logger.info('Health check passed', healthData);
    res.json(healthData);
  } catch (error) {
    const errorData = {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    };
    
    logger.error('Health check failed', error, errorData);
    res.status(503).json(errorData);
  }
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  try {
    await db.destroy();
    logger.info('Database connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    await db.destroy();
    logger.info('Database connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  logger.info('E-commerce API server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    newRelicEnabled: !!global.newrelic,
    url: `http://localhost:${PORT}`
  });
  
  // Also log to console for immediate visibility
  console.log(`🚀 E-commerce API server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 New Relic monitoring: ${global.newrelic ? 'enabled' : 'disabled'}`);
  console.log(`📝 Logs are being forwarded to New Relic`);
});