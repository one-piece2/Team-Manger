import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../database/entities/member.entity';
import { Workspace } from '../../database/entities/workspace.entity';
import { NotFoundException } from '../exceptions/app.exception';

// 成员角色拦截器 - 用于获取用户在工作空间中的角色并设置到 request.memberRole
@Injectable()
export class MemberRoleInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // 从路由参数中获取 workspaceId
    const workspaceId = request.params.id || request.params.workspaceId;

    if (!workspaceId) {
      // 如果没有 workspaceId，跳过角色检查
      return next.handle();
    }

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // 验证工作空间是否存在
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // 获取用户在工作空间中的成员关系
    const member = await this.memberRepository.findOne({
      where: {
        userId: user.id,
        workspaceId,
      },
      relations: ['role'],
    });

    if (!member) {
      throw new UnauthorizedException(
        'You are not a member of this workspace',
      );
    }

    // 将角色名称设置到 request.memberRole
    request.memberRole = member.role?.name;

    return next.handle();
  }
}
