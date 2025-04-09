"use strict";
const { EntitySchema } = require('typeorm');

const ProductEntity = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    name: {
      type: 'varchar',
    },
    price: {
      type: 'decimal',
    },
    description: {
      type: 'varchar',
    },
    stock: {
      type: 'int',
    },
    image: {
      type: 'varchar',
      nullable: true,
    },
  },
});

module.exports = { ProductEntity };
