import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class FindOrdersByUserIdParams {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsUUID()
  user_id: string;
}
