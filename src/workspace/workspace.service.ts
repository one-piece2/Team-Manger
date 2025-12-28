import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Workspace } from '../database/entities/workspace.entity';
import { User } from '../database/entities/user.entity';
import { Member } from '../database/entities/member.entity';
import { Role } from '../database/entities/role.entity';

import { Project } from '../database/entities/project.entity';
import { Task } from '../database/entities/task.entity';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
  NotFoundException,
  BadRequestException,
} from '../common/exceptions/app.exception';
import { TaskStatus } from '../common/enums/task.enum';
import { RoleName } from '../common/enums/role.enum';
@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
   
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private dataSource: DataSource,
  ) {}

  
   //创建工作空间
  async createWorkspace(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<{ workspace: Workspace }> {
    const { name, description } = createWorkspaceDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ownerRole = await this.roleRepository.findOne({
      where: { name: RoleName.OWNER },
    });
    if (!ownerRole) {
      throw new NotFoundException('Owner role not found');
    }

    // 创建工作空间
    const workspace = this.workspaceRepository.create({
      name,
      description,
      ownerId: userId,
    });
    await this.workspaceRepository.save(workspace);

    // 创建成员关系
    const member = this.memberRepository.create({
      userId,
      workspaceId: workspace.id,
      roleId: ownerRole.id,
      joinedAt: new Date(),
    });
    await this.memberRepository.save(member);

    // 更新用户当前工作空间
    await this.userRepository.update(userId, {
      currentWorkspaceId: workspace.id,
    });

    return { workspace };
  }

  //获取用户所属的所有工作空间
  async getAllWorkspacesUserIsMember(
    userId: string,
  ): Promise<{ workspaces: Workspace[] }> {
    const memberships = await this.memberRepository.find({
      where: { userId },
      relations: ['workspace'],
    });

    const workspaces = memberships.map((membership) => membership.workspace);

    return { workspaces };
  }

  //获取工作空间详情
  async getWorkspaceById(
    workspaceId: string,
  ): Promise<{
    workspace: Workspace;
    members: Member[];
  }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const members = await this.memberRepository.find({
      where: { workspaceId },
      relations: ['role'],
    });

    return {
      workspace,
      members,
    };
  }


   // 获取工作空间成员
  async getWorkspaceMembers(workspaceId: string): Promise<{
    members: Member[];
    roles: Role[];
  }> {
    const members = await this.memberRepository.find({
      where: { workspaceId },
      relations: ['user', 'role'],
    });

    const roles = await this.roleRepository.find({
      select: ['id', 'name'],
    });

    return { members, roles };
  }

  // 获取工作空间分析数据
  async getWorkspaceAnalytics(workspaceId: string): Promise<{
    analytics: {
      totalTasks: number;
      overdueTasks: number;
      completedTasks: number;
    };
  }> {
    const currentDate = new Date();

    const totalTasks = await this.taskRepository.count({
      where: { workspaceId },
    });

    // 逾期任务（截止日期已过且状态不是 DONE）
    const overdueTasks = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.dueDate < :currentDate', { currentDate })
      .andWhere('task.status != :status', { status: TaskStatus.DONE })
      .getCount();

    const completedTasks = await this.taskRepository.count({
      where: { workspaceId, status: TaskStatus.DONE },
    });

    return {
      analytics: {
        totalTasks,
        overdueTasks,
        completedTasks,
      },
    };
  }

  // 更改成员角色
  async changeMemberRole(
    workspaceId: string,
    memberId: string,
    roleId: string,
  ): Promise<{ member: Member }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const member = await this.memberRepository.findOne({
      where: { userId: memberId, workspaceId },
    });
    if (!member) {
      throw new NotFoundException('Member not found in the workspace');
    }

    member.roleId = roleId;
    await this.memberRepository.save(member);

    // 重新查询以获取关联数据
    const updatedMember = await this.memberRepository.findOne({
      where: { id: member.id },
      relations: ['role'],
    });

    if (!updatedMember) {
      throw new NotFoundException('Updated member not found');
    }

    return { member: updatedMember };
  }

      //更新工作空间
  async updateWorkspace(
    workspaceId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<{ workspace: Workspace }> {
    const { name, description } = updateWorkspaceDto;

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await this.workspaceRepository.save(workspace);

    return { workspace };
  }

  //删除工作空间
  async deleteWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<{ currentWorkspace: string | null }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workspace = await queryRunner.manager.findOne(Workspace, {
        where: { id: workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      // 检查用户是否是工作空间的所有者
      if (workspace.ownerId !== userId) {
        throw new BadRequestException(
          'You are not authorized to delete this workspace',
        );
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 删除相关数据
      await queryRunner.manager.delete(Project, { workspaceId });
      await queryRunner.manager.delete(Task, { workspaceId });
      await queryRunner.manager.delete(Member, { workspaceId });

      // 更新用户的当前工作空间
      let newCurrentWorkspaceId: string | null = null;
      if (user.currentWorkspaceId === workspaceId) {
        const anotherMembership = await queryRunner.manager.findOne(Member, {
          where: { userId },
        });
        newCurrentWorkspaceId = anotherMembership?.workspaceId || null;
        user.currentWorkspaceId = newCurrentWorkspaceId;
        await queryRunner.manager.save(user);
      }

      // 删除工作空间
      await queryRunner.manager.remove(workspace);

      await queryRunner.commitTransaction();

      return { currentWorkspace: newCurrentWorkspaceId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}