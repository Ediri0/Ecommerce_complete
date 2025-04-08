import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from './product.repository';
import { Repository } from 'typeorm';
import { Product } from '../../products/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let mockRepository: Partial<Repository<Product>>;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn().mockResolvedValue({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 }),
      find: jest.fn().mockResolvedValue([{ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 }]),
      save: jest.fn().mockResolvedValue({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        { provide: getRepositoryToken(Product), useValue: mockRepository },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
  });

  it('should find a product by ID', async () => {
    const product = await repository.findById(1);
    expect(product).toEqual({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 });
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should find all products', async () => {
    const products = await repository.findAll();
    expect(products).toEqual([{ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 }]);
    expect(mockRepository.find).toHaveBeenCalled();
  });

  it('should save a product', async () => {
    const product = await repository.save({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 });
    expect(product).toEqual({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 });
    expect(mockRepository.save).toHaveBeenCalledWith({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 });
  });
});
