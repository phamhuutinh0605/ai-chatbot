import { CurrentUser } from '@/decorators/current-user.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
