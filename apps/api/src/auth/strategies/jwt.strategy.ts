import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { ConfigurationService } from '../../config/configuration.service';

type Payload = { sub: string; role: Role; email: string };

function cookieExtractor(name: string) {
  return (req: Request) => (req?.cookies ? req.cookies[name] : null);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor('access_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(), // запасной вариант
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: Payload) {
    return { userId: payload.sub, role: payload.role, email: payload.email };
  }
}
