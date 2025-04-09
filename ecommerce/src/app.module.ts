import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './application/products.service';
import { TransactionsService } from './application/transactions.service';

import { TransactionEntity } from './domain/entities/transaction.entity';
import { ProductEntity } from './domain/entities/product.entity';

import { ProductsController } from './infrastructure/controllers/products.controller';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { PaymentsController } from '@controllers/payments.controller';
import { ImagesController } from './infrastructure/controllers/images.controller';

import { WompiService } from './infrastructure/adapters/wompi/wompi.service';
import { TransactionRepository } from '@adapters/typeorm/transaction.repository';
import { ProductRepository } from '@adapters/typeorm/product.repository';

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
        entities: [TransactionEntity, ProductEntity],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([TransactionEntity, ProductEntity]),
  ],
  controllers: [
    TransactionsController,
    ProductsController,
    PaymentsController,
    ImagesController,
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
