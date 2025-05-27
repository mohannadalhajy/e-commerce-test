import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  name: string;
  @ApiProperty({ type: String, required: true })
  @IsEmail()
  email: string;
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  referred_by?: string;
  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  is_developer?: boolean;
}
