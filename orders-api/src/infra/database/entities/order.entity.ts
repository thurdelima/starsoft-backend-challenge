import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

@Entity('orders')
export class Order {
  @ApiProperty({
    description: 'ID único do pedido',
    example: '84d1a71c-02ff-441f-9ba3-caa45a394f41'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    enum: OrderStatus,
    description: 'Status atual do pedido',
    example: OrderStatus.PENDING
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({
    type: () => [OrderItem],
    description: 'Lista de itens do pedido'
  })
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @ApiProperty({
    description: 'Data de criação do pedido',
    example: '2025-09-25T01:21:15.092Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do pedido',
    example: '2025-09-25T01:21:26.472Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indica se o pedido foi deletado (soft delete)',
    example: false
  })
  @Column({ type: 'boolean', default: false })
  deleted: boolean;
}


