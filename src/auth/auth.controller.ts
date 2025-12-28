import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../database/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  //用户注册 POST /api/auth/register
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return {
      message: 'User created successfully',
    };
  }

  
   // 用户登录  POST /api/auth/login
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request & { user: User }) {
    const user = req.user;
    const accessToken = this.authService.generateToken(user.id);
    return {
      message: 'Logged in successfully',
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        currentWorkspaceId: user.currentWorkspaceId,
      },
    };
  }

  
 // 登出 POST /api/auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }

  // Google OAuth 登录 GET /api/auth/google
  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google')
  async googleAuth() {
    // Guard 会自动重定向到 Google
  }

  // Google OAuth 回调 GET /api/auth/google/callback
  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleAuthCallback(
    @Req() req: Request & { user: { user: User; accessToken: string } },
    @Res() res: Response,
  ) {
    const frontendCallbackUrl = this.configService.get<string>(
      'app.googleCallbackUrl'
    );

    if (!req.user) {
      return res.redirect(`${frontendCallbackUrl}?status=failure`);
    }

    const { user, accessToken } = req.user;

    return res.redirect(
      `${frontendCallbackUrl}?status=success&access_token=${accessToken}&current_workspace=${user.currentWorkspaceId}`,
    );
  }
}