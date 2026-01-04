import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/role.enum';
import { User } from '../../database/entities/user.entity';
import { Task } from '../../database/entities/task.entity';
import { RoleGuard } from '../../common/guards/role.guard';
import { MemberRoleInterceptor } from '../../common/interceptors/member-role.interceptor';
import { MemberRoleGuard } from '../../common/guards/member-role.guard';

@Controller('task')
export class TaskController {
  constructor(
    private taskService: TaskService,
  ) {}

  //创建任务  POST /api/task/project/:projectId/workspace/:workspaceId/create
  @Post('project/:projectId/workspace/:workspaceId/create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MemberRoleGuard, RoleGuard)
  @RequirePermissions(Permission.CREATE_TASK)
  async createTask(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<{ message: string; task: Task }> {
    const { task } = await this.taskService.createTask(
      workspaceId,
      projectId,
      user.id,
      createTaskDto,
    );

    return {
      message: 'Task created successfully',
      task,
    };
  }

  //更新任务  PUT /api/task/:id/project/:projectId/workspace/:workspaceId/update
  @Put(':id/project/:projectId/workspace/:workspaceId/update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MemberRoleGuard, RoleGuard)
  @RequirePermissions(Permission.EDIT_TASK)
  async updateTask(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) taskId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<{ message: string; task: Task }> {
    const { updatedTask } = await this.taskService.updateTask(
      workspaceId,
      projectId,
      taskId,
      updateTaskDto,
    );

    return {
      message: 'Task updated successfully',
      task: updatedTask,
    };
  }

  //获取所有任务 GET /api/task/workspace/:workspaceId/all
  @Get('workspace/:workspaceId/all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MemberRoleGuard, RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getAllTasks(
    @CurrentUser() user: User,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query() query: TaskQueryDto,
  ): Promise<{
    message: string;
    tasks: Task[];
    pagination: {
      pageSize: number;
      pageNumber: number;
      totalCount: number;
      totalPages: number;
      skip: number;
    };
  }> {
    const result = await this.taskService.getAllTasks(workspaceId, query);

    return {
      message: 'All tasks fetched successfully',
      ...result,
    };
  }

  //获取任务详情 GET /api/task/:id/project/:projectId/workspace/:workspaceId
  @Get(':id/project/:projectId/workspace/:workspaceId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MemberRoleGuard, RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getTaskById(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) taskId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ): Promise<{ message: string; task: Task }> {
    const task = await this.taskService.getTaskById(
      workspaceId,
      projectId,
      taskId,
    );

    return {
      message: 'Task fetched successfully',
      task,
    };
  }

  //删除任务 DELETE /api/task/:id/workspace/:workspaceId/delete
  @Delete(':id/workspace/:workspaceId/delete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MemberRoleGuard, RoleGuard)
  @RequirePermissions(Permission.DELETE_TASK)
  async deleteTask(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) taskId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ): Promise<{ message: string }> {
    await this.taskService.deleteTask(workspaceId, taskId);

    return {
      message: 'Task deleted successfully',
    };
  }
}