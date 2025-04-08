import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransaction, ITransactionRepository } from '../../domain/transaction.interface';
import { TransactionEntity } from '../../transactions/transaction.entity'; // Ensure this path is correct
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  async save(transaction: ITransaction): Promise<ITransaction> {
    const transactionToSave = {
      ...transaction,
      id: transaction.id ?? undefined,
      idUuid: transaction.idUuid ?? uuidv4(),
    };
    const savedTransaction = await this.repository.save(transactionToSave);
    return {
      id: savedTransaction.id,
      idUuid: savedTransaction.idUuid,
      amount: savedTransaction.amount,
      currency: savedTransaction.currency,
      reference: savedTransaction.reference,
      status: savedTransaction.status,
    };
  }

  async findById(id: number): Promise<ITransaction | null> {
    const transaction = await this.repository.findOneBy({ id });
    if (!transaction) return null;
    return {
      id: transaction.id,
      idUuid: transaction.idUuid,
      amount: transaction.amount,
      currency: transaction.currency,
      reference: transaction.reference,
      status: transaction.status,
    };
  }
}