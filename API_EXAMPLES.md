# Sample API Requests for Testing

## 1. Get All Products
```bash
curl -X GET http://localhost:3000/api/products
```

## 2. Get Specific Product
```bash
curl -X GET http://localhost:3000/api/products/{product-id}
```

## 3. Place an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "customer_name": "John Doe",
    "shipping_address": "123 Main St, City, State 12345",
    "billing_address": "123 Main St, City, State 12345",
    "payment_method": "credit_card",
    "items": [
      {
        "product_id": "product-uuid-here",
        "quantity": 2
      }
    ]
  }'
```

## 4. Get Order by ID
```bash
curl -X GET http://localhost:3000/api/orders/{order-id}
```

## 5. Get All Orders (with filters)
```bash
curl -X GET "http://localhost:3000/api/orders?customer_email=test@example.com&status=pending&limit=10"
```

## 6. Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/{order-id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "payment_status": "paid"
  }'
```

## 7. Health Check
```bash
curl -X GET http://localhost:3000/health
```

## Database Setup Commands

Before running the application, make sure to set up your MySQL database:

1. Create the database:
```sql
CREATE DATABASE ecommerce_db;
```

2. Update the `.env` file with your MySQL credentials

3. Run migrations and seeds:
```bash
npm run db:migrate
npm run db:seed
```

4. Start the application:
```bash
npm run dev
```

## Sample Order Request with Real Product IDs

After running the seeds, you can use the product IDs from the database:

```javascript
{
  "customer_email": "testuser@example.com",
  "customer_name": "Test User",
  "shipping_address": "123 Test Street, Test City, TS 12345",
  "billing_address": "123 Test Street, Test City, TS 12345",
  "payment_method": "credit_card",
  "items": [
    {
      "product_id": "get-from-products-endpoint",
      "quantity": 1
    }
  ]
}
```
