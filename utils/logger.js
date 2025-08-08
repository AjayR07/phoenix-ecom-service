const winston = require('winston');

// Create a Winston logger instance with basic New Relic integration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.NEW_RELIC_APP_NAME || 'ecommerce-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    }),
    
    // File transport for persistent logging
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Add New Relic custom attributes to logs
const addNewRelicContext = (logData) => {
  if (global.newrelic && typeof global.newrelic.getLinkingMetadata === 'function') {
    try {
      const linkingMetadata = global.newrelic.getLinkingMetadata();
      return { ...logData, ...linkingMetadata };
    } catch (error) {
      // Silently fail if New Relic is not available
    }
  }
  return logData;
};

// Enhanced logging methods with New Relic integration
const enhancedLogger = {
  info: (message, meta = {}) => {
    const enrichedMeta = addNewRelicContext(meta);
    logger.info(message, enrichedMeta);
  },
  
  error: (message, error = null, meta = {}) => {
    const enrichedMeta = addNewRelicContext({
      ...meta,
      ...(error && { 
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    });
    
    logger.error(message, enrichedMeta);
    
    // Also record error in New Relic
    if (error && global.newrelic && typeof global.newrelic.recordError === 'function') {
      try {
        global.newrelic.recordError(error);
      } catch (nrError) {
        logger.warn('Failed to record error in New Relic', { error: nrError.message });
      }
    }
  },
  
  warn: (message, meta = {}) => {
    const enrichedMeta = addNewRelicContext(meta);
    logger.warn(message, enrichedMeta);
  },
  
  debug: (message, meta = {}) => {
    const enrichedMeta = addNewRelicContext(meta);
    logger.debug(message, enrichedMeta);
  },
  
  // HTTP request logging
  logRequest: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length') || 0
    };
    
    const level = res.statusCode >= 400 ? 'error' : 'info';
    enhancedLogger[level](`${req.method} ${req.originalUrl} - ${res.statusCode}`, logData);
  },
  
  // Database operation logging
  logDbOperation: (operation, table, duration, error = null) => {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`
    };
    
    if (error) {
      enhancedLogger.error(`Database ${operation} failed on ${table}`, error, logData);
    } else {
      enhancedLogger.info(`Database ${operation} completed on ${table}`, logData);
    }
  }
};

module.exports = enhancedLogger;