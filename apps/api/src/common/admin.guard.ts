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

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private adminAuthService: AdminAuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();
    const authorization = req.headers['authorization'];

    const fromHeader =
      typeof authorization === 'string' && authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : undefined;
    let access = req.cookies?.access_token ?? fromHeader;
    if (access) {
      try {
        const payload: any = await this.jwtService.verifyAsync(access);
        if (payload?.role !== 'admin') throw new ForbiddenException();
        (req as any).admin = payload;
        return true;
      } catch {
        /* истёк/битый — попробуем refresh ниже */
      }
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
          maxAge: +(process.env.ADMIN_ACCESS_TTL_MIN ?? 15) * 60 * 1000, // 15 мин по умолчанию
        });

        (req as any).admin = admin;
        return true;
      } catch {
        /* refresh невалидный — падаем 401 ниже */
      }
    }
    throw new UnauthorizedException('No admin token');
  }
}
