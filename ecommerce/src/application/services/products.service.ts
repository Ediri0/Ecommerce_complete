import { Injectable, Inject } from '@nestjs/common';
import { IProduct, IProductRepository } from 'src/domain/product.interface';
import { Either, left, right } from 'src/utils/either';


@Injectable()
export class ProductsService {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async findAll(): Promise<IProduct[]> {
    return await this.productRepository.findAll();
  }

  async findOne(id: number): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return product;
  }

  async updateStock(productId: number, quantity: number): Promise<Either<string, IProduct>> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return left('Product not found');
    }

    if (product.stock < quantity) {
      return left('Insufficient stock');
    }

    product.stock -= quantity;

    try {
      const updatedProduct = await this.productRepository.save(product);
      return right(updatedProduct);
    } catch (error) {
      return left(`Error updating stock: ${error.message}`);
    }
  }
}
