import { Request } from 'express';
import { Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

type HandshakeRequest = Request & {
  auth?: Record<string, string | undefined>;
};

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard('jwt-access-token') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // Validate token from WebSocket handshake
  getRequest(context: ExecutionContext): Request {
    if (context.getType() === 'ws') {
      const client = context
        .switchToWs()
        .getClient<Socket & { handshake: HandshakeRequest }>();

      const { handshake } = client;
      handshake.headers = handshake.headers ?? {};

      const tokenFromAuth = handshake.auth?.token;
      if (tokenFromAuth && !handshake.headers.authorization) {
        handshake.headers.authorization = `Bearer ${tokenFromAuth}`;
      }

      return handshake;
    }

    return context.switchToHttp().getRequest<Request>();
  }

  handleRequest<TUser = any>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const result = super.handleRequest(err, user, info, context);

    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient<
        Socket & {
          handshake: HandshakeRequest;
          data: Record<string, unknown>;
        }
      >();

      client.data = client.data ?? {};
      client.data.user = result;

      client.handshake.auth = client.handshake.auth ?? {};
      const userModel = result as any;
      if (userModel?.id) {
        client.handshake.auth.userId = userModel.id;
      }
    }

    return result;
  }
}
