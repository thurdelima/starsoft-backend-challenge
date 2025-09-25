import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
import { Order } from './src/infra/database/entities/order.entity';
import { OrderItem } from './src/infra/database/entities/order-item.entity';

export default {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'marketplace',
  entities: [Order, OrderItem],
  migrations: ['dist/infra/database/migrations/*.js'],
  synchronize: false,
  logging: false,
} as DataSourceOptions;
