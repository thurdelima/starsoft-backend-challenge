import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../../infra/database/entities/order.entity';

export class SearchOrdersDto {
  @ApiProperty({
    description: 'ID específico do pedido para busca',
    example: '84d1a71c-02ff-441f-9ba3-caa45a394f41',
    required: false,
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    enum: OrderStatus,
    description: 'Filtrar por status do pedido',
    example: OrderStatus.PENDING,
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    description: 'Data de início para filtro (formato ISO 8601)',
    example: '2025-09-25T00:00:00.000Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiProperty({
    description: 'Data de fim para filtro (formato ISO 8601)',
    example: '2025-09-25T23:59:59.999Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  toDate?: string;

  @ApiProperty({
    description: 'ID do produto para filtrar pedidos que contenham este item',
    example: 'prod-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  item?: string;
}
