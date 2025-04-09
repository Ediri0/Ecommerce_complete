"use strict";
const { DataSource } = require('typeorm');
const { ProductEntity } = require('../../src/domain/entities/product.entity'); // Asegúrate de que la ruta sea correcta
require('dotenv/config'); // Carga las variables de entorno desde el archivo .env

const seedDatabase = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ecommerce',
    entities: [ProductEntity],
    synchronize: true, // Solo para desarrollo, desactivar en producción
  });

  try {
    console.log('Initializing database connection...');
    await dataSource.initialize();
    console.log('Database connection established.');

    const productRepository = dataSource.getRepository(ProductEntity);

    const products = [
      { name: 'Laptop', price: 1000000.0, description: 'High-performance laptop', stock: 1000, image: 'laptop.webp' },
      { name: 'Smartphone', price: 3000000.0, description: 'Latest model smartphone', stock: 1000, image: 'cellphone.jpg' },
      { name: 'Headphones', price: 150000.0, description: 'Noise-cancelling headphones', stock: 1000, image: 'headphones.png' },
    ];

    console.log('Seeding database...');
    await productRepository.save(products);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed.');
  }
};

seedDatabase().catch((error) => {
  console.error('Unexpected error:', error);
});
