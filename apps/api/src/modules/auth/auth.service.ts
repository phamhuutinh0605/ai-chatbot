import * as bcrypt from 'bcrypt';
import { Request } from 'express';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { LogicalException } from '@/middlewares/exception/logical.exception';
import { ErrorCode } from '@/enums/error-code.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, confirmPassword } = registerDto;

    if (password !== confirmPassword) {
      throw new LogicalException(
        ErrorCode.USER_PASSWORD_MISMATCH,
        'Password and confirm password do not match',
      );
    }

    const existingUser = await this.userService.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new LogicalException(
        ErrorCode.USER_EMAIL_EXISTED,
        'Email or username already exists',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      username,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }

  async login(loginDto: LoginDto) {
    const { emailOrUsername, password } = loginDto;

    const user = await this.userService.findByEmailOrUsername(
      emailOrUsername,
      emailOrUsername,
    );

    if (!user) {
      throw new LogicalException(
        ErrorCode.USER_NOT_FOUND,
        'Invalid credentials',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new LogicalException(
        ErrorCode.USER_PASSWORD_INCORRECT,
        'Invalid credentials',
      );
    }

    return this.generateTokens(user.id, user.email);
  }

  async logout(req: Request) {
    // In a real app, you'd invalidate the token here
    return { message: 'Logout successful' };
  }

  async refreshToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new LogicalException(
        ErrorCode.TOKEN_INVALID,
        'Missing or invalid Authorization header',
      );
    }

    const refreshToken = authHeader.split(' ')[1];
    const secret = this.configService.get<string>(
      'auth.jwt.refreshToken.secret',
    );

    try {
      const verified = await this.jwtService.verifyAsync(refreshToken, {
        secret,
      });

      const user = await this.userService.findOne(verified.userId);
      if (!user) {
        throw new LogicalException(
          ErrorCode.USER_NOT_FOUND,
          'User not found',
        );
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new LogicalException(
        ErrorCode.TOKEN_INVALID,
        'Invalid refresh token',
      );
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.jwt.accessToken.secret'),
      expiresIn: this.configService.get<string>('auth.jwt.accessToken.exp'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.jwt.refreshToken.secret'),
      expiresIn: this.configService.get<string>('auth.jwt.refreshToken.exp'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
