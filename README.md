# Order API Assessment

## Overview
This project implements a modular RESTful API for a basic e-commerce order management system using NestJS, PostgreSQL (with raw SQL queries only), and Redis. The system is containerized using Docker Compose.

## Tech Stack
- **NestJS**: Framework for building server-side applications
- **PostgreSQL**: Database for storing application data
- **Redis**: For caching and rate limiting
- **Docker & Docker Compose**: For containerization and orchestration

## Features
- User management with referral system
- Product management with Redis caching
- Order management with transaction support
- Rate limiting for order creation
- Raw SQL queries for all database operations

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed on your machine
- Git (optional, for cloning the repository)

### Installation and Setup
1. Clone the repository or extract the ZIP file
   ```bash
   git clone <repository-url>
   cd ecommerce-assessment
   ```

2. Start the application using Docker Compose
   ```bash
   echo DB_HOST=postgres> .env && echo DB_PORT=5432>> .env && echo DB_USER=postgres>> .env && echo DB_PASSWORD=postgres>> .env && echo DB_NAME=ecommerce>> .env
   docker-compose up -d
   ```

3. The API will be available at http://localhost:3000

### Database Schema
The database schema is automatically created when the PostgreSQL container starts. It includes:
- `users` table with referral system support
- `products` table for product information
- `orders` table for order details
- `order_items` table for items in each order

## Redis Usage

### Product Caching
- The `GET /products` endpoint response is cached in Redis for 60 seconds
- Cache key: `products:all`
- Cache is invalidated when:
  - A new product is created
  - Product stock is updated during order creation

### Rate Limiting
- Rate limiting is implemented for the `POST /orders` endpoint
- Maximum 5 orders per minute per user
- Rate limit key format: `ratelimit:orders:{userId}`
- Counter expires after 60 seconds

### Optional Stock Level Caching
- Frequently accessed stock levels can be stored in Redis
- Cache key format: `stock:{productId}`
- 5-minute expiration time

## Raw SQL Approach
This project uses raw SQL queries instead of an ORM for all database operations. This approach was chosen for:

1. **Performance**: Raw SQL can be optimized for specific queries
2. **Control**: Full control over query execution and transaction management
3. **Transparency**: Clear visibility into database operations
4. **Learning**: Demonstrates understanding of SQL and database concepts

Examples of raw SQL usage:
- Transactions for atomic order creation and stock updates
- Self-referential queries for the user referral system
- Joins for retrieving orders with their items

## API Documentation
See http://localhost:3000/api-docs for detailed API documentation and example requests.

## Project Structure
```
ecommerce-assessment/
├── src/                    # Source code directory
│   ├── config/             # Server configuration files
│   ├── utils/              # Utility modules for external services
│   │   ├── database/       # Database connection and utilities
│   │   ├── redis/          # Redis connection and service helpers
│   ├── users/              # User management and referral system
│   ├── products/           # Product-related logic with caching
│   ├── orders/             # Order handling with transaction management
│   ├── app.module.ts       # Main application module (entry point)
│   └── main.ts             # Application startup and initialization
├── schema.sql              # SQL script for database schema setup
├── seed.sql                # SQL script for seeding initial data into the database
├── docker-compose.yml      # Docker Compose configuration for multi-container setup
├── Dockerfile              # Dockerfile for building the NestJS application container
└── README.md               # Project documentation and setup guide

```

## Bonus Features
- Redis service with comprehensive caching and rate limiting methods
- Optimized database queries with proper indexing
- Robust error handling and validation

## Testing
To test the API, you can use the provided curl examples in the API documentation or import the Postman collection.

## License
This project is licensed under the ISC License.
