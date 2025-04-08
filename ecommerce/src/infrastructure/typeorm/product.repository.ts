import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../products/product.entity';
import { IProduct, IProductRepository } from '../../domain/product.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findById(id: number): Promise<IProduct | null> {
    const product = await this.repository.findOneBy({ id });
    if (!product) return null;
    return { ...product, stock: product.stock }; // Ensure stock is included
  }

  async findAll(): Promise<IProduct[]> {
    const products = await this.repository.find();
    return products.map((product) => ({ ...product, stock: product.stock })); // Ensure stock is included
  }

  async save(product: IProduct): Promise<IProduct> {
    const savedProduct = await this.repository.save(product);
    return savedProduct;
  }
}
