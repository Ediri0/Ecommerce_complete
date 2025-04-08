import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should complete a transaction successfully', async () => {
    const productResponse = await request(app.getHttpServer()).get('/products');
    const product = productResponse.body[0];

    const transactionResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send({ productId: product.id, amount: product.price, currency: 'COP', reference: 'test-ref' });

    expect(transactionResponse.status).toBe(201);
    expect(transactionResponse.body.status).toBe('PENDING');
  });
});
