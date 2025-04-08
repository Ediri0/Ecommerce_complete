import { Product } from './product.entity';

describe('Product Entity', () => {
  it('should create a product with default stock value', () => {
    const product = new Product();
    product.name = 'Test Product';
    product.price = 100.0;
    product.description = 'Test Description';

    expect(product.stock).toBe(0); // Ensure default stock is 0
    expect(product.name).toBe('Test Product');
    expect(product.price).toBe(100.0);
    expect(product.description).toBe('Test Description');
  });
});
