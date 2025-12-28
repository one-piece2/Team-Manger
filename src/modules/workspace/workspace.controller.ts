import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/role.enum';
import { User } from '../../database/entities/user.entity';
import { RoleGuard } from '../../common/guards/role.guard';
import { MemberRoleInterceptor } from '../../common/interceptors/member-role.interceptor';

@Controller('workspace')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
  ) {}

  // 创建工作空间 POST /api/workspace/create/new
  @Post('create/new')
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(
    @CurrentUser() user: User,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    const { workspace } = await this.workspaceService.createWorkspace(
      user.id,
      createWorkspaceDto,
    );

    return {
      message: 'Workspace created successfully',
      workspace,
    };
  }

  // 获取用户所有工作空间 GET /api/workspace/all
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllWorkspaces(@CurrentUser() user: User) {
    const { workspaces } =
      await this.workspaceService.getAllWorkspacesUserIsMember(user.id);

    return {
      message: 'User workspaces fetched successfully',
      workspaces,
    };
  }

  // 获取工作空间成员 GET /api/workspace/members/:id
  @Get('members/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getWorkspaceMembers(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) workspaceId: string,
  ) {
    const { members, roles } =
      await this.workspaceService.getWorkspaceMembers(workspaceId);

    return {
      message: 'Workspace members retrieved successfully',
      members,
      roles,
    };
  }

  // 获取工作空间分析数据 GET /api/workspace/analytics/:id
  @Get('analytics/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getWorkspaceAnalytics(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) workspaceId: string,
  ) {
    const { analytics } =
      await this.workspaceService.getWorkspaceAnalytics(workspaceId);

    return {
      message: 'Workspace analytics retrieved successfully',
      analytics,
    };
  }

  // 获取工作空间详情 GET /api/workspace/:id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.VIEW_ONLY)
  async getWorkspaceById(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) workspaceId: string,
  ) {
    const { workspace } =
      await this.workspaceService.getWorkspaceById(workspaceId);

    return {
      message: 'Workspace fetched successfully',
      workspace,
    };
  }

  // 更改成员角色 PUT /api/workspace/change/member/role/:id
  @Put('change/member/role/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.CHANGE_MEMBER_ROLE)
  async changeMemberRole(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) workspaceId: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    const { member } = await this.workspaceService.changeMemberRole(
      workspaceId,
      changeRoleDto.memberId,
      changeRoleDto.roleId,
    );

    return {
      message: 'Member Role changed successfully',
      member,
    };
  }

  // 更新工作空间 PUT /api/workspace/update/:id
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.EDIT_WORKSPACE)
  async updateWorkspace(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) workspaceId: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    const { workspace } = await this.workspaceService.updateWorkspace(
      workspaceId,
      updateWorkspaceDto,
    );

    return {
      message: 'Workspace updated successfully',
      workspace,
    };
  }

  // 删除工作空间 DELETE /api/workspace/delete/:id
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MemberRoleInterceptor)
  @UseGuards(RoleGuard)
  @RequirePermissions(Permission.DELETE_WORKSPACE)
  async deleteWorkspace(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) workspaceId: string,
  ) {
    const { currentWorkspace } = await this.workspaceService.deleteWorkspace(
      workspaceId,
      user.id,
    );

    return {
      message: 'Workspace deleted successfully',
      currentWorkspace,
    };
  }
}