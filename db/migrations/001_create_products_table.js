exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.integer('stock_quantity').defaultTo(0);
    table.string('category');
    table.string('image_url');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
