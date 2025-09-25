import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({
    description: 'ID único do produto',
    example: '9a3f0b2e-8d5b-4b77-8c63-7e8a0f1c2a99',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome do produto',
    example: 'Fone de Ouvido Bluetooth',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ description: 'Preço unitário do produto', example: '199.90' })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @ApiProperty({ description: 'Quantidade disponível em estoque', example: 25 })
  @Column({ type: 'integer', name: 'stock_qty' })
  stockQty: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-09-25T01:21:15.092Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-09-25T01:21:26.472Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
