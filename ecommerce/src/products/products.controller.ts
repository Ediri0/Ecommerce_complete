import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ProductsService } from '../application/products.service';
import { IProduct } from 'src/domain/product.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<IProduct[]> {
    const result = await this.productsService.findAll();
    if (result.isLeft()) {
      throw new HttpException(result.value, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.value;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IProduct> {
    const result = await this.productsService.findOne(id);
    if (!result) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}