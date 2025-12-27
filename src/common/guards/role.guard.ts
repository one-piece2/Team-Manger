import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, RolePermissions, RoleName } from '../enums/role.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
//角色权限守卫
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //获取需要的权限
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
 //如果不需要权限
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    //获取用户角色
    const userRole = request.memberRole as RoleName;

    if (!userRole) {
      throw new ForbiddenException('Role not found');
    }
//这个角色的权限
    const rolePermissions = RolePermissions[userRole] || [];

    const hasPermission = requiredPermissions.some((permission) =>
      rolePermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }}