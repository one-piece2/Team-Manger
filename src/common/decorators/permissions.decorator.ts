import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/role.enum';

export const PERMISSIONS_KEY = 'permissions';
//权限装饰器 用于标记需要的权限
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);