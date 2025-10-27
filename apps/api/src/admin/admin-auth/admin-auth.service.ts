import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

const ACCESS_TTL = Number(process.env.JWT_ACCESS_EXPIRES) ?? 3600;
const REFRESH_TTL = Number(process.env.JWT_REFRESH_EXPIRES) ?? 2592000;

@Injectable()
export class AdminAuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validate(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    console.log('user', user);
    const ok = await argon2.verify(user.passwordHash, password);
    return ok ? user : null;
  }

  sign({ id, email, role }: { id: string; email: string; role: string }) {
    if (role === 'admin') {
      return this.jwtService.sign({ id, email, role });
    }
  }

  async signAccess(admin: User) {
    return this.jwtService.signAsync(
      { sub: admin.id, email: admin.email, role: admin.role },
      { expiresIn: ACCESS_TTL },
    );
  }

  async signRefresh(admin: User, jti: string) {
    // (опционально) сохрани jti в Redis с TTL=7d и проверяй при refresh (ротация)
    return this.jwtService.signAsync(
      { sub: admin.id, jti },
      { expiresIn: REFRESH_TTL },
    );
  }

  async signTokens(admin: User) {
    const [access, refresh] = await Promise.all([
      this.signAccess(admin),
      this.signRefresh(admin, randomUUID()),
    ]);
    return { access, refresh };
  }

  async verifyRefresh(token: string): Promise<User> {
    const p = await this.jwtService.verifyAsync<{
      sub: string;
      jti?: string;
      type?: string;
    }>(token);

    if (p.type && p.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.prisma.user.findUnique({ where: { id: p.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Not an admin');
    }

    return user;
  }
}
