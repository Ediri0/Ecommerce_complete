import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IProduct, IProductRepository } from 'src/domain/product.interface';
import { ProductEntity } from '@domain/entities/product.entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findById(id: number): Promise<IProduct | null> {
    const product = await this.repository.findOneBy({ id });
    if (!product) return null;
    return { ...product, stock: product.stock };
  }

  async findAll(): Promise<IProduct[]> {
    const products = await this.repository.find();
    return products.map((product) => ({ ...product, stock: product.stock }));
  }

  async save(product: IProduct): Promise<IProduct> {
    const savedProduct = await this.repository.save(product);
    return savedProduct;
  }
}
