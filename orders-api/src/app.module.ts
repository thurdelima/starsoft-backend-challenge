import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order } from './infra/database/entities/order.entity';
import { OrderItem } from './infra/database/entities/order-item.entity';
import { Product } from './infra/database/entities/product.entity';
import { KafkaModule } from './common/kafka/kafka.module';
import { ElasticsearchModule } from './common/elasticsearch/elasticsearch.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: { target: 'pino-pretty' },
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'marketplace',
      entities: [Order, OrderItem, Product],
      synchronize: false,
      autoLoadEntities: false,
    }),
    KafkaModule,
    ElasticsearchModule,
    OrdersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
