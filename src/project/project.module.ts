import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MemberRoleInterceptor } from '../common/interceptors/member-role.interceptor';
import { Project } from '../database/entities/project.entity';
import { Task } from '../database/entities/task.entity';
import { Member } from '../database/entities/member.entity';
import { Workspace } from '../database/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Task, Member, Workspace])],
  controllers: [ProjectController],
  providers: [ProjectService, MemberRoleInterceptor],
  exports: [ProjectService],
})
export class ProjectModule {}
