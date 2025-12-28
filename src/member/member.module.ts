import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Member } from '../database/entities/member.entity';
import { Workspace } from '../database/entities/workspace.entity';
import { Role } from '../database/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Workspace, Role])],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
