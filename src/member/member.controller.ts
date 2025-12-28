import {
  Controller,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // 通过邀请码加入工作空间 POST /api/member/workspace/:inviteCode/join
  @Post('workspace/:inviteCode/join')
  @HttpCode(HttpStatus.OK)
  async joinWorkspace(
    @CurrentUser() user: User,
    @Param('inviteCode') inviteCode: string,
  ) {
    const { workspaceId, role } =
      await this.memberService.joinWorkspaceByInvite(user.id, inviteCode);

    return {
      message: 'Successfully joined the workspace',
      workspaceId,
      role,
    };
  }
}
