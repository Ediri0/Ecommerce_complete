import 'dotenv/config'; // Carga las variables de entorno desde el archivo .env
import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';

const seedDatabase = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ecommerce',
    entities: [Product],
    synchronize: true, // Solo para desarrollo, desactivar en producción
  });

  await dataSource.initialize();

  const productRepository = dataSource.getRepository(Product);

  const products = [
    { name: 'Laptop', price: 1000000.0, description: 'High-performance laptop', image: 'laptop.jpg' },
    { name: 'Smartphone', price: 3000000.0, description: 'Latest model smartphone', image: 'smartphone.jpg' },
    { name: 'Headphones', price: 150000.0, description: 'Noise-cancelling headphones', image: 'headphones.jpg' },
  ];

  console.log('Seeding database...');
  await productRepository.save(products);
  console.log('Database seeded successfully!');

  await dataSource.destroy();
};

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
});