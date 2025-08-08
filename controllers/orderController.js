const orderService = require('../services/orderService');
const logger = require('../utils/logger');

// Helper function to safely record New Relic metrics
const recordMetric = (metricName, value = 1) => {
  if (global.newrelic && typeof global.newrelic.recordMetric === 'function') {
    try {
      global.newrelic.recordMetric(metricName, value);
    } catch (error) {
      logger.warn(`Failed to record metric ${metricName}`, { error: error.message });
    }
  }
};

const recordError = (error) => {
  if (global.newrelic && typeof global.newrelic.recordError === 'function') {
    try {
      global.newrelic.recordError(error);
    } catch (nrError) {
      logger.warn('Failed to record error in New Relic', { error: nrError.message });
    }
  }
};

class OrderController {
  // Place a new order
  async placeOrder(req, res, next) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log order placement start
    logger.info('Order placement started', {
      requestId,
      operation: 'placeOrder',
      customerEmail: req.validatedBody.customer_email,
      customerName: req.validatedBody.customer_name,
      itemCount: req.validatedBody.items?.length || 0,
      paymentMethod: req.validatedBody.payment_method,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });

    try {
      // Record custom New Relic metric
      recordMetric('Custom/Order/PlaceOrder');
      
      // Log order validation details
      logger.info('Order validation passed', {
        requestId,
        operation: 'placeOrder',
        validatedItems: req.validatedBody.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity
        }))
      });
      
      const order = await orderService.createOrder(req.validatedBody);
      
      // Record response time
      const responseTime = Date.now() - startTime;
      recordMetric('Custom/Order/PlaceOrder/ResponseTime', responseTime);
      
      // Log successful order creation
      logger.info('Order placed successfully', {
        requestId,
        operation: 'placeOrder',
        orderId: order.id,
        customerEmail: order.customer_email,
        totalAmount: order.total_amount,
        itemCount: order.items?.length || 0,
        responseTime: `${responseTime}ms`,
        status: order.status,
        paymentStatus: order.payment_status
      });
      
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record error metric
      recordMetric('Custom/Order/PlaceOrder/Error');
      recordError(error);
      
      // Enhanced error logging with context
      logger.error('Order placement failed', error, {
        requestId,
        operation: 'placeOrder',
        customerEmail: req.validatedBody.customer_email,
        customerName: req.validatedBody.customer_name,
        itemCount: req.validatedBody.items?.length || 0,
        paymentMethod: req.validatedBody.payment_method,
        responseTime: `${responseTime}ms`,
        errorType: error.name,
        errorCode: error.code,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        requestBody: JSON.stringify(req.validatedBody, null, 2)
      });
      
      next(error);
    }
  }
  
  // Get order by ID
  async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      
      recordMetric('Custom/Order/GetOrder');
      
      const order = await orderService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      recordMetric('Custom/Order/GetOrder/Error');
      recordError(error);
      next(error);
    }
  }
  
  // Get orders with filtering
  async getOrders(req, res, next) {
    try {
      recordMetric('Custom/Order/GetOrders');
      
      const result = await orderService.getOrders(req.validatedQuery || {});
      
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      recordMetric('Custom/Order/GetOrders/Error');
      recordError(error);
      next(error);
    }
  }
  
  // Update order status
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      
      recordMetric('Custom/Order/UpdateStatus');
      
      const order = await orderService.updateOrderStatus(id, req.validatedBody);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      recordMetric('Custom/Order/UpdateStatus/Error');
      recordError(error);
      next(error);
    }
  }
  
  // Get products
  async getProducts(req, res, next) {
    try {
      recordMetric('Custom/Product/GetProducts');
      
      const products = await orderService.getProducts(req.query);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      recordMetric('Custom/Product/GetProducts/Error');
      recordError(error);
      next(error);
    }
  }
  
  // Get product by ID
  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      recordMetric('Custom/Product/GetProduct');
      
      const product = await orderService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      recordMetric('Custom/Product/GetProduct/Error');
      recordError(error);
      next(error);
    }
  }
}

module.exports = new OrderController();
