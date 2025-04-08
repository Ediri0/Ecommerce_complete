// Pruebas unitarias para el servicio de productos.
// Estas pruebas verifican que el servicio maneje correctamente los casos de éxito y error.

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { IProductRepository } from '../domain/product.interface';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepository: Partial<IProductRepository>;

  beforeEach(async () => {
    // Mockeamos el repositorio de productos para aislar las pruebas.
    mockProductRepository = {
      findAll: jest.fn().mockResolvedValue([
        { id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' },
        { id: 2, name: 'Smartphone', price: 500, description: 'Latest model smartphone' },
      ]),
      findById: jest.fn().mockImplementation((id: number) =>
        id === 1
          ? Promise.resolve({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' })
          : Promise.resolve(null),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: 'IProductRepository', useValue: mockProductRepository }, // Inyectamos el mock del repositorio.
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined(); // Verifica que el servicio esté definido.
  });

  it('should return all products', async () => {
    const products = await service.findAll();
    expect(products).toEqual([
      { id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' },
      { id: 2, name: 'Smartphone', price: 500, description: 'Latest model smartphone' },
    ]);
    expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1); // Verifica que el método findAll del repositorio fue llamado.
  });

  it('should return a product by ID', async () => {
    const product = await service.findOne(1);
    expect(product).toEqual({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop' });
    expect(mockProductRepository.findById).toHaveBeenCalledWith(1); // Verifica que el método findById fue llamado con el ID correcto.
  });

  it('should throw an error if product not found', async () => {
    jest.spyOn(mockProductRepository, 'findById').mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow('Product with id 999 not found');
  });
});
