  import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './infra/database/data-source';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Orders API')
    .setDescription(`
      ## API de Gerenciamento de Pedidos
      
      Esta API permite o gerenciamento completo de pedidos de e-commerce, incluindo:
      
      - **CRUD de Pedidos**: Criar, listar, buscar, atualizar e deletar pedidos
      - **Integração com Kafka**: Eventos de criação e atualização de status são publicados automaticamente
      - **Busca Avançada**: Filtros por status, data, itens através do Elasticsearch
      - **Validação de Dados**: Validação automática de payloads com mensagens de erro detalhadas
      
      ### Status dos Pedidos
      - \`PENDING\`: Pedido criado, aguardando processamento
      - \`PROCESSING\`: Pedido em processamento
      - \`SHIPPED\`: Pedido enviado
      - \`DELIVERED\`: Pedido entregue
      - \`CANCELED\`: Pedido cancelado
      
      ### Eventos Kafka
      - \`order_created\`: Publicado quando um novo pedido é criado
      - \`order_status_updated\`: Publicado quando o status de um pedido é atualizado
    `)
    .setVersion('1.0.0')
    .setContact('Desenvolvedor', 'https://github.com/arthur-lima', 'arthur@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Servidor de Desenvolvimento')
    .addServer('https://api.example.com', 'Servidor de Produção')
    .addTag('Pedidos', 'Operações relacionadas ao gerenciamento de pedidos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
