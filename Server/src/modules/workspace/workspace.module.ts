import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { MemberRoleInterceptor } from '../../common/interceptors/member-role.interceptor';
import { Workspace } from '../../database/entities/workspace.entity';
import { Member } from '../../database/entities/member.entity';
import { Role } from '../../database/entities/role.entity';
import { User } from '../../database/entities/user.entity';
import { Task } from '../../database/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, Member, Role, User, Task]),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, MemberRoleInterceptor],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
