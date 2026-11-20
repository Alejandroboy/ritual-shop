import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { CookieOptions, Response, Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { ConfigurationService } from '../../config/configuration.service';

const baseCookie: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
};

@Controller('admin/auth')
export class AdminAuthController {
  private readonly accessMs: number;
  private readonly refreshMs: number;

  constructor(
    private adminAuthService: AdminAuthService,
    config: ConfigurationService,
  ) {
    this.accessMs = (config.get('ADMIN_ACCESS_TTL_MIN') ?? 60) * 60 * 1000; // 60 мин
    this.refreshMs =
      (config.get('ADMIN_REFRESH_TTL_DAYS') ?? 14) * 24 * 60 * 60 * 1000; // 14 дн
  }

  @Post('login')
  async login(
    @Body() dto: { email: string; password: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const admin = await this.adminAuthService.validate(dto.email, dto.password);
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const token = this.adminAuthService.sign(admin);
    const { access, refresh } = await this.adminAuthService.signTokens(admin);
    const secure = req.secure;

    res
      .cookie('access_token', access, {
        ...baseCookie,
        secure,
        maxAge: this.accessMs,
      })
      .cookie('refresh_token', refresh, {
        ...baseCookie,
        secure,
        maxAge: this.refreshMs,
      })
      .status(201)
      .json({ ok: true });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const rt = req.cookies?.refresh_token as string | undefined;
    if (!rt) throw new UnauthorizedException('No refresh cookie');

    const admin = await this.adminAuthService.verifyRefresh(rt);
    const access = await this.adminAuthService.signAccess(admin);
    const secure = req.secure;

    res
      .cookie('access_token', access, {
        ...baseCookie,
        secure,
        maxAge: this.accessMs,
      })
      .json({ ok: true });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.json({ ok: true });
  }

  @Get('me')
  me(@Res({ passthrough: true }) res: Response) {
    return { ok: true };
  }
}
