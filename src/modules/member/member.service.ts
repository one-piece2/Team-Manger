import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../database/entities/member.entity';
import { Workspace } from '../../database/entities/workspace.entity';
import { Role } from '../../database/entities/role.entity';
import {
  NotFoundException,
  BadRequestException,
} from '../../common/exceptions/app.exception';
import { RoleName } from '../../common/enums/role.enum';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // 通过邀请码加入工作空间
  async joinWorkspaceByInvite(
    userId: string,
    inviteCode: string,
  ): Promise<{ workspaceId: string; role: RoleName }> {
    // 查找工作空间
    const workspace = await this.workspaceRepository.findOne({
      where: { inviteCode },
    });

    if (!workspace) {
      throw new NotFoundException('Invalid invite code or workspace not found');
    }

    // 检查用户是否已经是成员
    const existingMember = await this.memberRepository.findOne({
      where: {
        userId,
        workspaceId: workspace.id,
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'You are already a member of this workspace',
      );
    }

    // 获取 MEMBER 角色
    const role = await this.roleRepository.findOne({
      where: { name: RoleName.MEMBER },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // 创建新成员
    const newMember = this.memberRepository.create({
      userId,
      workspaceId: workspace.id,
      roleId: role.id,
      joinedAt: new Date(),
    });
    await this.memberRepository.save(newMember);

    return { workspaceId: workspace.id, role: role.name };
  }
}
