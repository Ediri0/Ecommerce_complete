import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../application/products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: Partial<ProductsService>;

  beforeEach(async () => {
    mockProductsService = {
      findAll: jest.fn().mockResolvedValue([
        { id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' },
        { id: 2, name: 'Smartphone', price: 500, description: 'Latest model smartphone' },
      ]),
      findOne: jest.fn().mockImplementation((id: number) =>
        id === 1
          ? Promise.resolve({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' })
          : Promise.reject(new Error(`Product with id ${id} not found`)),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all products', async () => {
    const products = await controller.findAll();
    expect(products).toEqual([
      { id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' },
      { id: 2, name: 'Smartphone', price: 500, description: 'Latest model smartphone' },
    ]);
    expect(mockProductsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return a product by ID', async () => {
    const product = await controller.findOne(1);
    expect(product).toEqual({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' });
    expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw an error if product not found', async () => {
    await expect(controller.findOne(3)).rejects.toThrow('Product with id 3 not found');
    expect(mockProductsService.findOne).toHaveBeenCalledWith(3);
  });
});
