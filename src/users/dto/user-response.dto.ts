import { ApiProperty } from '@nestjs/swagger';
import IUser from '../user.interface';

export class UserResponseDto {
  @ApiProperty({ type: String, required: true })
  id: string;
  @ApiProperty({ type: String, required: true })
  name: string;
  @ApiProperty({ type: String, required: true })
  email: string;
  @ApiProperty({ type: String, required: true })
  referred_by: string;
  @ApiProperty({ type: Boolean, required: true })
  is_developer: boolean;
  @ApiProperty({ type: Date, required: true })
  created_at: Date;
  constructor(user: IUser) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.referred_by = user.referred_by;
    this.is_developer = user.is_developer;
    this.created_at = user.created_at;
  }
}
export class UsersResponseDto {
  @ApiProperty({ type: UserResponseDto, required: true, isArray: true })
  users: UserResponseDto[];
  constructor(users: UserResponseDto[]) {
    this.users = users;
  }
}
