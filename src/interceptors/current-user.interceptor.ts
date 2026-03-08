import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../modules/user/user.service';

@Injectable()
// "implements" guide us how to put together an interceptor
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private userService: UserService) {}
  // handler refers to the route handler
  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'];
    const token = authHeader?.split(' ');
    const decodedToken = Buffer.from(token[1], 'base64').toString('utf8');
    const userCredentials = decodedToken.split(':');
    const currentUser = await this.userService.getUserByUsername(
      userCredentials[0],
    );
    // attach the user to the request object
    request.currentUser = currentUser;
    // run the actual route handler
    return handler.handle();
  }
}
