import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    console.log('🧪 user from request (RolesGuard):', user);

    if (!user || !user.role) {
      console.warn('🛑 Пользователь не найден или без роли');
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
