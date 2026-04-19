import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserService } from '../modules/user/user.service';
import { IS_PUBLIC_KEY } from '../shared/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private reflector: Reflector,
  ) {}
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

    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: Request) {
    try {
      const authHeader: string = request.headers['authorization'];
      const token = authHeader?.split(' ');
      const decodedToken = Buffer.from(token[1], 'base64').toString('utf8');
      const userCredentials = decodedToken.split(':');
      await this.userService.authenticateUser({
        username: userCredentials[0],
        password: userCredentials[1],
      });
      return true;
    } catch (e) {
      console.error('Failed to authenticate', e);
      throw new UnauthorizedException();
    }
  }
}
