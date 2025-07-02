import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { get } from 'lodash';
import { ConfigSchemaType } from 'src/common/config.schema';
import { COOKIE_NAME } from '../common/constant';
import { IS_OPTIONAL_KEY } from '../common/decorators/optional.decorator';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService<ConfigSchemaType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true; //--------------------------------------------------------------remove if you want auth-------------
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const secret = this.configService.get('JWT_SECRET');

    const token = this.extractTokenFromHeader(request);

    if (!token && !isOptional) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      if (!isOptional) {
        throw new UnauthorizedException();
      } else {
        request['user'] = null;
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const token = get(request, `cookies.${COOKIE_NAME}`, '');
    return token;
  }
}
