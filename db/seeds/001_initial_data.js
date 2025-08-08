const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('order_items').del();
  await knex('orders').del();
  await knex('products').del();

  // Generate product UUIDs
  const productIds = {
    laptop: uuidv4(),
    mouse: uuidv4(),
    keyboard: uuidv4(),
    monitor: uuidv4(),
    headphones: uuidv4(),
    tablet: uuidv4(),
    smartphone: uuidv4(),
    speaker: uuidv4()
  };

  // Insert seed entries for products
  await knex('products').insert([
    {
      id: productIds.laptop,
      name: 'Gaming Laptop',
      description: 'High-performance gaming laptop with RTX graphics',
      price: 1299.99,
      stock_quantity: 25,
      category: 'Electronics',
      image_url: 'https://example.com/images/laptop.jpg',
      is_active: true
    },
    {
      id: productIds.mouse,
      name: 'Wireless Gaming Mouse',
      description: 'Precision wireless mouse for gaming',
      price: 79.99,
      stock_quantity: 100,
      category: 'Electronics',
      image_url: 'https://example.com/images/mouse.jpg',
      is_active: true
    },
    {
      id: productIds.keyboard,
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      price: 149.99,
      stock_quantity: 50,
      category: 'Electronics',
      image_url: 'https://example.com/images/keyboard.jpg',
      is_active: true
    },
    {
      id: productIds.monitor,
      name: '4K Gaming Monitor',
      description: '27-inch 4K monitor with 144Hz refresh rate',
      price: 599.99,
      stock_quantity: 30,
      category: 'Electronics',
      image_url: 'https://example.com/images/monitor.jpg',
      is_active: true
    },
    {
      id: productIds.headphones,
      name: 'Noise-Cancelling Headphones',
      description: 'Premium wireless headphones with active noise cancellation',
      price: 299.99,
      stock_quantity: 75,
      category: 'Electronics',
      image_url: 'https://example.com/images/headphones.jpg',
      is_active: true
    },
    {
      id: productIds.tablet,
      name: 'Android Tablet',
      description: '10-inch Android tablet with stylus support',
      price: 399.99,
      stock_quantity: 40,
      category: 'Electronics',
      image_url: 'https://example.com/images/tablet.jpg',
      is_active: true
    },
    {
      id: productIds.smartphone,
      name: 'Flagship Smartphone',
      description: 'Latest flagship smartphone with triple camera system',
      price: 899.99,
      stock_quantity: 60,
      category: 'Electronics',
      image_url: 'https://example.com/images/smartphone.jpg',
      is_active: true
    },
    {
      id: productIds.speaker,
      name: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker with waterproof design',
      price: 129.99,
      stock_quantity: 80,
      category: 'Electronics',
      image_url: 'https://example.com/images/speaker.jpg',
      is_active: true
    }
  ]);

  // Generate sample orders
  const orderIds = {
    order1: uuidv4(),
    order2: uuidv4(),
    order3: uuidv4()
  };

  await knex('orders').insert([
    {
      id: orderIds.order1,
      customer_email: 'john.doe@example.com',
      customer_name: 'John Doe',
      shipping_address: '123 Main St, City, State 12345',
      billing_address: '123 Main St, City, State 12345',
      total_amount: 1529.97,
      tax_amount: 122.40,
      shipping_amount: 9.99,
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'credit_card'
    },
    {
      id: orderIds.order2,
      customer_email: 'jane.smith@example.com',
      customer_name: 'Jane Smith',
      shipping_address: '456 Oak Ave, City, State 67890',
      billing_address: '456 Oak Ave, City, State 67890',
      total_amount: 729.97,
      tax_amount: 58.40,
      shipping_amount: 9.99,
      status: 'processing',
      payment_status: 'paid',
      payment_method: 'paypal'
    },
    {
      id: orderIds.order3,
      customer_email: 'bob.wilson@example.com',
      customer_name: 'Bob Wilson',
      shipping_address: '789 Pine St, City, State 13579',
      billing_address: '789 Pine St, City, State 13579',
      total_amount: 229.98,
      tax_amount: 18.40,
      shipping_amount: 9.99,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'credit_card'
    }
  ]);

  // Insert order items
  await knex('order_items').insert([
    // Order 1 items
    {
      id: uuidv4(),
      order_id: orderIds.order1,
      product_id: productIds.laptop,
      quantity: 1,
      unit_price: 1299.99,
      total_price: 1299.99
    },
    {
      id: uuidv4(),
      order_id: orderIds.order1,
      product_id: productIds.mouse,
      quantity: 1,
      unit_price: 79.99,
      total_price: 79.99
    },
    {
      id: uuidv4(),
      order_id: orderIds.order1,
      product_id: productIds.keyboard,
      quantity: 1,
      unit_price: 149.99,
      total_price: 149.99
    },
    // Order 2 items
    {
      id: uuidv4(),
      order_id: orderIds.order2,
      product_id: productIds.monitor,
      quantity: 1,
      unit_price: 599.99,
      total_price: 599.99
    },
    {
      id: uuidv4(),
      order_id: orderIds.order2,
      product_id: productIds.speaker,
      quantity: 1,
      unit_price: 129.99,
      total_price: 129.99
    },
    // Order 3 items
    {
      id: uuidv4(),
      order_id: orderIds.order3,
      product_id: productIds.headphones,
      quantity: 1,
      unit_price: 99.99,
      total_price: 99.99
    },
    {
      id: uuidv4(),
      order_id: orderIds.order3,
      product_id: productIds.speaker,
      quantity: 1,
      unit_price: 129.99,
      total_price: 129.99
    }
  ]);
};
