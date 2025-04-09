import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../application/products.service';
import { ProductsController } from '@controllers/products.controller';

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
    jest.spyOn(mockProductsService, 'findAll').mockResolvedValue([
      { id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 },
      { id: 2, name: 'Smartphone', price: 500, description: 'Latest model smartphone', stock: 5 },
    ]);

    const products = await controller.findAll();
    expect(products).toEqual([
      { id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 },
      { id: 2, name: 'Smartphone', price: 500, description: 'Latest model smartphone', stock: 5 },
    ]);
    expect(mockProductsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return a product by ID', async () => {
    jest.spyOn(mockProductsService, 'findOne').mockResolvedValueOnce({
      id: 1,
      name: 'Laptop',
      price: 1000,
      description: 'High-performance laptop',
      stock: 10,
    });

    const product = await controller.findOne("1");
    expect(product).toEqual({
      id: 1,
      name: 'Laptop',
      price: 1000,
      description: 'High-performance laptop',
      stock: 10,
    });
  });

  it('should throw an error if product not found', async () => {
    jest.spyOn(mockProductsService, 'findOne').mockImplementationOnce(() => Promise.reject(new Error('Product not found')));

    await expect(controller.findOne("1")).rejects.toThrow('Product not found');
  });

  it('should return a product by ID', async () => {
    const product = await controller.findOne("1");
    expect(product).toEqual({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' });
    expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw an error if product not found', async () => {
    await expect(controller.findOne("1")).rejects.toThrow('Product with id 3 not found');
    expect(mockProductsService.findOne).toHaveBeenCalledWith(3);
  });

  it('should handle errors when fetching all products', async () => {
    jest.spyOn(mockProductsService, 'findAll').mockRejectedValueOnce(new Error('Database error'));
    await expect(controller.findAll()).rejects.toThrow('Database error');
  });
});
