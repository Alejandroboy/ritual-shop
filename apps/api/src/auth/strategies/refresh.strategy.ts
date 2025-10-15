import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from '@prisma/client';

type Payload = { sub: string; role: Role; email: string };

function cookieExtractor(name: string) {
  return (req: Request) => (req?.cookies ? req.cookies[name] : null);
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor('refresh_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(), // запасной вариант
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_change_me',
    });
  }

  async validate(payload: Payload) {
    return { userId: payload.sub, role: payload.role, email: payload.email };
  }
}
