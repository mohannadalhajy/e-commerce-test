import {
  Injectable,
  Inject,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateUserDto } from './dto/create-user.dto';
import SERVER_ERRORS from 'src/config/server-errors.config';
import { ServerError } from 'src/config/server-response.config';
import IUser from './user.interface';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Validate referred_by if provided
    if (createUserDto.referred_by) {
      const referrerExists = await this.checkUserExists(
        createUserDto.referred_by,
      );
      if (!referrerExists) {
        throw new ServerError(
          HttpStatus.NOT_FOUND,
          `Referrer with ID ${createUserDto.referred_by} not found`,
          SERVER_ERRORS.USER_NOT_FOUND,
        );
      }
    }

    // Insert new user with raw SQL
    const query = `
      INSERT INTO users (name, email, referred_by, is_developer)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, referred_by, is_developer, created_at
    `;

    const values = [
      createUserDto.name,
      createUserDto.email,
      createUserDto.referred_by || null,
      createUserDto.is_developer || false,
    ];

    try {
      const result = await this.pool.query(query, values);
      const user: IUser = result.rows[0];
      return new UserResponseDto(user);
    } catch (error) {
      // Handle unique constraint violation or other errors
      if (error.code === '23505') {
        // unique_violation
        throw new ServerError(
          HttpStatus.CONFLICT,
          `User with this email ${createUserDto.email} is already exist`,
          SERVER_ERRORS.USER_EXISTS_ALREADY,
        );
      }
      throw error;
    }
  }

  async findReferrals(id: string) {
    // Check if user exists
    const userExists = await this.checkUserExists(id);
    if (!userExists) {
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `User with ID ${id} not found`,
        SERVER_ERRORS.USER_NOT_FOUND,
      );
    }

    // Get all users referred by this user with raw SQL
    const query = `
      SELECT id, name, email, referred_by, is_developer, created_at
      FROM users
      WHERE referred_by = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows;
  }

  async findReferrer(id: string): Promise<UserResponseDto> {
    // Check if user exists
    const userExists = await this.checkUserExists(id);
    if (!userExists) {
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `User with ID ${id} not found`,
        SERVER_ERRORS.USER_NOT_FOUND,
      );
    }

    // Get the user who referred this user with raw SQL
    const query = `
      SELECT u.id, u.name, u.email, u.referred_by, u.is_developer, u.created_at
      FROM users u
      JOIN users referred_user ON u.id = referred_user.referred_by
      WHERE referred_user.id = $1
    `;

    const result = await this.pool.query(query, [id]);
    const user: IUser = result.rows[0];
    if (!user)
      throw new ServerError(
        HttpStatus.NOT_FOUND,
        `User referrer not found`,
        SERVER_ERRORS.USER_NOT_FOUND,
      );
    return new UserResponseDto(user);
  }

  private async checkUserExists(id: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
    const result = await this.pool.query(query, [id]);
    return result.rows[0].exists;
  }
}
