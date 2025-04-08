import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @Column({ default: 0 }) // Add default value for stock
  stock: number;

  @Column({ nullable: true }) // Nuevo campo para el nombre de la imagen
  image: string;
}