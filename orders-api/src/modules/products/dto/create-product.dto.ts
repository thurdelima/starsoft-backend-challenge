import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Fone de Ouvido Bluetooth' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '199.90',
    description: 'Preço como string decimal (duas casas)',
  })
  @IsString()
  @IsNumberString()
  price: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  @IsPositive()
  stockQty: number;
}
