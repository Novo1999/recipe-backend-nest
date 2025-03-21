import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { User } from './interfaces/users.interface';

@Injectable()
export class UsersService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async findOne(username: string): Promise<User[] | undefined> {
    try {
      const user = await this.sql`
    SELECT * FROM users WHERE username=${username}`;
      return user;
    } catch (error) {
      if (error instanceof HttpException)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async addOne(username: string, password: string, isChef: boolean) {
    try {
      const userExists = await this
        .sql`SELECT EXISTS(SELECT 1 FROM users WHERE username=${username})`;
      console.log('🚀 ~ UsersService ~ addOne ~ userExists:', userExists);

      if (userExists[0].exists)
        throw new HttpException('User Already Exists', HttpStatus.FORBIDDEN);

      const hashedPassword = await hashPassword(password);

      await this.sql`
      INSERT INTO ${isChef ? 'chef_users' : 'users'} (username, password)
      VALUES(${username}, ${hashedPassword}, ${isChef && 'Chef'})`;

      return {
        message: 'Added new user',
        username,
      };
    } catch (error) {
      if (error instanceof HttpException)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserFromDb(): Promise<any> {
    return await this.sql`SELECT * FROM users`;
  }
}

const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    if (error) throw new HttpException('Hash Error', HttpStatus.BAD_REQUEST);
  }
  return '';
};
