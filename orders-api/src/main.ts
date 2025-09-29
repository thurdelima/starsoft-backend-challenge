import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './infra/database/data-source';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Product } from './infra/database/entities/product.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Orders API')
    .setDescription(
      [
        '# API de Gerenciamento de Pedidos',
        '',
        'Funcionalidades:',
        '- CRUD de pedidos (criar, listar, buscar, atualizar status, deletar)',
        '- CRUD de produtos (criar, listar, buscar, atualizar, deletar)',
        '- Publicação de eventos no Kafka',
        '- Busca avançada via Elasticsearch (status, datas, itens, id)',
        '',
        'Status dos pedidos:',
        '- PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELED',
        '',
        'Tópicos Kafka:',
        '- order_created',
        '- order_status_updated',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addTag('Pedidos', 'Operações relacionadas ao gerenciamento de pedidos')
    .addTag('Produtos', 'Operações relacionadas ao gerenciamento de produtos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  const url = await app.getUrl();
  const prettyUrl = url.replace('[::1]', 'localhost');
  console.log(`🚀 API running on: ${prettyUrl}`);
  console.log(`📘 Swagger: ${prettyUrl}/api-docs`);
}
bootstrap();
