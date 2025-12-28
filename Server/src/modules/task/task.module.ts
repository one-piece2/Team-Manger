import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MemberRoleInterceptor } from '../../common/interceptors/member-role.interceptor';
import { Task } from '../../database/entities/task.entity';
import { Project } from '../../database/entities/project.entity';
import { Member } from '../../database/entities/member.entity';
import { Workspace } from '../../database/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, Member, Workspace])],
  controllers: [TaskController],
  providers: [TaskService, MemberRoleInterceptor],
  exports: [TaskService],
})
export class TaskModule {}
