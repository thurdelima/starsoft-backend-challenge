import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../../infra/database/entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Identificador único do produto',
    example: 'prod-001',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantidade do produto no pedido',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário do produto (formato decimal como string)',
    example: '29.99',
    pattern: '^\\d+\\.\\d{2}$'
  })
  @IsString()
  price: string;
}

export class CreateOrderDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'Status inicial do pedido (opcional, padrão: PENDING)',
    example: OrderStatus.PENDING,
    required: false
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Lista de itens do pedido',
    example: [
      {
        productId: 'prod-001',
        quantity: 2,
        price: '29.99'
      },
      {
        productId: 'prod-002',
        quantity: 1,
        price: '15.50'
      }
    ],
    minItems: 1
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}


