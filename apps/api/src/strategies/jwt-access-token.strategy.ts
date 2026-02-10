import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ErrorCode } from '../enums/error-code.enum';
import { LogicalException } from '../middlewares/exception/logical.exception';
import { UserService } from '@/modules/user/user.service';

interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwt.accessToken.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.userId) {
      throw new LogicalException(
        ErrorCode.TOKEN_INVALID,
        'Invalid token payload',
      );
    }

    const user = await this.userService.findOne(payload.userId);
    if (!user) {
      throw new LogicalException(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
