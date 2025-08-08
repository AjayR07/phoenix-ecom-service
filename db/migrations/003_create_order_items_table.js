exports.up = function(knex) {
  return knex.schema.createTable('order_items', function(table) {
    table.uuid('id').primary();
    table.uuid('order_id').notNullable();
    table.uuid('product_id').notNullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamps(true, true);
    
    table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('order_items');
};
