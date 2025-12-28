import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '../../database/entities/project.entity';
import { Task } from '../../database/entities/task.entity';
import { TaskStatus } from '../../common/enums/task.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { NotFoundException } from '../../common/exceptions/app.exception';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  
    //创建项目
  async createProject(
    userId: string,
    workspaceId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<{ project: Project }> {
    const project = this.projectRepository.create({
      name: createProjectDto.name,
      description: createProjectDto.description,
      emoji: createProjectDto.emoji || '📊',
      workspaceId,
      createdById: userId,
    });

    await this.projectRepository.save(project);

    return { project };
  }

  
  // 获取工作空间中的所有项目
  async getProjectsInWorkspace(
    workspaceId: string,
    pageSize: number, //每页大小
    pageNumber: number, //页码
  ): Promise<{
    projects: Project[]; //项目列表
    totalCount: number; //总数
    totalPages: number; //总页数
    skip: number; //跳过多少条
  }> {
    //计算跳过多少条
    const skip = (pageNumber - 1) * pageSize;

    const [projects, totalCount] = await this.projectRepository.findAndCount({
      where: { workspaceId },
      relations: ['createdBy'],
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return { projects, totalCount, totalPages, skip };
  }

  // 获取项目详情
  async getProjectByIdAndWorkspaceId(
    workspaceId: string,
    projectId: string,
  ): Promise<{ project: Project }> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId, workspaceId },
      select: ['id', 'emoji', 'name', 'description'],
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or does not belong to the specified workspace',
      );
    }

    return { project };
  }

  //获取项目分析数据
  async getProjectAnalytics(
    workspaceId: string,
    projectId: string,
  ): Promise<{
    analytics: {
      totalTasks: number;
      overdueTasks: number;
      completedTasks: number;
    };
  }> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project || project.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Project not found or does not belong to this workspace',
      );
    }

    const currentDate = new Date();

    // 使用 QueryBuilder 实现聚合查询
    const totalTasks = await this.taskRepository.count({
      where: { projectId },
    });

    const overdueTasks = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.projectId = :projectId', { projectId })
      .andWhere('task.dueDate < :currentDate', { currentDate })
      .andWhere('task.status != :status', { status: TaskStatus.DONE })
      .getCount();

    const completedTasks = await this.taskRepository.count({
      where: { projectId, status: TaskStatus.DONE },
    });

    return {
      analytics: {
        totalTasks,
        overdueTasks,
        completedTasks,
      },
    };
  }

  //更新项目
  async updateProject(
    workspaceId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<{ project: Project }> {
    const { name, emoji, description } = updateProjectDto;

    const project = await this.projectRepository.findOne({
      where: { id: projectId, workspaceId },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or does not belong to the specified workspace',
      );
    }

    if (emoji) project.emoji = emoji;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await this.projectRepository.save(project);

    return { project };
  }

  //删除项目
  async deleteProject(
    workspaceId: string,
    projectId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId, workspaceId },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or does not belong to the specified workspace',
      );
    }

    // 删除项目关联的任务
    await this.taskRepository.delete({ projectId });

    // 删除项目
    await this.projectRepository.remove(project);

    return project;
  }
}