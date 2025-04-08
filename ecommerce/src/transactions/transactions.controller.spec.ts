import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from '../application/transactions.service';
import { HttpException } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let mockTransactionsService: Partial<TransactionsService>;

  beforeEach(async () => {
    mockTransactionsService = {
      createTransaction: jest.fn().mockImplementation((productId: number, amount: number) =>
        productId === 1
          ? Promise.resolve({
              isLeft: () => false,
              isRight: () => true,
              value: { id: 1, productId, amount, status: 'pending' },
            })
          : Promise.resolve({
              isLeft: () => true,
              isRight: () => false,
              value: 'Product not found',
            }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [{ provide: TransactionsService, useValue: mockTransactionsService }],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a transaction if product exists', async () => {
    const transaction = await controller.createTransaction(1, 100);
    expect(transaction).toEqual({ id: 1, productId: 1, amount: 100, status: 'pending' });
  });

  it('should throw an error if product does not exist', async () => {
    await expect(controller.createTransaction(2, 100)).rejects.toThrow(HttpException);
  });
});
