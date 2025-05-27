import { ApiProperty } from '@nestjs/swagger';
import IProduct from '../product.interface';

export class ProductResponseDto {
  @ApiProperty({ type: String, required: true })
  id: string;
  @ApiProperty({ type: String, required: true })
  name: string;
  @ApiProperty({ type: Number, required: true })
  price: number;
  @ApiProperty({ type: Number, required: true })
  stock: number;
  @ApiProperty({ type: Date, required: true })
  created_at: Date;
  constructor(product: IProduct) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.stock = product.stock;
    this.created_at = product.created_at;
  }
}
export class ProductsResponseDto {
  @ApiProperty({ type: ProductResponseDto, required: true, isArray: true })
  products: ProductResponseDto[];
  constructor(products: ProductResponseDto[]) {
    this.products = products;
  }
}
