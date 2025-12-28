import { User } from '../../../database/entities/user.entity';
//认证响应dto

export class AuthResponseDto {
  message: string;
  accessToken?: string;
  user?: Partial<User>;
}
//注册响应dto
export class RegisterResponseDto {
  message: string;
  userId: string;
  workspaceId: string;
}