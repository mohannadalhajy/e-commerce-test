# Order API Assessment Requirements

## Overview
This document outlines the detailed requirements for implementing a modular RESTful API for a basic e-commerce order management system using NestJS, PostgreSQL (with raw SQL queries only), and Redis. The system must be containerized using Docker Compose.

## Tech Stack
- **NestJS**: Framework for building server-side applications
  - No ORM allowed - must use raw SQL queries only
- **PostgreSQL**: Database for storing application data
- **Redis**: For caching and rate limiting
- **Docker & Docker Compose**: For containerization and orchestration

## Database Schema

### Users Table
The developer is expected to design and implement the users table schema with the following requirements:
- Must support a referral system (users can refer other users)
- Admins should be able to:
  - See who referred any given user
  - View all users referred by a specific user in an optimized way
- Suggested columns:
  - `id` (UUID, PK): Unique identifier
  - `name` (TEXT): User's name
  - `email` (TEXT): User's email address
  - `referred_by` (UUID, FK to users.id): ID of the user who referred this user
  - `is_developer` (BOOLEAN): Flag to identify developers
  - `created_at` (TIMESTAMP): Auto-generated timestamp

### Products Table
- `id` (UUID, PK): Unique identifier
- `name` (TEXT): Product name
- `price` (NUMERIC): Product price
- `stock` (INTEGER): Units in stock
- `created_at` (TIMESTAMP): Auto-generated timestamp

### Orders Table
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): Foreign key to users
- `total_amount` (NUMERIC): Sum of order items
- `created_at` (TIMESTAMP): Auto-generated timestamp

### Order Items Table
- `id` (UUID, PK): Unique identifier
- `order_id` (UUID, FK): Foreign key to orders
- `product_id` (UUID, FK): Foreign key to products
- `quantity` (INTEGER): Quantity purchased
- `price` (NUMERIC): Price at time of order

## API Requirements

### Users Endpoints
1. **POST /users**
   - Create a new user
   - Accept optional `referred_by` and `is_developer` fields
   - Return the created user

2. **GET /users/:id/referrals**
   - List all users referred by a given user
   - Return a list of users

3. **GET /users/:id/referrer**
   - Get the user who referred the given user (if any)
   - Return the referrer user or null

### Products Endpoints
1. **POST /products**
   - Create a product
   - Return the created product

2. **GET /products**
   - List all products
   - Implement Redis cache for 60 seconds
   - Return a list of products

### Orders Endpoints
1. **POST /orders**
   - Create a new order
   - Accept a list of products and quantities
   - Deduct stock atomically using transactions
   - Implement rate limiting: Max 5 orders per minute per user
   - Return the created order with items

2. **GET /orders/:id**
   - Get order with items
   - Return the order with its items

3. **GET /users/:id/orders**
   - List all orders for a user
   - Return a list of orders

## Redis Usage
1. **Product Cache**
   - Cache GET /products response for 60 seconds
   - Invalidate cache when products are updated

2. **Rate Limiting**
   - Max 5 orders per minute per user on POST /orders (per user ID)
   - Implement using Redis counters

3. **Optional: Stock Levels**
   - Store frequently accessed stock levels in Redis
   - Update Redis when stock levels change

## Bonus Features (Optional)
1. **Unit Tests**
   - Implement unit tests for services (especially order + stock)
   - Focus on transaction handling and stock management

2. **Redis Pub/Sub**
   - Implement Redis Pub/Sub for logging or stock changes
   - Create a subscriber service to handle events

## Deliverables
1. **GitHub Repository or ZIP file**
   - Complete source code

2. **docker-compose.yml file**
   - Should spin up NestJS, PostgreSQL, Redis
   - Configure networking between services

3. **Database schema/seed script**
   - Raw SQL scripts for creating tables
   - Seed data for testing

4. **Postman collection or Swagger docs**
   - API documentation
   - Example requests and responses

5. **README.md with:**
   - Setup instructions
   - How Redis is used
   - Raw SQL approach explanation
