const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error with enhanced context
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    body: req.body,
    params: req.params,
    query: req.query
  };
  
  logger.error('Could not Connect to Database Instance', err, errorContext);

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable'
    });
  }

  // Database constraint errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry detected',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Resource already exists'
    });
  }

  // Foreign key constraint errors
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: 'Referenced resource does not exist'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
};

const notFoundHandler = (req, res) => {
  const notFoundContext = {
    method: req.method,
    path: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  };
  
  logger.warn('Endpoint not found', notFoundContext);
  
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
