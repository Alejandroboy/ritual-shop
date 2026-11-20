import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';
import { AdminAuthService } from '../admin/admin-auth/admin-auth.service';
import { ConfigurationService } from '../config/configuration.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private adminAuthService: AdminAuthService,
    private config: ConfigurationService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();
    const authorization = req.headers['authorization'];

    const fromHeader =
      typeof authorization === 'string' && authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : undefined;
    const access = req.cookies?.access_token ?? fromHeader;
    if (access) {
      try {
        const payload: any = await this.jwtService.verifyAsync(access);
        if (payload?.role !== 'admin' || payload?.role !== 'manager')
          throw new ForbiddenException();
        (req as any).admin = payload;
        return true;
      } catch {}
    }
    const refresh = req.cookies?.refresh_token;
    if (refresh) {
      try {
        const admin = await this.adminAuthService.verifyRefresh(refresh);
        const freshAccess = await this.adminAuthService.signAccess(admin);

        res.cookie('access_token', freshAccess, {
          httpOnly: true,
          sameSite: 'lax',
          secure: req.secure,
          path: '/',
          maxAge: (this.config.get('ADMIN_ACCESS_TTL_MIN') ?? 15) * 60 * 1000,
        });

        (req as any).admin = admin;
        return true;
      } catch (e) {}
    }
    throw new UnauthorizedException('No admin token');
  }
}
