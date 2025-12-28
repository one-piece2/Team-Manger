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

import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/role.enum';
import { User } from '../database/entities/user.entity';
import { RoleGuard } from '../common/guards/role.guard';
import { MemberRoleInterceptor } from '../common/interceptors/member-role.interceptor';

@Controller('project')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
  ) {}

  // 创建项目 POST /api/project/workspace/:workspaceId/create
  @Post('workspace/:workspaceId/create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.CREATE_PROJECT)
  async createProject(
    @CurrentUser() user: User,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    const { project } = await this.projectService.createProject(
      user.id,
      workspaceId,
      createProjectDto,
    );

    return {
      message: 'Project created successfully',
      project,
    };
  }

  // 获取工作空间中的所有项目 GET /api/project/workspace/:workspaceId/all
  @Get('workspace/:workspaceId/all')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getAllProjectsInWorkspace(
    @CurrentUser() user: User,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query() query: ProjectQueryDto,
  ) {
    const pageSize = query.pageSize || 10;
    const pageNumber = query.pageNumber || 1;

    const { projects, totalCount, totalPages, skip } =
      await this.projectService.getProjectsInWorkspace(
        workspaceId,
        pageSize,
        pageNumber,
      );

    return {
      message: 'Project fetched successfully',
      projects,
      pagination: {
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        skip,
        limit: pageSize,
      },
    };
  }

  // 获取项目分析数据 GET /api/project/:id/workspace/:workspaceId/analytics
  @Get(':id/workspace/:workspaceId/analytics')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getProjectAnalytics(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ) {
    const { analytics } = await this.projectService.getProjectAnalytics(
      workspaceId,
      projectId,
    );

    return {
      message: 'Project analytics retrieved successfully',
      analytics,
    };
  }

  // 获取项目详情 GET /api/project/:id/workspace/:workspaceId
  @Get(':id/workspace/:workspaceId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getProjectById(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ) {
    const { project } = await this.projectService.getProjectByIdAndWorkspaceId(
      workspaceId,
      projectId,
    );

    return {
      message: 'Project fetched successfully',
      project,
    };
  }

  // 更新项目 PUT /api/project/:id/workspace/:workspaceId/update
  @Put(':id/workspace/:workspaceId/update')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.EDIT_PROJECT)
  async updateProject(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const { project } = await this.projectService.updateProject(
      workspaceId,
      projectId,
      updateProjectDto,
    );

    return {
      message: 'Project updated successfully',
      project,
    };
  }

  // 删除项目 DELETE /api/project/:id/workspace/:workspaceId/delete
  @Delete(':id/workspace/:workspaceId/delete')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.DELETE_PROJECT)
  async deleteProject(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ) {
    await this.projectService.deleteProject(workspaceId, projectId);

    return {
      message: 'Project deleted successfully',
    };
  }
}