import { Test, TestingModule } from '@nestjs/testing';
import { WompiService } from './wompi.service';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WompiService', () => {
  let service: WompiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WompiService],
    }).compile();

    service = module.get<WompiService>(WompiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAcceptanceTokens', () => {
    it('should return acceptance tokens', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            presigned_acceptance: { acceptance_token: 'test_acceptance_token' },
            presigned_personal_data_auth: { acceptance_token: 'test_personal_auth_token' },
          },
        },
      });

      const tokens = await service.getAcceptanceTokens();
      expect(tokens).toEqual({
        acceptance_token: 'test_acceptance_token',
        accept_personal_auth: 'test_personal_auth_token',
      });
    });

    it('should throw an error if the request fails', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: { message: 'Error fetching tokens' } } },
      });

      await expect(service.getAcceptanceTokens()).rejects.toThrow(HttpException);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'transaction_id', status: 'APPROVED' },
      });

      const payload = {
        amount_in_cents: 10000,
        currency: 'COP',
        customer_email: 'test@example.com',
        payment_method: { type: 'CARD', token: 'test_token', installments: 1 },
        reference: 'test_reference',
        payment_description: 'Test Payment',
        acceptance_token: 'test_acceptance_token',
        accept_personal_auth: 'test_personal_auth_token',
      };

      const transaction = await service.createTransaction(payload);
      expect(transaction).toEqual({ id: 'transaction_id', status: 'APPROVED' });
    });

    it('should throw an error if the transaction fails', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: { message: 'Transaction failed' } } },
      });

      const payload = {
        amount_in_cents: 10000,
        currency: 'COP',
        customer_email: 'test@example.com',
        payment_method: { type: 'CARD', token: 'test_token', installments: 1 },
        reference: 'test_reference',
        payment_description: 'Test Payment',
        acceptance_token: 'test_acceptance_token',
        accept_personal_auth: 'test_personal_auth_token',
      };

      await expect(service.createTransaction(payload)).rejects.toThrow(HttpException);
    });
  });

  describe('tokenizeCard', () => {
    it('should tokenize a card successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'card_token_id' },
      });

      const cardDetails = {
        number: '4111111111111111',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      };

      const token = await service.tokenizeCard(cardDetails);
      expect(token).toEqual({ id: 'card_token_id' });
    });

    it('should throw an error if tokenization fails', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: { message: 'Tokenization failed' } } },
      });

      const cardDetails = {
        number: '4111111111111111',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      };

      await expect(service.tokenizeCard(cardDetails)).rejects.toThrow(HttpException);
    });
  });

  describe('getPublicInfo', () => {
    it('should fetch public info successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { id: 'merchant_id', name: 'Test Merchant' },
      });

      const publicInfo = await service.getPublicInfo();
      expect(publicInfo).toEqual({ id: 'merchant_id', name: 'Test Merchant' });
    });

    it('should throw an error if fetching public info fails', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: { message: 'Public info fetch failed' } } },
      });

      await expect(service.getPublicInfo()).rejects.toThrow(HttpException);
    });
  });

  describe('getTransactionStatus', () => {
    it('should fetch transaction status successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { id: 'transaction_id', status: 'APPROVED' },
      });

      const status = await service.getTransactionStatus('transaction_id');
      expect(status).toEqual({ id: 'transaction_id', status: 'APPROVED' });
    });

    it('should throw an error if fetching transaction status fails', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: { message: 'Transaction status fetch failed' } } },
      });

      await expect(service.getTransactionStatus('transaction_id')).rejects.toThrow(HttpException);
    });
  });
});
