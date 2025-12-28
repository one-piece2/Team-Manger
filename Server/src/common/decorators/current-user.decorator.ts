import { createParamDecorator, ExecutionContext } from '@nestjs/common';
//自定义装饰器：获取当前用户
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }
//如果data有值，返回user[data]，否则返回user
    return data ? user[data] : user;
  },
);