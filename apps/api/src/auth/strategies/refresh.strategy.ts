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
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_change_me',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const id = (req as any).reqId;
    const hasRt = !!req.cookies?.refresh_token;
    console.log(
      `[${id}] REFRESH validate sub=${payload?.sub} hasRt=${hasRt} exp=${payload?.exp}`,
    );
    return { userId: payload.sub, role: payload.role, email: payload.email };
  }
}
