import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './application/products.service';
import { TransactionsService } from './application/transactions.service';

import { WompiService } from './infrastructure/wompi/wompi.service';
import { TransactionRepository } from './infrastructure/typeorm/transaction.repository';
import { ProductRepository } from './infrastructure/typeorm/product.repository';

import { TransactionsController } from './transactions/transactions.controller';
import { ProductsController } from './products/products.controller';
import { PaymentsController } from './payments/payments.controller';

import { TransactionEntity } from './transactions/transaction.entity';
import { Product } from './products/product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [TransactionEntity, Product],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([TransactionEntity, Product]),
  ],
  controllers: [
    TransactionsController,
    ProductsController,
    PaymentsController,
  ],
  providers: [
    TransactionsService,
    ProductsService,
    WompiService,
    { provide: 'IWompiService', useClass: WompiService },
    { provide: 'ITransactionRepository', useClass: TransactionRepository },
    { provide: 'IProductRepository', useClass: ProductRepository },
  ],
})
export class AppModule {}
