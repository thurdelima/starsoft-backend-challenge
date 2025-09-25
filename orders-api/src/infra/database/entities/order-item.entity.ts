import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({
    description: 'ID único do item do pedido',
    example: '39f858b0-b78c-48bb-9d2d-ae5d3718b2ec',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: () => Order,
    description: 'Pedido ao qual este item pertence',
  })
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ApiProperty({
    description: 'Produto associado ao item',
    type: () => Product,
  })
  @ManyToOne(() => Product, { eager: true, onDelete: 'RESTRICT' })
  product: Product;

  @ApiProperty({
    description: 'Quantidade do produto no pedido',
    example: 2,
  })
  @Column({ type: 'integer' })
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário do produto (formato decimal)',
    example: '29.99',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;
}
