import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../infra/database/entities/order.entity';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'ID único do item do pedido',
    example: '39f858b0-b78c-48bb-9d2d-ae5d3718b2ec'
  })
  id: string;

  @ApiProperty({
    description: 'Identificador do produto',
    example: 'prod-001'
  })
  productId: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário do produto',
    example: '29.99'
  })
  price: string;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'ID único do pedido',
    example: '84d1a71c-02ff-441f-9ba3-caa45a394f41'
  })
  id: string;

  @ApiProperty({
    enum: OrderStatus,
    description: 'Status atual do pedido',
    example: OrderStatus.PENDING
  })
  status: OrderStatus;

  @ApiProperty({
    type: [OrderItemResponseDto],
    description: 'Lista de itens do pedido'
  })
  items: OrderItemResponseDto[];

  @ApiProperty({
    description: 'Data de criação do pedido',
    example: '2025-09-25T01:21:15.092Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do pedido',
    example: '2025-09-25T01:21:26.472Z'
  })
  updatedAt: Date;
}
