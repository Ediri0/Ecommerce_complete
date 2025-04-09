import { TransactionsService } from '@application/transactions.service';
import { CardDetails, IWompiService } from '@domain/wompi.interface';
import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Inject } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject('IWompiService') private readonly wompiService: IWompiService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('public-info')
  async getPublicInfo() {
    try {
      const result = await this.wompiService.getPublicInfo();
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':transactionId')
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    try {
      const result = await this.wompiService.getTransactionStatus(transactionId);
      return result;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
      };

      console.error('Error fetching transaction status:', errorDetails);

      throw new HttpException(
        `Error fetching transaction status: ${errorDetails.message}. Details: ${JSON.stringify(errorDetails.responseData)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  async createPayment(@Body() body: { amount: number; currency: string; reference: string; token: string }) {
    try {
      if (!body.amount || !body.currency || !body.reference || !body.token) {
        throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
      }

      const acceptanceTokens = await this.wompiService.getAcceptanceTokens();

      const result = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(body.amount * 100),
        currency: body.currency,
        customer_email: 'customer@example.com',
        payment_method: {
          type: 'CARD',
          token: body.token,
          installments: 1,
        },
        reference: body.reference,
        payment_description: 'Product Purchase',
        acceptance_token: acceptanceTokens.acceptance_token,
        accept_personal_auth: acceptanceTokens.accept_personal_auth,
        signature: undefined,
      });

      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('tokenize-card')
  async tokenizeCard(@Body() cardDetails: CardDetails) {
    try {
      const result = await this.wompiService.tokenizeCard(cardDetails);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('complete-transaction')
  async completeTransaction(
    @Body() body: CardDetails & { amount: number; currency: string; reference: string },
  ) {
    try {
      const tokenizedCard = await this.wompiService.tokenizeCard({
        number: body.number,
        cvc: body.cvc,
        exp_month: body.exp_month,
        exp_year: body.exp_year,
        card_holder: body.card_holder,
      });

      const acceptanceTokens = await this.wompiService.getAcceptanceTokens();

      const transaction = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(body.amount * 100),
        currency: body.currency,
        customer_email: 'customer@example.com',
        payment_method: {
          type: 'CARD',
          token: tokenizedCard.data.id,
          installments: 1,
        },
        reference: body.reference,
        payment_description: 'Product Purchase',
        acceptance_token: acceptanceTokens.acceptance_token,
        accept_personal_auth: acceptanceTokens.accept_personal_auth,
        signature: process.env.WOMPI_INTEGRITY,
      });

      await this.transactionsService.createTransaction(
        transaction.id || 0,
        body.amount,
        body.currency,
        body.reference,
      );

      return transaction;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      };

      console.error('Error completing transaction:', errorDetails);

      await this.transactionsService.createTransaction(
        0,
        body.amount,
        body.currency,
        body.reference,
      );

      throw new HttpException(
        `Error completing transaction: ${errorDetails.message}. Details: ${JSON.stringify(errorDetails.responseData)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('complete-transaction-v2')
  async completeTransactionV2(
    @Body()
    body: {
      number: string;
      cvc: string;
      exp_month: string;
      exp_year: string;
      card_holder: string;
      amount: string;
      currency: string;
      reference: string;
      acceptance_token: string;
      accept_personal_auth: string;
    },
  ) {
    let transactionStatus = 'PENDING';

    try {
      const tokenizedCard = await this.wompiService.tokenizeCard({
        number: body.number,
        cvc: body.cvc,
        exp_month: body.exp_month,
        exp_year: body.exp_year,
        card_holder: body.card_holder,
      });

      const transaction = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(parseFloat(body.amount) * 100),
        currency: body.currency,
        customer_email: 'customer@example.com',
        payment_method: {
          type: 'CARD',
          token: tokenizedCard.data.id,
          installments: 1,
        },
        reference: body.reference,
        payment_description: 'Product Purchase',
        acceptance_token: body.acceptance_token,
        accept_personal_auth: body.accept_personal_auth,
      });

      transactionStatus = transaction.status;
      return transaction;
    } catch (error) {
      console.error('Error en Wompi:', error.message);
      return { status: 'FAILED' };
    }
  }
}
