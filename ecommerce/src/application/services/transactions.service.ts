import { Injectable, Inject } from '@nestjs/common';
import { IProduct, IProductRepository } from 'src/domain/product.interface';
import { ITransaction, ITransactionRepository } from 'src/domain/transaction.interface';
import { IWompiService } from 'src/domain/wompi.interface';
import { Either, left, right } from 'src/utils/either';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IWompiService')
    private readonly wompiService: IWompiService,
  ) {}

  async createTransaction(
    productId: number | undefined, // Allow productId to be undefined
    amount: number,
    currency: string = 'COP',
    reference: string = `ref_${Date.now()}`,
  ): Promise<Either<string, ITransaction>> {
    if (!productId) {
      return left('Product ID is required'); // Handle undefined productId
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      return left('Product not found');
    }
    if (product.stock <= 0) {
      return left('Product out of stock');
    }

    await this.productRepository.save({ ...product, stock: product.stock - 1 });

    const transaction: ITransaction = {
      productId, // Ensure productId is valid
      amount,
      currency,
      reference,
      status: 'PENDING',
    };

    try {
      const result = await this.transactionRepository.save(transaction);
      return right(result);
    } catch (error) {
      return left('Error saving transaction');
    }
  }

  async updateTransactionStatus(id: number, status: string): Promise<Either<string, ITransaction>> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      return left('Transaction not found');
    }

    transaction.status = status;

    if (status === 'APPROVED' && transaction.productId) {
      const product = await this.productRepository.findById(transaction.productId);
      if (product) {
        const updatedProduct: IProduct = {
          ...product,
          stock: product.stock - 1,
        };
        await this.productRepository.save(updatedProduct);
      }
    }

    try {
      const updatedTransaction = await this.transactionRepository.save(transaction);
      return right(updatedTransaction);
    } catch (error) {
      return left(`Error updating transaction: ${error.message}`);
    }
  }
}
