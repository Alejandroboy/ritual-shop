import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

type AdminPayload = { id: string; email: string; role: 'admin' };
const ACCESS_TTL = process.env.JWT_ACCESS_EXPIRES ?? '60m';
const REFRESH_TTL = process.env.JWT_REFRESH_EXPIRES ?? '14d';

@Injectable()
export class AdminAuthService {
  constructor(private jwtService: JwtService) {}

  async validate(email: string, password: string): Promise<AdminPayload> {
    // простая проверка на env (можно заменить на БД)
    const okEmail = process.env.ADMIN_EMAIL;
    const okPass = process.env.ADMIN_PASSWORD;
    if (!okEmail || !okPass) throw new UnauthorizedException('Auth disabled');
    const passOk = okPass.startsWith('$2b$')
      ? await bcrypt.compare(password, okPass)
      : password === okPass;
    if (email !== okEmail || !passOk)
      throw new UnauthorizedException('Invalid credentials');
    return { id: 'admin-env', email, role: 'admin' };
  }

  sign({ id, email, role }: { id: string; email: string; role: string }) {
    if (role === 'admin') {
      return this.jwtService.sign({ id, email, role });
    }
  }

  async signAccess(admin: AdminPayload) {
    return this.jwtService.signAsync(
      { sub: admin.id, email: admin.email, role: admin.role },
      { expiresIn: ACCESS_TTL },
    );
  }

  async signRefresh(admin: AdminPayload, jti: string) {
    // (опционально) сохрани jti в Redis с TTL=7d и проверяй при refresh (ротация)
    return this.jwtService.signAsync(
      { sub: admin.id, jti },
      { expiresIn: REFRESH_TTL },
    );
  }

  async signTokens(admin: AdminPayload) {
    const [access, refresh] = await Promise.all([
      this.signAccess(admin),
      this.signRefresh(admin, randomUUID()),
    ]);
    return { access, refresh };
  }

  async verifyRefresh(token: string): Promise<AdminPayload> {
    const p = await this.jwtService.verifyAsync<{ sub: string; jti: string }>(
      token,
    );
    // (опционально) проверь jti в Redis, затем сгенерируй новую пару (ротация)
    return { id: p.sub, email: process.env.ADMIN_EMAIL!, role: 'admin' };
  }
}
