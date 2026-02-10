import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtAccessTokenStrategy } from '@/strategies/jwt-access-token.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
