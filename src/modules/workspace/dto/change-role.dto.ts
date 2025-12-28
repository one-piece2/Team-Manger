import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ChangeRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  roleId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  memberId: string;
}