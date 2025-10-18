import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, ctx) {
    const req = ctx.switchToHttp().getRequest();
    const id = (req as any).reqId;
    if (info?.name === 'TokenExpiredError') {
      console.warn(`[${id}] ACCESS expired iat=${info.expiredAt}`);
    } else if (info) {
      console.warn(`[${id}] ACCESS invalid: ${info.message}`);
    }
    return super.handleRequest(err, user, info, ctx);
  }
}
