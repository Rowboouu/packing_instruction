import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { omit } from 'lodash';
import { UsersService } from 'src/users/users.service';
import { COOKIE_NAME } from '../common/constant';
import { OptionalUser } from '../common/decorators/optional.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @HttpCode(200)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const { user, token } = await this.authService.signIn(signInDto);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
    });

    return res.send({ user });
  }

  @Public()
  @HttpCode(200)
  @Post('sign-out')
  async signOut(@Res() res: Response) {
    res.cookie(COOKIE_NAME, '', {
      httpOnly: true,
      maxAge: 0,
      // secure: true,
      // sameSite: 'strict',
    });

    return res.send({ user: null });
  }

  @OptionalUser()
  @Get('me')
  async getUser(@Req() req) {
    if (!req.user) {
      return { user: null };
    }

    const user = await this.usersService.findOneById(req.user.sub);

    if (!user) {
      return { user: null };
    }

    return { user: omit(user, 'password') };
  }
}
