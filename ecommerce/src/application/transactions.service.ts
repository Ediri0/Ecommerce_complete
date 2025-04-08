import { Injectable, Inject } from '@nestjs/common';
import { ITransactionRepository, ITransaction } from '../domain/transaction.interface';
import { IProductRepository } from '../domain/product.interface';
import { IWompiService } from '../domain/wompi.interface';
import { Either, left, right } from '../utils/either';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IWompiService')
    private readonly wompiService: IWompiService, // Asegurar consistencia
  ) {}

  async createTransaction(
    productId: number | undefined, // Allow productId to be undefined
    amount: number,
    currency: string,
    reference: string,
  ): Promise<ITransaction> {
    if (productId !== undefined) {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stock <= 0) {
        throw new Error('Product out of stock');
      }

      product.stock -= 1;
      await this.productRepository.save(product);
    }

    const transaction: ITransaction = {
      id: undefined,
      idUuid: undefined,
      productId,
      amount,
      currency: currency || 'COP', // Asignar un valor predeterminado si currency es nulo o indefinido
      reference: reference || `ref_${Date.now()}`, // Asignar un valor predeterminado si reference es nulo o indefinido
      status: 'PENDING',
    };

    const result = await this.transactionRepository.save(transaction);
    if (!result) {
      throw new Error('Error saving transaction');
    }
    return result;
  }

  async createTransactionWithPayment(
    productId: number,
    amount: number,
    token: string,
    deliveryAddress: string,
  ): Promise<Either<string, ITransaction>> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.stock <= 0) {
      return left('Product not available or out of stock');
    }

    const transaction: ITransaction = {
      productId,
      amount,
      currency: 'COP', 
      reference: `order_${productId}_${Date.now()}`,
      status: 'PENDING',
      deliveryAddress,
    };
    const savedTransaction = await this.transactionRepository.save(transaction);

    try {
      const acceptanceTokens = await this.wompiService.getAcceptanceTokens();

      const wompiResponse = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(amount * 100), // Asegúrate de que amount sea un número decimal válido
        currency: 'COP',
        customer_email: 'customer@example.com',
        payment_method: { type: 'CARD', token, installments: 1 },
        reference: `order_${productId}_${Date.now()}`,
        payment_description: `Compra de ${product.name}`,
        acceptance_token: acceptanceTokens.acceptance_token,
        accept_personal_auth: acceptanceTokens.accept_personal_auth,
      });

      savedTransaction.status = wompiResponse.data.status;
      await this.transactionRepository.save(savedTransaction);

      if (wompiResponse.data.status === 'APPROVED') {
        product.stock -= 1;
        await this.productRepository.save(product);
      }

      return right(savedTransaction);
    } catch (error) {
      savedTransaction.status = 'FAILED';
      await this.transactionRepository.save(savedTransaction);
      return left('Payment failed');
    }
  }

  async findTransactionById(id: number): Promise<Either<string, ITransaction>> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      return left('Transaction not found');
    }
    return right(transaction);
  }

  async saveTransaction(transaction: ITransaction): Promise<Either<string, ITransaction>> {
    try {
      const savedTransaction = await this.transactionRepository.save(transaction);
      return right(savedTransaction);
    } catch (error) {
      return left(`Error saving transaction: ${error.message}`);
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
        product.stock -= 1; // Reducir el stock del producto
        await this.productRepository.save(product);
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
