import { IS_PUBLIC_KEY } from './auth.guard.metadata';
import { UserService } from '../../user/user.service';
import { ROLES_KEY } from './role.decorator';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    try {
      const user = await this.userService.findOneById(request.userId);
      console.log(user.role);
      if (!user) {
        throw new UnauthorizedException();
      }
      const hasRole = requiredRoles.some((role) => user.role === role);
      if (!hasRole) {
        throw new UnauthorizedException();
      }
    } catch (err) {
      throw new UnauthorizedException(err);
    }
    return true;
  }
}
