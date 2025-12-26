import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';
import { Role } from './role.entity';

@Entity('members')
@Unique(['userId', 'workspaceId'])
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  
  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  
  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  //多个成员可以属于同一个工作区
  @ManyToOne(() => Workspace, (workspace) => workspace.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  //该成员所属角色id
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  //多个成员可以属于同一个角色
  @ManyToOne(() => Role, (role) => role.members)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}