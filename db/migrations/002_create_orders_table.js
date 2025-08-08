exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.uuid('id').primary();
    table.string('customer_email').notNullable();
    table.string('customer_name').notNullable();
    table.text('shipping_address').notNullable();
    table.text('billing_address');
    table.decimal('total_amount', 10, 2).notNullable();
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('shipping_amount', 10, 2).defaultTo(0);
    table.enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending');
    table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
    table.string('payment_method');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
