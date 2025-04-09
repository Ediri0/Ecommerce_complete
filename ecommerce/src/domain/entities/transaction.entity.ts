import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  amount: number;

  @Column()
  currency: string;

  @Column()
  reference: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  deliveryAddress?: string; // Campo para la dirección de entrega
}