import { Injectable, Inject } from '@nestjs/common';
import { ITransactionRepository, ITransaction } from '../domain/transaction.interface';
import { IProductRepository, IProduct } from '../domain/product.interface';
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
    private readonly wompiService: IWompiService,
  ) {}

  async createTransaction(
    id: number | undefined,
    amount: number,
    currency: string = 'COP',
    reference: string = `ref_${Date.now()}`, // Provide default reference
  ): Promise<Either<string, ITransaction>> {
    if (id !== undefined) {
      const product = await this.productRepository.findById(id);
      if (!product) {
        return left('Product not found');
      }
      if (product.stock <= 0) {
        return left('Product out of stock');
      }
      await this.productRepository.save({ ...product, stock: product.stock - 1 });
    }

    const transaction: ITransaction = {
      id,
      idUuid: undefined,
      productId: id,
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

  async createTransactionWithPayment(
    id: number,
    amount: number,
    token: string,
    deliveryAddress: string, // Asegúrate de recibir este parámetro
  ): Promise<Either<string, ITransaction>> {
    const product = await this.productRepository.findById(id);
    if (!product || product.stock <= 0) {
      return left('Product not available or out of stock');
    }

    const transaction: ITransaction = {
      id,
      productId: id,
      amount,
      currency: 'COP',
      reference: `order_${id}_${Date.now()}`,
      status: 'PENDING',
      deliveryAddress, // Incluye la dirección de entrega
    };
    const savedTransaction = await this.transactionRepository.save(transaction);

    try {
      const acceptanceTokens = await this.wompiService.getAcceptanceTokens();

      const wompiResponse = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(amount * 100),
        currency: 'COP',
        customer_email: 'customer@example.com',
        payment_method: { type: 'CARD', token, installments: 1 },
        reference: `order_${id}_${Date.now()}`,
        payment_description: `Compra de ${product.name}`,
        acceptance_token: acceptanceTokens.acceptance_token,
        accept_personal_auth: acceptanceTokens.accept_personal_auth,
      });

      savedTransaction.status = wompiResponse.data.status;
      await this.transactionRepository.save(savedTransaction);

      if (wompiResponse.data.status === 'APPROVED') {
        const updatedProduct: IProduct = {
          ...product,
          stock: product.stock - 1,
        };
        await this.productRepository.save(updatedProduct);
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
      return left(`Error saving transaction: ${(error as Error).message}`);
    }
  }

  async updateTransactionStatus(id: number, status: string): Promise<Either<string, ITransaction>> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      return left('Transaction not found');
    }

    transaction.status = status; // Actualiza el estado

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
      return right({
        ...updatedTransaction,
        productId: transaction.productId, // Asegura que productId esté incluido
      });
    } catch (error) {
      return left(`Error updating transaction: ${error.message}`);
    }
  }
}
