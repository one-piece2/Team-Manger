import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { Member } from './member.entity';
import { Project } from './project.entity';
import { generateInviteCode } from '../../common/utils/uuid.util';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
//工作区所有者id（外键）
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  //邀请码
  @Column({ name: 'invite_code', type: 'varchar', length: 50, unique: true })
  inviteCode: string;

  //一个工作区可以有多个成员
  @OneToMany(() => Member, (member) => member.workspace)
  members: Member[];

  //一个工作区可以有多个项目
  @OneToMany(() => Project, (project) => project.workspace)
  projects: Project[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  setInviteCode() {
    if (!this.inviteCode) {
      this.inviteCode = generateInviteCode();
    }
  }

  resetInviteCode(): void {
    this.inviteCode = generateInviteCode();
  }
}