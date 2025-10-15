import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import * as argon2 from 'argon2';

type JwtPayload = { sub: string; role: Role; email: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // Регистрация нового пользователя
  async register(dto: {
    email: string;
    password: string;
    name?: string | null;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('Email already registered');
    }
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
        role: 'CUSTOMER',
      },
    });

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { user, accessToken, refreshToken };
  }

  // Валидация логина/пароля
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await argon2.verify(user.passwordHash, password);
    return ok ? user : null;
  }

  // Подписание токенов
  private signTokens(user: Pick<User, 'id' | 'email' | 'role'>) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  // Выдача пары токенов + запись refresh-сессии
  async issueTokens(user: Pick<User, 'id' | 'email' | 'role'>) {
    const { accessToken, refreshToken } = this.signTokens(user);

    const tokenHash = await argon2.hash(refreshToken, {
      type: argon2.argon2id,
    });
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);

    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  // Ротация refresh-токена (удаляем использованный, выдаём новую пару)
  async rotateRefreshToken(userId: string, rawRefreshToken: string) {
    if (!rawRefreshToken)
      throw new UnauthorizedException('Missing refresh token');

    const sessions = await this.prisma.refreshSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    let matchedSession: { id: string; expiresAt: Date } | null = null;
    for (const s of sessions) {
      const ok = await argon2
        .verify(s.tokenHash, rawRefreshToken)
        .catch(() => false);
      if (ok) {
        matchedSession = { id: s.id, expiresAt: s.expiresAt };
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (matchedSession.expiresAt.getTime() < Date.now()) {
      // просрочен — чистим и ругаемся
      await this.prisma.refreshSession.delete({
        where: { id: matchedSession.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // ротация: удаляем найденную сессию
    await this.prisma.refreshSession.delete({
      where: { id: matchedSession.id },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    return this.issueTokens(user);
  }

  // Отозвать все refresh-сессии пользователя (logout со всех устройств)
  async revokeAll(userId: string) {
    await this.prisma.refreshSession.deleteMany({ where: { userId } });
  }
}
