import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';

import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  
 // 获取当前用户信息 GET /api/user/current
  @Get('current')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: User) {
    const result = await this.userService.getCurrentUser(user.id);
    return {
      message: 'User fetched successfully',
      user: result,
    };
  }
}