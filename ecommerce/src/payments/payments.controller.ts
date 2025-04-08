import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { IWompiService } from '../domain/wompi.interface'; // Use the interface
import { TransactionsService } from '../application/transactions.service';
import { CardDetails } from '../domain/wompi.interface'; // Import CardDetails

@Controller('payments') // Define the base route "/payments"
export class PaymentsController {
  constructor(
    @Inject('IWompiService') private readonly wompiService: IWompiService, // Inject using the interface
    private readonly transactionsService: TransactionsService,
  ) {}

  // Endpoint para obtener información pública del comercio
  @Get('public-info') // Define la ruta "/payments/public-info"
  async getPublicInfo() {
    try {
      const result = await this.wompiService.getPublicInfo();
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Endpoint para consultar el estado de una transacción
  @Get(':transactionId') // Define la ruta dinámica "/payments/:transactionId"
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
        `Error fetching transaction status: ${errorDetails.message}. Detalles: ${JSON.stringify(errorDetails.responseData)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Endpoint para crear una transacción
  @Post()
  async createPayment(@Body() body: { amount: number; currency: string; reference: string; token: string }) {
    try {
      if (!body.amount || !body.currency || !body.reference || !body.token) {
        throw new HttpException('Todos los campos son obligatorios', HttpStatus.BAD_REQUEST);
      }

      // Obtener los tokens de aceptación
      const acceptanceTokens = await this.wompiService.getAcceptanceTokens();

      const result = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(body.amount * 100),
        currency: body.currency,
        customer_email: 'customer@example.com', // Cambiar por el email del cliente si es necesario
        payment_method: {
          type: 'CARD',
          token: body.token,
          installments: 1,
        },
        reference: body.reference,
        payment_description: 'Compra de Producto',
        acceptance_token: acceptanceTokens.acceptance_token, // Agregar el token de aceptación
        accept_personal_auth: acceptanceTokens.accept_personal_auth, // Agregar el token de autorización de datos personales
        signature: undefined, // Add the optional signature property
      });

      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Endpoint para tokenizar tarjetas
  @Post('tokenize-card') // Define la ruta "/payments/tokenize-card"
  async tokenizeCard(@Body() cardDetails: CardDetails) {
    try {
      const result = await this.wompiService.tokenizeCard(cardDetails);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('complete-transaction') // Define la ruta "/payments/complete-transaction"
  async completeTransaction(
    @Body() body: CardDetails & { amount: number; currency: string; reference: string },
  ) {
    try {
      // Paso 1: Tokenizar la tarjeta
      const tokenizedCard = await this.wompiService.tokenizeCard({
        number: body.number,
        cvc: body.cvc,
        exp_month: body.exp_month,
        exp_year: body.exp_year,
        card_holder: body.card_holder,
      });
      this.wompiService.logToFile({ action: 'Tokenized Card Response', response: tokenizedCard });

      // Paso 2: Obtener los tokens de aceptación
      const acceptanceTokens = await this.wompiService.getAcceptanceTokens();
      this.wompiService.logToFile({ action: 'Acceptance Tokens Response', response: acceptanceTokens });

      // Paso 3: Crear la transacción
      const integritySignature = process.env.WOMPI_INTEGRITY; // Obtener la firma de integridad desde el .env

      const transaction = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(body.amount * 100),
        currency: body.currency,
        customer_email: 'customer@example.com', // Cambiar por el email del cliente si es necesario
        payment_method: {
          type: 'CARD',
          token: tokenizedCard.data.id,
          installments: 1,
        },
        reference: body.reference,
        payment_description: 'Compra de Producto',
        acceptance_token: acceptanceTokens.acceptance_token,
        accept_personal_auth: acceptanceTokens.accept_personal_auth,
        signature: integritySignature, // Incluir la firma de integridad
      });
      this.wompiService.logToFile({ action: 'Transaction Response', response: transaction });

      await this.transactionsService.createTransaction(
        transaction.id || undefined, // Pass a valid productId or undefined
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
        stack: error.stack, // Log the stack trace for debugging
      };

      console.error('Error completing transaction:', errorDetails);

      this.wompiService.logToFile({ action: 'Error Completing Transaction', error: errorDetails });

      await this.transactionsService.createTransaction(
        undefined, // Provide a valid productId or leave undefined if not applicable
        body.amount,
        body.currency,
        body.reference,
      );

      throw new HttpException(
        `Error completing transaction: ${errorDetails.message}. Detalles: ${JSON.stringify(errorDetails.responseData)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('complete-transaction-v2') // Define la ruta "/payments/complete-transaction-v2"
  async completeTransactionV2(
    @Body()
    body: {
      number: string;
      cvc: string;
      exp_month: string;
      exp_year: string;
      card_holder: string;
      amount: string; // Asegúrate de que el monto sea un string
      currency: string;
      reference: string;
      acceptance_token: string;
      accept_personal_auth: string;
    },
  ) {
    let transactionStatus = 'PENDING';

    try {
      // Paso 1: Tokenizar la tarjeta
      const tokenizedCard = await this.wompiService.tokenizeCard({
        number: body.number,
        cvc: body.cvc,
        exp_month: body.exp_month,
        exp_year: body.exp_year,
        card_holder: body.card_holder,
      });

      // Paso 2: Crear la transacción en Wompi
      const transaction = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(parseFloat(body.amount) * 100), // Convertir el monto a centavos
        currency: body.currency,
        customer_email: 'customer@example.com', // Cambiar por el email del cliente si es necesario
        payment_method: {
          type: 'CARD',
          token: tokenizedCard.data.id,
          installments: 1,
        },
        reference: body.reference,
        payment_description: 'Compra de Producto',
        acceptance_token: body.acceptance_token,
        accept_personal_auth: body.accept_personal_auth,
      });

      transactionStatus = transaction.status; // Actualizar el estado basado en la respuesta de Wompi
      return transaction;
    } catch (error) {
      console.error('Error en Wompi:', error.message);
      return { status: 'FAILED' }; // Continuar el flujo incluso si falla
    }
  }
}
