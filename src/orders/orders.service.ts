import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import IOrder from './order.interface';
import { IOrderItem } from './order-item.interface';
import { OrderResponseDto } from './dto/order-response.dto';
import { ServerError } from 'src/config/server-response.config';
import SERVER_ERRORS from 'src/config/server-errors.config';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    @Inject('REDIS_CLIENT') private redisClient,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Implement rate limiting: Max 5 orders per minute per user
    const userId = createOrderDto.userId;
    const rateLimitKey = `ratelimit:orders:${userId}`;
    const currentCount = await this.redisClient.get(rateLimitKey);

    if (currentCount && parseInt(currentCount) >= 5) {
      throw new ServerError(
        HttpStatus.TOO_MANY_REQUESTS,
        'Rate limit exceeded. Maximum 5 orders per minute.',
        SERVER_ERRORS.TOO_MANY_REQUESTS,
      );
    }

    // Check if user exists
    const userQuery = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
    const userResult = await this.pool.query(userQuery, [userId]);
    if (!userResult.rows[0].exists) {
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `User with ID ${userId} not found`,
        SERVER_ERRORS.USER_NOT_FOUND,
      );
    }

    // Validate order items
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new ServerError(
        HttpStatus.BAD_REQUEST,
        'Order must contain at least one item',
        SERVER_ERRORS.ORDER_WITH_NO_ITEMS,
      );
    }

    // Start a transaction
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount)
        VALUES ($1, 0)
        RETURNING id, user_id, total_amount, created_at
      `;
      const orderResult = await client.query(orderQuery, [userId]);
      const order = orderResult.rows[0];

      // Process order items and update stock atomically
      let totalAmount = 0;
      const orderItems: IOrderItem[] = [];

      for (const item of createOrderDto.items) {
        // Get product details
        const productQuery = `
          SELECT id, name, price, stock
          FROM products
          WHERE id = $1
        `;
        const productResult = await client.query(productQuery, [
          item.productId,
        ]);
        const product = productResult.rows[0];

        if (!product) {
          throw new ServerError(
            HttpStatus.NOT_FOUND,
            `Product with ID ${item.productId} not found`,
            SERVER_ERRORS.PRODUCT_NOT_FOUND,
          );
        }

        if (product.stock < item.quantity) {
          throw new ServerError(
            HttpStatus.BAD_REQUEST,
            `Insufficient stock for product ${product.name}`,
            SERVER_ERRORS.PRODUCT_INSUFFICIENT_STOCK,
          );
        }

        // Update product stock
        const updateStockQuery = `
          UPDATE products
          SET stock = stock - $1
          WHERE id = $2
          RETURNING stock
        `;
        await client.query(updateStockQuery, [item.quantity, item.productId]);

        // Calculate item total
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        // Create order item
        const orderItemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING id, order_id, product_id, quantity, price
        `;
        const orderItemResult = await client.query(orderItemQuery, [
          order.id,
          item.productId,
          item.quantity,
          product.price,
        ]);
        orderItems.push(orderItemResult.rows[0]);
      }

      // Update order total amount
      const updateOrderQuery = `
        UPDATE orders
        SET total_amount = $1
        WHERE id = $2
        RETURNING id, user_id, total_amount, created_at
      `;
      const updatedOrderResult = await client.query(updateOrderQuery, [
        totalAmount,
        order.id,
      ]);
      const updatedOrder: IOrder = updatedOrderResult.rows[0];

      // Commit transaction
      await client.query('COMMIT');

      // Increment rate limit counter
      await this.redisClient.incr(rateLimitKey);
      // Set expiry if it's a new key
      await this.redisClient.expire(rateLimitKey, 60);

      // Invalidate product cache
      await this.redisClient.del('products:all');

      // Return order with items
      return new OrderResponseDto(updatedOrder, orderItems);
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release client back to pool
      client.release();
    }
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    // Get order
    const orderQuery = `
      SELECT id, user_id, total_amount, created_at
      FROM orders
      WHERE id = $1
    `;
    const orderResult = await this.pool.query(orderQuery, [id]);
    const order: IOrder = orderResult.rows[0];

    if (!order) {
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `Order with ID ${id} not found`,
        SERVER_ERRORS.ORDER_NOT_FOUND,
      );
    }

    // Get order items
    const itemsQuery = `
      SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await this.pool.query(itemsQuery, [id]);
    const items: IOrderItem[] = itemsResult.rows;

    // Return order with items
    return new OrderResponseDto(order, items);
  }

  async findByUser(userId: string): Promise<OrderResponseDto[]> {
    // Check if user exists
    const userQuery = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
    const userResult = await this.pool.query(userQuery, [userId]);
    if (!userResult.rows[0].exists) {
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `User with ID ${userId} not found`,
        SERVER_ERRORS.USER_NOT_FOUND,
      );
    }

    // Get all orders for user
    const ordersQuery = `
      SELECT id, user_id, total_amount, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const ordersResult = await this.pool.query(ordersQuery, [userId]);
    const orders = ordersResult.rows;

    // Get items for each order
    const ordersWithItems: OrderResponseDto[] = await Promise.all(
      orders.map(async (order: IOrder) => {
        const itemsQuery = `
          SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name as product_name
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `;
        const itemsResult = await this.pool.query(itemsQuery, [order.id]);
        const items: IOrderItem[] = itemsResult.rows;
        return new OrderResponseDto(order, items);
      }),
    );

    return ordersWithItems;
  }
}
