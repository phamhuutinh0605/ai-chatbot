import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { IsPublic } from '@/decorators/is-public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @IsPublic()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @IsPublic()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }
}
