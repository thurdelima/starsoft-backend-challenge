import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../infra/database/entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'Novo status do pedido',
    example: OrderStatus.PROCESSING,
    enumName: 'OrderStatus'
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}


