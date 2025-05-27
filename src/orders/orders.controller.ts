import { Controller, Post, Get, Param, Body, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ServerError, ServerResponse } from 'src/config/server-response.config';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { OrderResponseDto, OrdersResponseDto } from './dto/order-response.dto';
import { FindOrdersByUserIdParams } from './dto/get-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create order',
    description: '',
  })
  @ApiOkResponse({
    description: 'Create order success',
    type: OrderResponseDto,
  })
  @ApiNotFoundResponse({
    description: `there is no user with this id`,
    type: ServerError,
  })
  async create(@Body() createOrderDto: CreateOrderDto) {
    const response: OrderResponseDto =
      await this.ordersService.create(createOrderDto);
    return new ServerResponse(HttpStatus.OK, 'success', response);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by id',
    description: '',
  })
  @ApiOkResponse({
    description: 'Get order by id success',
    type: OrderResponseDto,
  })
  @ApiNotFoundResponse({
    description: `there is no order with this id`,
    type: ServerError,
  })
  async findOne(@Param('id') id: string) {
    const result: OrderResponseDto = await this.ordersService.findOne(id);
    return new ServerResponse(HttpStatus.OK, 'success', result);
  }

  @Get('/user/:user_id')
  @ApiOperation({
    summary: 'Get order by id',
    description: '',
  })
  @ApiOkResponse({
    description: 'Get order by id success',
    type: OrdersResponseDto,
  })
  @ApiNotFoundResponse({
    description: `there is no order with this id`,
    type: ServerError,
  })
  async findByUser(@Param() body: FindOrdersByUserIdParams) {
    const orders: OrderResponseDto[] = await this.ordersService.findByUser(
      body.user_id,
    );
    const response: OrdersResponseDto = new OrdersResponseDto(orders);
    return new ServerResponse(HttpStatus.OK, 'success', response);
  }
}
