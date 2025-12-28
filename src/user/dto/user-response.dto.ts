import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  profilePicture: string | null;

  @Expose()
  isActive: boolean;

  @Expose()
  lastLogin: Date | null;

  @Expose()
  currentWorkspaceId: string | null;

  @Expose()
  currentWorkspace: any;

  @Exclude()
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}