import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { ITransactionRepository } from '../domain/transaction.interface';
import { IProductRepository } from '../domain/product.interface';
import { left, right } from '../utils/either';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockTransactionRepository: Partial<ITransactionRepository>;
  let mockProductRepository: Partial<IProductRepository>;

  beforeEach(async () => {
    mockTransactionRepository = {
      save: jest.fn().mockResolvedValue({
        id: 1,
        productId: 1,
        amount: 100,
        status: 'PENDING',
      }),
    };

    mockProductRepository = {
      findById: jest.fn().mockImplementation((id: number) =>
        id === 1
          ? Promise.resolve({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 10 })
          : Promise.resolve(null),
      ),
      save: jest.fn().mockResolvedValue({ id: 1, name: 'Laptop', price: 1000, description: 'High-performance laptop', stock: 9 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: 'ITransactionRepository', useValue: mockTransactionRepository },
        { provide: 'IProductRepository', useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should create a transaction if product exists and has stock', async () => {
    const result = await service.createTransaction(1, 100, 'COP', 'test-reference');
    expect(result).toEqual({
      id: 1,
      productId: 1,
      amount: 100,
      status: 'PENDING',
    });
  });

  it('should return an error if product does not exist', async () => {
    const result = await service.createTransaction(2, 100, 'COP', 'test-reference');
    expect(left(result)).toBe(true);
    expect(result).toEqual(left('Product not found'));
  });

  it('should return an error if product is out of stock', async () => {
    jest.spyOn(mockProductRepository, 'findById').mockResolvedValueOnce({
      id: 1,
      name: 'Laptop',
      price: 1000,
      description: 'High-performance laptop',
      stock: 0,
    });
    const result = await service.createTransaction(1, 100, 'COP', 'test-reference');
    expect(left(result)).toBe(true);
    expect(result).toEqual(left('Product out of stock'));
  });
});
