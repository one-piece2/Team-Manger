import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { TaskStatus, TaskPriority } from '../../common/enums/task.enum';
import { Task } from '../../database/entities/task.entity';
import { Project } from '../../database/entities/project.entity';
import { Member } from '../../database/entities/member.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { NotFoundException, BadRequestException } from '../../common/exceptions/app.exception';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  
// 创建任务
  async createTask(
    workspaceId: string,
    projectId: string,
    userId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<{ task: Task }> {
    const { title, description, priority, status, assignedTo, dueDate } = createTaskDto;

    // 验证项目存在且属于该工作空间
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project || project.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Project not found or does not belong to this workspace',
      );
    }

    // 验证被指派人是工作空间成员
    if (assignedTo) {
      const isAssignedUserMember = await this.memberRepository.findOne({
        where: { userId: assignedTo, workspaceId },
      });

      if (!isAssignedUserMember) {
        throw new BadRequestException(
          'Assigned user is not a member of this workspace.',
        );
      }
    }

    const task = this.taskRepository.create({
      title,
      description,
      priority: priority || TaskPriority.MEDIUM,
      status: status || TaskStatus.TODO,
      assignedToId: assignedTo || undefined,
      createdById: userId,
      workspaceId,
      projectId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await this.taskRepository.save(task);

    return { task };
  }

  // 更新任务
  async updateTask(
    workspaceId: string,
    projectId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<{ updatedTask: Task }> {
    // 验证项目
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project || project.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Project not found or does not belong to this workspace',
      );
    }

    // 验证任务
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task || task.projectId !== projectId) {
      throw new NotFoundException(
        'Task not found or does not belong to this project',
      );
    }

    // 更新任务
    const updateData: Partial<Task> = {
      title: updateTaskDto.title,
      description: updateTaskDto.description,
      priority: updateTaskDto.priority,
      status: updateTaskDto.status,
      assignedToId: updateTaskDto.assignedTo || undefined,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
    };

    await this.taskRepository.update(taskId, updateData);

    const updatedTask = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['assignedTo', 'project'],
    });

    if (!updatedTask) {
      throw new BadRequestException('Failed to update task');
    }

    return { updatedTask };
  }

  // 获取所有任务（带过滤和分页）
  async getAllTasks(
    workspaceId: string,
    query: TaskQueryDto,
  ): Promise<{
    tasks: Task[];
    pagination: {
      pageSize: number;
      pageNumber: number;
      totalCount: number;
      totalPages: number;
      skip: number;
    };
  }> {
    const { pageSize = 10, pageNumber = 1 } = query;
    const skip = (pageNumber - 1) * pageSize;

    // 构建查询条件
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')//关联指派人
      .leftJoinAndSelect('task.project', 'project')//关联项目
      .where('task.workspaceId = :workspaceId', { workspaceId });//项目所属工作空间

    // 项目过滤
    if (query.projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', {
        projectId: query.projectId,
      });
    }

    // 状态过滤
    if (query.status && query.status.length > 0) {
      queryBuilder.andWhere('task.status IN (:...status)', {
        status: query.status,
      });
    }

    // 优先级过滤
    if (query.priority && query.priority.length > 0) {
      queryBuilder.andWhere('task.priority IN (:...priority)', {
        priority: query.priority,
      });
    }

    // 指派人过滤
    if (query.assignedTo && query.assignedTo.length > 0) {
      queryBuilder.andWhere('task.assignedToId IN (:...assignedTo)', {
        assignedTo: query.assignedTo,
      });
    }

    // 关键词搜索
    if (query.keyword) {
      queryBuilder.andWhere('task.title ILIKE :keyword', {
        keyword: `%${query.keyword}%`,
      });
    }

    // 截止日期过滤
    if (query.dueDate) {
      queryBuilder.andWhere('DATE(task.dueDate) = :dueDate', {
        dueDate: query.dueDate,
      });
    }

    // 排序和分页
    queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [tasks, totalCount] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      tasks,
      pagination: {
        pageSize,
        pageNumber,
        totalCount,
        totalPages,
        skip,
      },
    };
  }

  
 //获取任务详情
  async getTaskById(
    workspaceId: string,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    // 验证项目
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project || project.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Project not found or does not belong to this workspace',
      );
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId, workspaceId, projectId },
      relations: ['assignedTo'],
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    return task;
  }

  
// 删除任务
  async deleteTask(workspaceId: string, taskId: string): Promise<void> {
    const result = await this.taskRepository.delete({
      id: taskId,
      workspaceId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        'Task not found or does not belong to the specified workspace',
      );
    }
  }
}