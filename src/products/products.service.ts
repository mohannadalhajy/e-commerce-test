import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateProductDto } from './dto/create-product.dto';
import { ServerError } from 'src/config/server-response.config';
import SERVER_ERRORS from 'src/config/server-errors.config';
import IProduct from './product.interface';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    @Inject('REDIS_CLIENT') private redisClient,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    // Insert new product with raw SQL
    const query = `
      INSERT INTO products (name, price, stock)
      VALUES ($1, $2, $3)
      RETURNING id, name, price, stock, created_at
    `;

    const values = [
      createProductDto.name,
      createProductDto.price,
      createProductDto.stock,
    ];

    try {
      const result = await this.pool.query(query, values);

      // Invalidate cache when a new product is created
      await this.redisClient.del('products:all');
      const record: IProduct = result.rows[0];
      return new ProductResponseDto(record);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<ProductResponseDto[]> {
    // Try to get products from Redis cache
    const cachedProducts = await this.redisClient.get('products:all');

    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    // If not in cache, get from database with raw SQL
    const query = `
      SELECT id, name, price, stock, created_at
      FROM products
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query);
    const products: IProduct[] = result.rows;

    // Store in Redis cache for 60 seconds
    await this.redisClient.set('products:all', JSON.stringify(products), {
      EX: 60, // 60 seconds expiration
    });

    return products.map((product) => new ProductResponseDto(product));
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const query = `
      SELECT id, name, price, stock, created_at
      FROM products
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    const record = result.rows[0];
    if (!record)
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `Product with ID ${id} not found`,
        SERVER_ERRORS.PRODUCT_NOT_FOUND,
      );
    return new ProductResponseDto(record);
  }

  async updateStock(
    id: string,
    quantity: number,
    client: any = this.pool,
  ): Promise<ProductResponseDto> {
    // Update product stock with raw SQL
    // Using the provided client to support transactions
    const query = `
      UPDATE products
      SET stock = stock - $2
      WHERE id = $1 AND stock >= $2
      RETURNING id, name, price, stock, created_at
    `;

    const result = await client.query(query, [id, quantity]);

    if (result.rowCount === 0) {
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `Product ${id} is out of stock or not found`,
        SERVER_ERRORS.PRODUCT_NOT_FOUND,
      );
    }

    // Invalidate cache when stock is updated
    await this.redisClient.del('products:all');
    const record = result.rows[0];
    return new ProductResponseDto(record);
  }
}
