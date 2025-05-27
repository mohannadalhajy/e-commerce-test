import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, IsUUID } from 'class-validator';
export class OrderItemDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsUUID()
  productId: string;
  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsUUID()
  userId: string;
  @ApiProperty({ type: OrderItemDto, required: true, isArray: true })
  @IsArray()
  items: OrderItemDto[];
}
