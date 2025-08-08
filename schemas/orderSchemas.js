const { z } = require('zod');

// Order item schema
const OrderItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
});

// Create order schema
const CreateOrderSchema = z.object({
  customer_email: z.string().email('Invalid email format'),
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name cannot exceed 100 characters'),
  shipping_address: z.string().min(10, 'Shipping address must be at least 10 characters').max(500, 'Shipping address cannot exceed 500 characters'),
  billing_address: z.string().min(10, 'Billing address must be at least 10 characters').max(500, 'Billing address cannot exceed 500 characters').optional(),
  payment_method: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item').max(50, 'Order cannot contain more than 50 items'),
});

// Update order status schema
const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid order status' })
  }),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded'], {
    errorMap: () => ({ message: 'Invalid payment status' })
  }).optional(),
});

// Query parameters schema
const OrderQuerySchema = z.object({
  customer_email: z.string().email().optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(0)).optional(),
});

module.exports = {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  OrderQuerySchema,
  OrderItemSchema
};
