import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { ITransactionRepository, ITransaction } from '../domain/transaction.interface';
import { IProductRepository, IProduct } from '../domain/product.interface';
import { IWompiService } from '../domain/wompi.interface';
import { Either, left, right } from '../utils/either';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockTransactionRepository: Partial<ITransactionRepository>;
  let mockProductRepository: Partial<IProductRepository>;
  let mockWompiService: Partial<IWompiService>;

  beforeEach(async () => {
    mockTransactionRepository = {
      save: jest.fn().mockResolvedValue({ id: 1, amount: 100, currency: 'COP', reference: 'test-ref', status: 'PENDING' }),
      findById: jest.fn().mockImplementation((id: number) =>
        id === 1 ? Promise.resolve({ id: 1, amount: 100, currency: 'COP', reference: 'test-ref', status: 'PENDING' }) : Promise.resolve(null),
      ),
    };

    mockProductRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Laptop',
        stock: 10,
        price: 1000,
        description: 'High-performance laptop',
      }),
      save: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Laptop',
        stock: 9,
        price: 1000,
        description: 'High-performance laptop',
      }),
    };

    mockWompiService = {
      getAcceptanceTokens: jest.fn().mockResolvedValue({ acceptance_token: 'token', accept_personal_auth: 'auth' }),
      createTransaction: jest.fn().mockResolvedValue({ data: { status: 'APPROVED' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: 'ITransactionRepository', useValue: mockTransactionRepository },
        { provide: 'IProductRepository', useValue: mockProductRepository },
        { provide: 'IWompiService', useValue: mockWompiService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should create a transaction successfully', async () => {
    const result = await service.createTransaction(1, 100, 'COP', 'test-ref');
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      id: 1,
      amount: 100,
      currency: 'COP',
      reference: 'test-ref',
      status: 'PENDING',
    });
  });

  it('should return an error if product is not found', async () => {
    jest.spyOn(mockProductRepository, 'findById').mockResolvedValueOnce(null);
    const result = await service.createTransaction(1, 100, 'COP', 'test-ref');
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe('Product not found');
  });

  it('should update transaction status successfully', async () => {
    const result = await service.updateTransactionStatus(1, 'APPROVED');
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      id: 1,
      amount: 100,
      currency: 'COP',
      reference: 'test-ref',
      status: 'APPROVED',
    });
  });

  it('should return an error if transaction is not found when updating status', async () => {
    const result = await service.updateTransactionStatus(999, 'APPROVED');
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe('Transaction not found');
  });

  it('should create a transaction with payment successfully', async () => {
    const result = await service.createTransactionWithPayment(1, 100, 'test-token', '123 Street');
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      id: 1,
      amount: 100,
      currency: 'COP',
      reference: expect.any(String),
      status: 'APPROVED',
    });
  });

  it('should return an error if payment fails', async () => {
    jest.spyOn(mockWompiService, 'createTransaction').mockRejectedValueOnce(new Error('Payment failed'));
    const result = await service.createTransactionWithPayment(1, 100, 'test-token', '123 Street');
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe('Payment failed');
  });

  it('should return an error if saving transaction fails', async () => {
    jest.spyOn(mockTransactionRepository, 'save').mockRejectedValueOnce(new Error('Save failed'));
    const result = await service.createTransaction(1, 100, 'COP', 'test-ref');
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe('Error saving transaction');
  });

  it('should return an error if product is out of stock', async () => {
    jest.spyOn(mockProductRepository, 'findById').mockResolvedValueOnce({
      id: 1,
      name: 'Laptop',
      stock: 0,
      price: 1000,
      description: 'High-performance laptop',
    });
    const result = await service.createTransaction(1, 100, 'COP', 'test-ref');
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe('Product out of stock');
  });
});
