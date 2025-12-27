import { SetMetadata } from '@nestjs/common';
//自定义装饰器：公开
export const IS_PUBLIC_KEY = 'isPublic';
//给某个 路由 打上：isPublic = true 的标记
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);