import { Controller, Post, Get, Body, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ServerError, ServerResponse } from 'src/config/server-response.config';
import {
  ProductResponseDto,
  ProductsResponseDto,
} from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create product',
    description: '',
  })
  @ApiOkResponse({
    description: 'Create product success',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: `there is no user with this id`,
    type: ServerError,
  })
  async create(@Body() createProductDto: CreateProductDto) {
    const response: ProductResponseDto =
      await this.productsService.create(createProductDto);
    return new ServerResponse(HttpStatus.OK, 'success', response);
  }

  @Get()
  @ApiOperation({
    summary: 'Create product',
    description: '',
  })
  @ApiOkResponse({
    description: 'Create product success',
    type: ProductsResponseDto,
  })
  @ApiNotFoundResponse({
    description: `there is no user with this id`,
    type: ServerError,
  })
  async findAll() {
    const records: ProductResponseDto[] = await this.productsService.findAll();
    const response: ProductsResponseDto = new ProductsResponseDto(records);
    return new ServerResponse(HttpStatus.OK, 'success', response);
  }
}
