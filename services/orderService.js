const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class OrderService {
  // Create a new order
  async createOrder(orderData) {
    const orderId = uuidv4();
    const dbStartTime = Date.now();
    
    logger.info('Order creation started', {
      operation: 'createOrder',
      orderId,
      customerEmail: orderData.customer_email,
      itemCount: orderData.items?.length || 0
    });
    
    const trx = await db.transaction();
    
    try {
      // Validate product availability and calculate total
      let totalAmount = 0;
      const orderItems = [];
      const productValidationResults = [];
      
      logger.info('Starting product validation', {
        operation: 'createOrder',
        orderId,
        productsToValidate: orderData.items.map(item => ({
          productId: item.product_id,
          requestedQuantity: item.quantity
        }))
      });
      
      for (const item of orderData.items) {
        const productQueryStart = Date.now();
        const product = await trx('products')
          .where('id', item.product_id)
          .where('is_active', true)
          .first();
        
        const productQueryTime = Date.now() - productQueryStart;
        logger.logDbOperation('SELECT', 'products', productQueryTime);
          
        if (!product) {
          logger.error('Product not found during order creation', new Error(`Product with ID ${item.product_id} not found or inactive`), {
            operation: 'createOrder',
            orderId,
            productId: item.product_id,
            requestedQuantity: item.quantity
          });
          throw new Error(`Product with ID ${item.product_id} not found or inactive`);
        }
        
        if (product.stock_quantity < item.quantity) {
          logger.error('Insufficient stock during order creation', new Error(`Insufficient stock for product ${product.name}`), {
            operation: 'createOrder',
            orderId,
            productId: item.product_id,
            productName: product.name,
            availableStock: product.stock_quantity,
            requestedQuantity: item.quantity
          });
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
        }
        
        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;
        
        productValidationResults.push({
          productId: item.product_id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          itemTotal,
          stockBefore: product.stock_quantity,
          stockAfter: product.stock_quantity - item.quantity
        });
        
        orderItems.push({
          id: uuidv4(),
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
          total_price: itemTotal
        });
        
        // Update product stock
        const stockUpdateStart = Date.now();
        await trx('products')
          .where('id', item.product_id)
          .decrement('stock_quantity', item.quantity);
        
        const stockUpdateTime = Date.now() - stockUpdateStart;
        logger.logDbOperation('UPDATE', 'products', stockUpdateTime);
      }
      
      logger.info('Product validation completed', {
        operation: 'createOrder',
        orderId,
        validationResults: productValidationResults,
        subtotal: totalAmount
      });
      
      // Calculate tax and shipping (simplified calculation)
      const taxRate = 0.08; // 8% tax
      const taxAmount = totalAmount * taxRate;
      const shippingAmount = totalAmount > 100 ? 0 : 9.99; // Free shipping over $100
      const finalTotal = totalAmount + taxAmount + shippingAmount;
      
      logger.info('Order totals calculated', {
        operation: 'createOrder',
        orderId,
        subtotal: totalAmount,
        taxRate,
        taxAmount,
        shippingAmount,
        finalTotal,
        freeShippingApplied: totalAmount > 100
      });
      
      // Create order
      const order = {
        id: orderId,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address || orderData.shipping_address,
        total_amount: finalTotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        payment_method: orderData.payment_method,
        status: 'pending',
        payment_status: 'pending'
      };
      
      const orderInsertStart = Date.now();
      await trx('orders').insert(order);
      const orderInsertTime = Date.now() - orderInsertStart;
      logger.logDbOperation('INSERT', 'orders', orderInsertTime);
      
      const itemsInsertStart = Date.now();
      await trx('order_items').insert(orderItems);
      const itemsInsertTime = Date.now() - itemsInsertStart;
      logger.logDbOperation('INSERT', 'order_items', itemsInsertTime);
      
      await trx.commit();
      
      const totalDbTime = Date.now() - dbStartTime;
      logger.info('Order created successfully in database', {
        operation: 'createOrder',
        orderId,
        customerEmail: orderData.customer_email,
        totalAmount: finalTotal,
        itemCount: orderItems.length,
        totalDbTime: `${totalDbTime}ms`,
        status: 'pending'
      });
      
      // Fetch complete order with items
      const completeOrder = await this.getOrderById(orderId);
      
      logger.info('Complete order fetched', {
        operation: 'createOrder',
        orderId,
        orderItemsCount: completeOrder.items?.length || 0
      });
      
      return completeOrder;
      
    } catch (error) {
      const rollbackStart = Date.now();
      await trx.rollback();
      const rollbackTime = Date.now() - rollbackStart;
      
      logger.error('Order creation failed, transaction rolled back', error, {
        operation: 'createOrder',
        orderId,
        customerEmail: orderData.customer_email,
        rollbackTime: `${rollbackTime}ms`,
        totalDbTime: `${Date.now() - dbStartTime}ms`
      });
      
      throw error;
    }
  }
  
  // Get order by ID with items
  async getOrderById(orderId) {
    const queryStart = Date.now();
    
    logger.info('Fetching order by ID', {
      operation: 'getOrderById',
      orderId
    });
    
    const orderQueryStart = Date.now();
    const order = await db('orders').where('id', orderId).first();
    const orderQueryTime = Date.now() - orderQueryStart;
    logger.logDbOperation('SELECT', 'orders', orderQueryTime);
    
    if (!order) {
      logger.warn('Order not found', {
        operation: 'getOrderById',
        orderId
      });
      return null;
    }
    
    const itemsQueryStart = Date.now();
    const items = await db('order_items')
      .join('products', 'order_items.product_id', 'products.id')
      .where('order_items.order_id', orderId)
      .select(
        'order_items.*',
        'products.name as product_name',
        'products.description as product_description',
        'products.image_url as product_image'
      );
    const itemsQueryTime = Date.now() - itemsQueryStart;
    logger.logDbOperation('SELECT', 'order_items JOIN products', itemsQueryTime);
    
    const totalQueryTime = Date.now() - queryStart;
    logger.info('Order fetched successfully', {
      operation: 'getOrderById',
      orderId,
      customerEmail: order.customer_email,
      status: order.status,
      totalAmount: order.total_amount,
      itemCount: items.length,
      totalQueryTime: `${totalQueryTime}ms`
    });
    
    return {
      ...order,
      items
    };
  }
  
  // Get orders with filtering and pagination
  async getOrders(filters = {}) {
    const { customer_email, status, payment_status, limit = 10, offset = 0 } = filters;
    
    let query = db('orders').select('*');
    
    if (customer_email) {
      query = query.where('customer_email', customer_email);
    }
    
    if (status) {
      query = query.where('status', status);
    }
    
    if (payment_status) {
      query = query.where('payment_status', payment_status);
    }
    
    const orders = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    let countQuery = db('orders').count('* as total');
    
    if (customer_email) {
      countQuery = countQuery.where('customer_email', customer_email);
    }
    
    if (status) {
      countQuery = countQuery.where('status', status);
    }
    
    if (payment_status) {
      countQuery = countQuery.where('payment_status', payment_status);
    }
    
    const [{ total }] = await countQuery;
    
    return {
      orders,
      pagination: {
        total: parseInt(total),
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }
  
  // Update order status
  async updateOrderStatus(orderId, statusData) {
    const updated = await db('orders')
      .where('id', orderId)
      .update({
        ...statusData,
        updated_at: new Date()
      });
    
    if (updated === 0) {
      return null;
    }
    
    return await this.getOrderById(orderId);
  }
  
  // Get products (for listing available products)
  async getProducts(filters = {}) {
    let query = db('products').where('is_active', true);
    
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    
    return await query.orderBy('name');
  }
  
  // Get product by ID
  async getProductById(productId) {
    return await db('products')
      .where('id', productId)
      .where('is_active', true)
      .first();
  }
}

module.exports = new OrderService();
