import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signIn(
    username: string,
    pass: string,
    is_chef: boolean,
  ): Promise<{ access_token: string }> {
    try {
      const user = await this.usersService.findOne(username, is_chef);

      if (!user || user.length === 0)
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      const hash = user?.[0].password;

      const isMatch = await bcrypt.compare(pass, hash);

      if (!isMatch)
        throw new HttpException('Wrong Password', HttpStatus.NOT_FOUND);

      const payload = {
        sub: user?.[0].id,
        username: user?.[0].username,
        is_chef: user?.[0].role === 'Chef',
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new HttpException(error || 'Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  async signUp(username: string, pass: string, isChef: string): Promise<any> {
    const user = await this.usersService.addOne(username, pass, isChef);

    return user;
  }
}
