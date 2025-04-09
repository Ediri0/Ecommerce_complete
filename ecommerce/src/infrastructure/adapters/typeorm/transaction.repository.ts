import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransactionRepository, ITransaction } from '../../../domain/transaction.interface';
import { TransactionEntity } from '@domain/entities/transaction.entity';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  async findById(id: number): Promise<ITransaction | null> {
    const transaction = await this.repository.findOneBy({ id });
    return transaction || null;
  }

  async save(transaction: ITransaction): Promise<ITransaction> {
    return this.repository.save({
      ...transaction,
      deliveryAddress: transaction.deliveryAddress, // Asegúrate de incluir este campo
      productId: transaction.productId, // Asegúrate de incluir el campo productId
    });
  }
}