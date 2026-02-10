import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === 'ws') {
      const client = ctx.switchToWs().getClient<Socket>();
      return client.data?.user;
    }

    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
