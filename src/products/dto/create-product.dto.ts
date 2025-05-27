import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
export class CreateProductDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  name: string;
  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  price: number;
  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  stock: number;
}
