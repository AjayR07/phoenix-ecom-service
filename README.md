# E-commerce Order API

A robust REST API for managing e-commerce orders with Zod validation, Knex.js database operations, and New Relic observability.

## Features

- 🛒 **Order Management**: Place orders, view order details, update order status
- 📦 **Product Catalog**: Browse available products
- ✅ **Input Validation**: Comprehensive validation using Zod schemas
- 🗄️ **Database**: MySQL with Knex.js query builder and migrations
- 📊 **Observability**: New Relic monitoring with custom metrics
- 🔒 **Security**: Helmet.js security headers and CORS support
- 🌱 **Seed Data**: Pre-populated sample products and orders

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Knex.js
- **Validation**: Zod
- **Monitoring**: New Relic
- **Security**: Helmet.js, CORS

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- New Relic account (optional, for monitoring)

## Installation

1. **Clone and install dependencies**:
```bash
cd /path/to/ecom-service
npm install
```

2. **Set up MySQL database**:
```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecom_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecom_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configure environment variables**:
Update the `.env` file with your database credentials and New Relic license key.

4. **Run database migrations and seeds**:
```bash
npm run db:migrate
npm run db:seed
```

5. **Start the application**:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID

### Orders
- `POST /api/orders` - Place a new order
- `GET /api/orders` - List orders (with filtering)
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status

### System
- `GET /` - API info
- `GET /health` - Health check with database status

## Database Schema

### Products Table
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `description` (Text)
- `price` (Decimal, Required)
- `stock_quantity` (Integer)
- `category` (String)
- `image_url` (String)
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### Orders Table
- `id` (UUID, Primary Key)
- `customer_email` (String, Required)
- `customer_name` (String, Required)
- `shipping_address` (Text, Required)
- `billing_address` (Text)
- `total_amount` (Decimal, Required)
- `tax_amount` (Decimal)
- `shipping_amount` (Decimal)
- `status` (Enum: pending, confirmed, processing, shipped, delivered, cancelled)
- `payment_status` (Enum: pending, paid, failed, refunded)
- `payment_method` (String)
- `created_at`, `updated_at` (Timestamps)

### Order Items Table
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (Integer, Required)
- `unit_price` (Decimal, Required)
- `total_price` (Decimal, Required)
- `created_at`, `updated_at` (Timestamps)

## Validation Rules

### Create Order
- `customer_email`: Valid email format
- `customer_name`: 2-100 characters
- `shipping_address`: 10-500 characters
- `payment_method`: One of: credit_card, debit_card, paypal, stripe, cash_on_delivery
- `items`: Array of 1-50 items, each with valid product_id and quantity (1-100)

## Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `500` - Internal Server Error
- `503` - Service Unavailable (database issues)

## New Relic Monitoring

The application includes comprehensive New Relic monitoring:

### Custom Metrics
- `Custom/Order/PlaceOrder` - Order placement attempts
- `Custom/Order/PlaceOrder/ResponseTime` - Order placement response time
- `Custom/Order/PlaceOrder/Error` - Order placement errors
- `Custom/Order/GetOrder` - Order retrieval requests
- `Custom/Product/GetProducts` - Product listing requests

### Custom Attributes
- Request method and path
- User agent information
- Error details and stack traces

## Development Commands

```bash
# Database operations
npm run db:migrate          # Run pending migrations
npm run db:rollback         # Rollback last migration
npm run db:seed            # Run seed files
npm run db:reset           # Reset database (rollback all + migrate + seed)

# Application
npm run dev                # Start with nodemon (development)
npm start                  # Start normally (production)
```

## Sample Data

The seed includes 8 sample products:
- Gaming Laptop ($1,299.99)
- Wireless Gaming Mouse ($79.99)
- Mechanical Keyboard ($149.99)
- 4K Gaming Monitor ($599.99)
- Noise-Cancelling Headphones ($299.99)
- Android Tablet ($399.99)
- Flagship Smartphone ($899.99)
- Bluetooth Speaker ($129.99)

And 3 sample orders with different statuses for testing.

## Order Flow

1. **Order Placement**: Validates inventory, calculates totals, creates order and items
2. **Stock Management**: Automatically decreases product stock quantities
3. **Tax Calculation**: 8% tax rate applied to all orders
4. **Shipping Calculation**: Free shipping over $100, otherwise $9.99
5. **Status Tracking**: Orders progress through: pending → confirmed → processing → shipped → delivered

## Contributing

1. Follow the existing code structure
2. Add appropriate validation for new endpoints
3. Include New Relic metrics for new features
4. Update this README for any new functionality

## License

ISC
