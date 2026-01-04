import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../database/entities/member.entity';
import { Workspace } from '../../database/entities/workspace.entity';
import { NotFoundException } from '../exceptions/app.exception';

// 成员角色守卫 - 用于获取用户在工作空间中的角色并设置到 request.memberRole
// 必须在 RoleGuard 之前执行
@Injectable()
export class MemberRoleGuard implements CanActivate {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 从路由参数中获取 workspaceId
    // 优先使用 workspaceId 参数，如果不存在则使用 id（用于 /workspace/:id 这样的路由）
    const workspaceId = request.params.workspaceId || request.params.id;


    if (!workspaceId) {
      // 如果没有 workspaceId，跳过角色检查
      console.log('MemberRoleGuard - No workspaceId found, skipping');
      return true;
    }

    if (!user || !user.id) {
      console.log('MemberRoleGuard - User not authenticated');
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
      console.log('MemberRoleGuard - User is not a member of workspace');
      throw new UnauthorizedException(
        'You are not a member of this workspace',
      );
    }

    // 检查角色是否存在
    if (!member.role || !member.role.name) {

      throw new UnauthorizedException(
        'Member role not properly configured',
      );
    }

    // 将角色名称设置到 request.memberRole
    request.memberRole = member.role.name;
    console.log('MemberRoleGuard - Role set successfully:', request.memberRole);

    return true;
  }
}
