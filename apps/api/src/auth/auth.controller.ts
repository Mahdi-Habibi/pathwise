import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AuthResponse, AuthUser, LearnerState } from '@pathwise/shared';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { parseExpiresInSeconds } from './auth.utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return this.stripRefreshToken(result);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return this.stripRefreshToken(result);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @CurrentUser() user: AuthUser & { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    if (!user.refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const result = await this.authService.refresh(user, user.refreshToken);
    this.setRefreshCookie(res, result.refreshToken);
    return this.stripRefreshToken(result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    await this.authService.logout(user.id, refreshToken);
    this.clearRefreshCookie(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthUser): Promise<LearnerState> {
    return this.authService.getLearnerState(user.id);
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const maxAge = parseExpiresInSeconds(refreshExpiresIn) * 1000;
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    // Cross-origin frontends (e.g. GitHub Pages → hosted API) need SameSite=None; Secure.
    const corsOrigin = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    const crossSite = /github\.io/i.test(corsOrigin) || process.env.COOKIE_SAMESITE === 'none';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction || crossSite,
      sameSite: crossSite ? 'none' : isProduction ? 'strict' : 'lax',
      maxAge,
      path: '/',
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie('refreshToken', { path: '/' });
  }

  private stripRefreshToken(result: AuthResponse & { refreshToken: string }): AuthResponse {
    const { refreshToken: _refreshToken, ...response } = result;
    return response;
  }
}
