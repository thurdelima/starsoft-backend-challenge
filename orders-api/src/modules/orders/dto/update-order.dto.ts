import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested, IsUUID, IsInt, IsPositive, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../../infra/database/entities/order.entity';

export class UpdateOrderItemDto {
  @ApiProperty({ description: 'ID do item existente (para atualizar). Se omitido, será criado', required: false })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'ID do produto. Obrigatório quando id não é enviado', example: '11111111-1111-1111-1111-111111111111', required: false })
  @ValidateIf((o) => !o.id)
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantidade desejada', example: 2 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Preço unitário (string decimal com 2 casas)', example: '29.99' })
  @IsString()
  price: string;
}

export class UpdateOrderDto {
  @ApiProperty({ enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ type: [UpdateOrderItemDto], required: false, description: 'Lista completa a ser aplicada (upsert). Itens não enviados serão removidos' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  items?: UpdateOrderItemDto[];
}


