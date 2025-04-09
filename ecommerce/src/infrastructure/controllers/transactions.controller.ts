import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionsService } from '@application/transactions.service';
import { ITransaction } from '@domain/transaction.interface';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':id')
  async findTransactionById(@Param('id') id: number): Promise<ITransaction> {
    const result = await this.transactionsService.findTransactionById(id);
    if (result.isLeft()) {
      throw new HttpException(result.value, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  private handleTransactionError(error: any): void {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }

  @Post()
  async createTransaction(
    @Body() body: { productId: number; amount: number; currency: string; reference: string },
  ): Promise<ITransaction> {
    const result = await this.transactionsService.createTransaction(
      body.productId,
      body.amount,
      body.currency,
      body.reference,
    );

    if (result.isLeft()) {
      throw new HttpException(result.value, HttpStatus.BAD_REQUEST);
    }

    return result.value;
  }

  @Post('pay')
  async payForTransaction(
    @Body() body: { productId: number; amount: number; token: string; deliveryAddress: string },
  ): Promise<ITransaction> {
    const result = await this.transactionsService.createTransactionWithPayment(
      body.productId,
      body.amount,
      body.token,
      body.deliveryAddress,
    );
    if (result.isLeft()) {
      throw new HttpException(result.value, HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Post(':id/update-status')
  async updateTransactionStatus(
    @Param('id') id: number,
    @Body('status') status: string,
  ): Promise<ITransaction> {
    const result = await this.transactionsService.updateTransactionStatus(id, status);
    if (result.isLeft()) {
      throw new HttpException(result.value, HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }
}