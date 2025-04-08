import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WompiService {
  private readonly apiUrl = process.env.WOMPI_API_URL;
  private readonly publicKey = process.env.WOMPI_PUBLIC_KEY;
  private readonly privateKey = process.env.WOMPI_PRIVATE_KEY;

  public logToFile(data: any) {
    try {
      const logDir = path.join(__dirname, '../../logs');
      const logPath = path.join(logDir, 'wompi.log');

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logEntry = `
[${new Date().toISOString()}]
Action: ${data.action}
URL: ${data.url || 'N/A'}
Payload: ${data.payload ? JSON.stringify(data.payload, null, 2) : 'N/A'}
Response: ${data.response ? JSON.stringify(data.response, null, 2) : 'N/A'}
Error: ${data.error ? JSON.stringify(data.error, null, 2) : 'N/A'}
Stack: ${data.stack || 'N/A'}
------------------------------------------------------------
`;
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  async getAcceptanceTokens(): Promise<{ acceptance_token: string; accept_personal_auth: string }> {
    try {
      const response = await axios.get(`${this.apiUrl}/merchants/${this.publicKey}`);
      const data = response.data.data;

      return {
        acceptance_token: data.presigned_acceptance.acceptance_token,
        accept_personal_auth: data.presigned_personal_data_auth.acceptance_token,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'Error fetching acceptance tokens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTransaction(payload: {
    amount_in_cents: number;
    currency: string;
    customer_email: string;
    payment_method: { type: string; token: string; installments: number };
    reference: string;
    payment_description: string;
    acceptance_token: string;
    accept_personal_auth: string;
    signature?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transactions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      const wompiErrorMessage =
        error.response?.data?.error?.messages?.valid_amount_in_cents?.[0] ||
        error.response?.data?.error?.message ||
        'Error creating transaction';

      this.logToFile({
        action: 'Error Creating Transaction',
        url: `${this.apiUrl}/transactions`,
        payload,
        error: {
          message: wompiErrorMessage,
          response: error.response?.data,
          status: error.response?.status,
        },
      });

      throw new HttpException(
        {
          message: wompiErrorMessage,
          details: error.response?.data?.error?.messages || error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async tokenizeCard(cardDetails: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/tokens/cards`,
        cardDetails,
        {
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'Error tokenizing card',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPublicInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/merchants/${this.publicKey}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'Error fetching public info',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'Error fetching transaction status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
