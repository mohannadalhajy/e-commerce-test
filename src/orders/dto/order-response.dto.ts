import { ApiProperty } from '@nestjs/swagger';
import { IOrderItem } from '../order-item.interface';
import IOrder from '../order.interface';

class CreateOrderItemResponseDto {
  @ApiProperty({ type: String, required: true })
  id: string;
  @ApiProperty({ type: String, required: true })
  order_id: string;
  @ApiProperty({ type: String, required: true })
  product_id: string;
  @ApiProperty({ type: Number, required: true })
  quantity: number;
  @ApiProperty({ type: Number, required: true })
  price: number;
  constructor(order_item: IOrderItem) {
    this.id = order_item.id;
    this.order_id = order_item.order_id;
    this.product_id = order_item.product_id;
    this.quantity = order_item.quantity;
    this.price = order_item.price;
  }
}
export class OrderResponseDto {
  @ApiProperty({ type: String, required: true })
  id: string;
  @ApiProperty({ type: Number, required: true })
  total_amount: number;
  @ApiProperty({ type: String, required: true })
  user_id: string;
  @ApiProperty({ type: Date, required: true })
  created_at: Date;
  @ApiProperty({
    type: CreateOrderItemResponseDto,
    required: true,
    isArray: true,
  })
  items: CreateOrderItemResponseDto[];
  constructor(order: IOrder, items: IOrderItem[]) {
    this.id = order.id;
    this.total_amount = order.total_amount;
    this.user_id = order.user_id;
    this.created_at = order.created_at;
    this.items = items.map((item) => new CreateOrderItemResponseDto(item));
  }
}
export class OrdersResponseDto {
  @ApiProperty({ type: OrderResponseDto, required: true, isArray: true })
  oders: OrderResponseDto[];
  constructor(orders: OrderResponseDto[]) {
    this.oders = orders;
  }
}
