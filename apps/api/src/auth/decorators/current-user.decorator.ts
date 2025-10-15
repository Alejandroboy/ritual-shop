import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export type CurrentUserShape = { userId: string; role: Role; email: string };

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUserShape | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as CurrentUserShape | undefined;
  },
);
