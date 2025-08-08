const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateSchema, validateQueryParams } = require('../middleware/validation');
const { CreateOrderSchema, UpdateOrderStatusSchema, OrderQuerySchema } = require('../schemas/orderSchemas');

// Product routes
router.get('/products', orderController.getProducts);
router.get('/products/:id', orderController.getProduct);

// Order routes
router.post('/orders', validateSchema(CreateOrderSchema), orderController.placeOrder);
router.get('/orders', validateQueryParams(OrderQuerySchema), orderController.getOrders);
router.get('/orders/:id', orderController.getOrder);
router.patch('/orders/:id/status', validateSchema(UpdateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
