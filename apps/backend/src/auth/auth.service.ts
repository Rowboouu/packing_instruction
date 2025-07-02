import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { omit } from 'lodash';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signin-dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn({ email, password }: SignInDto) {
    try {
      const user = await this.usersService.findOneByEmail(email);

      if (!user || !(await user.verifyPass(password))) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = await this.signUser(user);

      return { user: omit(user.toJSON(), 'password'), token };
    } catch (error) {
      throw error || new InternalServerErrorException();
    }
  }

  async signUser(user: any) {
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return token;
  }
}
