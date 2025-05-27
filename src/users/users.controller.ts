import { Controller, Post, Get, Param, Body, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindReferrerUsers } from './dto/get-user.dto';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ServerError, ServerResponse } from 'src/config/server-response.config';
import { UserResponseDto, UsersResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: '',
  })
  @ApiOkResponse({
    description: 'Create user success',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: `Error`,
    type: ServerError,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const response: UserResponseDto =
      await this.usersService.create(createUserDto);
    return new ServerResponse(HttpStatus.OK, 'success', response);
  }

  @Get(':user_id/referrals')
  @ApiOperation({
    summary: 'Get referrals users for user',
    description: '',
  })
  @ApiOkResponse({
    description: 'Get referrals users for user success',
    type: UsersResponseDto,
  })
  @ApiNotFoundResponse({
    description: `there is no user with this id`,
    type: ServerError,
  })
  async findReferrals(@Param() body: FindReferrerUsers) {
    const records: UserResponseDto[] = await this.usersService.findReferrals(
      body.user_id,
    );
    const response: UsersResponseDto = new UsersResponseDto(records);
    return new ServerResponse(HttpStatus.OK, 'success', response);
  }

  @Get(':user_id/referrer')
  @ApiOperation({
    summary: 'Get referrer user',
    description: '',
  })
  @ApiOkResponse({
    description: 'Get referrer user success',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: `there is no user with this id`,
    type: ServerError,
  })
  async findReferrer(@Param() body: FindReferrerUsers) {
    const response: UserResponseDto = await this.usersService.findReferrer(
      body.user_id,
    );
    return new ServerResponse(HttpStatus.OK, 'success', response);
  }
}
