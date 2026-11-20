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
import { ConfigurationService } from '../../config/configuration.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigurationService,
  ) {}

  async validate(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
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
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES') },
    );
  }

  async signRefresh(admin: User, jti: string) {
    return this.jwtService.signAsync(
      { sub: admin.id, jti },
      { expiresIn: this.config.get('JWT_REFRESH_EXPIRES') },
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

    if (
      user.role !== 'ADMIN' &&
      user.role !== 'MANAGER' &&
      user.role !== 'ADMIN_GOD'
    ) {
      throw new ForbiddenException('Not an admin or manager');
    }

    return user;
  }
}
