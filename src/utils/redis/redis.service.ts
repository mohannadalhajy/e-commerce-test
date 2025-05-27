import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client;

  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  // Product caching methods
  async cacheProducts(products: any[]) {
    await this.client.set('products:all', JSON.stringify(products), {
      EX: 60, // 60 seconds expiration
    });
  }

  async getCachedProducts() {
    const cachedProducts = await this.client.get('products:all');
    return cachedProducts ? JSON.parse(cachedProducts) : null;
  }

  async invalidateProductCache() {
    await this.client.del('products:all');
  }

  // Rate limiting methods
  async checkRateLimit(userId: string, limit: number, windowSeconds: number) {
    const key = `ratelimit:orders:${userId}`;
    const count = await this.client.get(key);

    if (count && parseInt(count) >= limit) {
      return false; // Rate limit exceeded
    }

    await this.client.incr(key);
    await this.client.expire(key, windowSeconds);
    return true; // Within rate limit
  }

  // Optional: Stock level caching
  async cacheStockLevel(productId: string, stock: number) {
    await this.client.set(`stock:${productId}`, stock.toString(), {
      EX: 300, // 5 minutes expiration
    });
  }

  async getCachedStockLevel(productId: string) {
    const stock = await this.client.get(`stock:${productId}`);
    return stock ? parseInt(stock) : null;
  }

  // General Redis methods
  async set(key: string, value: string, expireSeconds?: number) {
    if (expireSeconds) {
      await this.client.set(key, value, { EX: expireSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async incr(key: string) {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number) {
    await this.client.expire(key, seconds);
  }
}
