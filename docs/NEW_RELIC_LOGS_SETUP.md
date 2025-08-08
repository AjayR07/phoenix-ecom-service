# New Relic Logs Setup Documentation

## Overview
This document describes the New Relic logs integration setup for the ecommerce-api service. The setup enables automatic log forwarding to New Relic for centralized logging, monitoring, and alerting.

## Features Implemented

### 1. Enhanced New Relic Configuration
- **File**: `newrelic.js`
- **Features**:
  - Application logging enabled
  - Log forwarding to New Relic
  - Local log decoration with trace correlation
  - Configurable log levels and sample limits

### 2. Winston Logger Integration
- **File**: `utils/logger.js`
- **Features**:
  - Structured JSON logging
  - New Relic log enrichment with trace correlation
  - Multiple transport options (console, file, New Relic)
  - Automatic error recording in New Relic
  - Request/response logging
  - Database operation logging

### 3. Application Integration
- **Files**: `index.js`, `middleware/errorHandler.js`
- **Features**:
  - Request/response logging with timing
  - Enhanced error handling with context
  - Health check logging
  - Graceful shutdown logging

## Configuration

### Environment Variables
```bash
NEW_RELIC_LICENSE_KEY=your_license_key_here
NEW_RELIC_APP_NAME=ecommerce-api
NEW_RELIC_LOG_LEVEL=info
LOG_LEVEL=info
NODE_ENV=development
```

### Log Levels
- `error`: Error messages and exceptions
- `warn`: Warning messages
- `info`: General information (default)
- `debug`: Detailed debugging information
- `trace`: Most verbose logging

## Log Structure

### Standard Log Format
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "Request completed",
  "service": "ecommerce-api",
  "environment": "development",
  "trace.id": "abc123",
  "span.id": "def456",
  "method": "GET",
  "url": "/api/orders",
  "statusCode": 200,
  "responseTime": "45ms"
}
```

### Error Log Format
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "service": "ecommerce-api",
  "environment": "development",
  "trace.id": "abc123",
  "span.id": "def456",
  "error": {
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at ...",
    "name": "ConnectionError"
  },
  "method": "POST",
  "url": "/api/orders"
}
```

## Log Files

### Local Log Files
- `logs/combined.log`: All log levels
- `logs/error.log`: Error level only
- `logs/exceptions.log`: Uncaught exceptions
- `logs/rejections.log`: Unhandled promise rejections

### Log Rotation
- Maximum file size: 5MB
- Maximum files kept: 5
- Automatic rotation when size limit is reached

## Usage Examples

### Basic Logging
```javascript
const logger = require('./utils/logger');

// Info logging
logger.info('User created successfully', { userId: 123, email: 'user@example.com' });

// Error logging
logger.error('Failed to create user', error, { userId: 123 });

// Warning logging
logger.warn('Rate limit approaching', { currentRequests: 95, limit: 100 });
```

### Request Logging
```javascript
// Automatic request logging (already implemented in middleware)
// Logs: method, URL, status code, response time, user agent, IP
```

### Database Operation Logging
```javascript
const logger = require('./utils/logger');

// Log database operations
logger.logDbOperation('SELECT', 'users', 25); // Success
logger.logDbOperation('INSERT', 'orders', 150, error); // With error
```

## New Relic Dashboard

### Log Queries
```sql
-- All application logs
SELECT * FROM Log WHERE service.name = 'ecommerce-api'

-- Error logs only
SELECT * FROM Log WHERE service.name = 'ecommerce-api' AND level = 'error'

-- Slow requests (>1000ms)
SELECT * FROM Log WHERE service.name = 'ecommerce-api' AND responseTime > 1000

-- Database errors
SELECT * FROM Log WHERE service.name = 'ecommerce-api' AND message LIKE '%Database%' AND level = 'error'
```

### Alerts Setup
1. **High Error Rate**: Alert when error rate > 5% in 5 minutes
2. **Slow Responses**: Alert when average response time > 2000ms
3. **Database Issues**: Alert on database connection errors
4. **Application Crashes**: Alert on uncaught exceptions

## Monitoring Best Practices

### 1. Log Levels in Production
- Set `LOG_LEVEL=info` or `LOG_LEVEL=warn` in production
- Use `debug` only for troubleshooting
- Avoid `trace` in production due to performance impact

### 2. Sensitive Data
- Never log passwords, API keys, or personal data
- Use the configured exclusion patterns in `newrelic.js`
- Sanitize request/response data before logging

### 3. Performance Considerations
- Log forwarding is asynchronous and won't block requests
- Local file logging provides backup if New Relic is unavailable
- Log rotation prevents disk space issues

## Troubleshooting

### Common Issues

#### 1. Logs Not Appearing in New Relic
- Check `NEW_RELIC_LICENSE_KEY` is valid
- Verify `application_logging.enabled: true` in `newrelic.js`
- Check network connectivity to New Relic
- Review `newrelic_agent.log` for errors

#### 2. High Log Volume
- Increase `max_samples_stored` in `newrelic.js`
- Adjust log levels to reduce verbosity
- Implement log sampling for high-traffic endpoints

#### 3. Missing Trace Correlation
- Ensure New Relic agent is loaded before logger
- Check that `@newrelic/winston-enricher` is properly installed
- Verify distributed tracing is enabled

### Debug Commands
```bash
# Check New Relic agent status
tail -f newrelic_agent.log

# Monitor local log files
tail -f logs/combined.log

# Test log forwarding
npm start
curl http://localhost:3000/health
```

## Dependencies
- `winston`: Logging framework
- `@newrelic/winston-enricher`: New Relic log enrichment
- `newrelic`: New Relic APM agent

## Next Steps
1. Set up New Relic alerts based on log patterns
2. Create custom dashboards for application metrics
3. Implement log-based SLI/SLO monitoring
4. Add business-specific logging for key operations