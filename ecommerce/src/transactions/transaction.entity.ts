import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  idUuid: string;

  @Column('decimal', { precision: 10, scale: 2 }) // Cambiar a tipo decimal
  amount: number;

  @Column({ nullable: false, default: 'COP' }) // Asegurar que no sea nulo y asignar un valor predeterminado
  currency: string;

  @Column({ nullable: false }) // Asegurar que no sea nulo
  reference: string;

  @Column()
  status: string;
}