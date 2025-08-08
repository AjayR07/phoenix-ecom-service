// Load environment variables first
require('dotenv').config();

// Load New Relic
if (process.env.NEW_RELIC_LICENSE_KEY &&
    process.env.NEW_RELIC_LICENSE_KEY !== 'your_new_relic_license_key_here' &&
    process.env.NEW_RELIC_LICENSE_KEY.length >= 40) {
  try {
    global.newrelic = require('newrelic');
    console.log('✅ New Relic monitoring enabled for log test');
  } catch (error) {
    console.warn('⚠️  New Relic failed to initialize:', error.message);
    global.newrelic = null;
  }
} else {
  console.log('ℹ️  New Relic monitoring disabled (no valid license key provided)');
  global.newrelic = null;
}

const logger = require('./utils/logger');

console.log('🧪 Testing New Relic log forwarding...\n');

// Test different log levels
logger.info('Test INFO log - This should appear in New Relic', {
  testType: 'log_forwarding_test',
  logLevel: 'info',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
});

logger.warn('Test WARN log - This should appear in New Relic', {
  testType: 'log_forwarding_test',
  logLevel: 'warn',
  timestamp: new Date().toISOString(),
  customAttribute: 'warning_test_value'
});

logger.error('Test ERROR log - This should appear in New Relic', new Error('Test error for New Relic'), {
  testType: 'log_forwarding_test',
  logLevel: 'error',
  timestamp: new Date().toISOString(),
  errorType: 'test_error'
});

// Test with New Relic custom attributes if available
if (global.newrelic && typeof global.newrelic.addCustomAttribute === 'function') {
  try {
    global.newrelic.addCustomAttribute('testRun', 'log_forwarding_verification');
    global.newrelic.addCustomAttribute('testTimestamp', new Date().toISOString());
    logger.info('Test log with New Relic custom attributes', {
      testType: 'log_forwarding_test_with_attributes',
      hasNewRelicAttributes: true
    });
  } catch (error) {
    logger.warn('Failed to add New Relic custom attributes during test', { error: error.message });
  }
}

// Test request-like logging
logger.logRequest(
  { method: 'GET', originalUrl: '/test-endpoint', path: '/test-endpoint', get: () => 'test-agent', ip: '127.0.0.1' },
  { statusCode: 200, get: () => '1024' },
  150
);

// Test database operation logging
logger.logDbOperation('SELECT', 'test_table', 25);
logger.logDbOperation('INSERT', 'test_table', 100, new Error('Test DB error'));

console.log('\n✅ Log forwarding test completed!');
console.log('📊 Check your New Relic Logs dashboard in a few minutes to see if the logs appear.');
console.log('🔍 Look for logs with testType: "log_forwarding_test"');

// Wait a moment for logs to be sent, then exit
setTimeout(() => {
  console.log('\n🏁 Test script finished. Logs should be forwarded to New Relic.');
  process.exit(0);
}, 2000);