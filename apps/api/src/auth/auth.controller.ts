import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

type Me = { userId: string; role: any; email: string } | undefined;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 3600 * 1000,
    });
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.auth.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const { accessToken, refreshToken } = await this.auth.issueTokens(user);
    this.setAuthCookies(res, accessToken, refreshToken);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @CurrentUser() me: Me,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!me?.userId) throw new UnauthorizedException();
    const raw = (req as any)?.cookies?.refresh_token as string | undefined;
    const { accessToken, refreshToken } = await this.auth.rotateRefreshToken(
      me.userId,
      raw || '',
    );
    this.setAuthCookies(res, accessToken, refreshToken);
    return { ok: true };
  }

  // Позволяем дернуть logout даже без access — просто очистим куки
  @Post('logout')
  async logout(
    @CurrentUser() me: Me,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (me?.userId) {
      await this.auth.revokeAll(me.userId);
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@CurrentUser() me: Me) {
    if (!me?.userId) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({
      where: { id: me.userId },
    });
    if (!user) throw new UnauthorizedException();
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }
}
