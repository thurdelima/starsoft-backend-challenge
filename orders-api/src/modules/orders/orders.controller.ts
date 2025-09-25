import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { SearchOrdersDto } from './dto/search-orders.dto';
import { OrderStatus } from '../../infra/database/entities/order.entity';

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo pedido',
    description:
      'Cria um novo pedido com os itens especificados. O pedido será criado com status PENDING por padrão e eventos serão publicados no Kafka.',
  })
  @ApiCreatedResponse({
    description: 'Pedido criado com sucesso',
    type: OrderResponseDto,
    example: {
      id: '84d1a71c-02ff-441f-9ba3-caa45a394f41',
      status: 'PENDING',
      items: [
        {
          id: '39f858b0-b78c-48bb-9d2d-ae5d3718b2ec',
          productId: '11111111-1111-1111-1111-111111111111',
          quantity: 2,
          price: '29.99',
        },
      ],
      createdAt: '2025-09-25T01:21:15.092Z',
      updatedAt: '2025-09-25T01:21:15.092Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
    example: {
      statusCode: 400,
      message: ['items must contain at least 1 elements'],
      error: 'Bad Request',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os pedidos',
    description:
      'Retorna uma lista de todos os pedidos cadastrados no sistema.',
  })
  @ApiOkResponse({
    description: 'Lista de pedidos retornada com sucesso',
    type: [OrderResponseDto],
  })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar pedidos com filtros',
    description:
      'Busca pedidos utilizando filtros avançados através do Elasticsearch. Permite filtrar por ID, status, intervalo de datas e itens específicos.',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'ID específico do pedido',
    example: '84d1a71c-02ff-441f-9ba3-caa45a394f41',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Status do pedido',
    example: OrderStatus.PENDING,
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Data de início (ISO 8601)',
    example: '2025-09-25T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'Data de fim (ISO 8601)',
    example: '2025-09-25T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'item',
    required: false,
    description: 'ID do produto',
    example: 'prod-001',
  })
  @ApiOkResponse({
    description: 'Resultados da busca retornados com sucesso',
    type: [OrderResponseDto],
    example: [
      {
        id: '84d1a71c-02ff-441f-9ba3-caa45a394f41',
        status: 'PENDING',
        createdAt: '2025-09-25T01:21:15.092Z',
        items: [
          {
            id: '39f858b0-b78c-48bb-9d2d-ae5d3718b2ec',
            productId: 'prod-001',
            quantity: 2,
            price: '29.99',
          },
        ],
      },
    ],
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de busca inválidos',
    example: {
      statusCode: 400,
      message: 'Invalid date format',
      error: 'Bad Request',
    },
  })
  search(
    @Query('id') id?: string,
    @Query('status') status?: OrderStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('item') item?: string,
  ) {
    return this.ordersService.search({ id, status, fromDate, toDate, item });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
    description:
      'Retorna os detalhes de um pedido específico através do seu ID único.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pedido',
    example: '84d1a71c-02ff-441f-9ba3-caa45a394f41',
  })
  @ApiOkResponse({
    description: 'Pedido encontrado com sucesso',
    type: OrderResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Pedido não encontrado',
    example: {
      statusCode: 404,
      message: 'Order not found',
      error: 'Not Found',
    },
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido (status e itens via upsert)' })
  @ApiOkResponse({ description: 'Pedido atualizado', type: OrderResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar pedido',
    description:
      'Remove um pedido do sistema. O pedido e seus itens serão removidos do banco de dados e do Elasticsearch.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pedido',
    example: '84d1a71c-02ff-441f-9ba3-caa45a394f41',
  })
  @ApiOkResponse({
    description: 'Pedido deletado com sucesso',
    example: '',
  })
  @ApiNotFoundResponse({
    description: 'Pedido não encontrado',
    example: {
      statusCode: 404,
      message: 'Order not found',
      error: 'Not Found',
    },
  })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
