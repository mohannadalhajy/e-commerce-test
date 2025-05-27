import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';
import { DatabaseModule } from 'src/utils/database/database.module';
import { RedisModule } from 'src/utils/redis/redis.module';
@Module({
  imports: [ProductsModule, DatabaseModule, RedisModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
