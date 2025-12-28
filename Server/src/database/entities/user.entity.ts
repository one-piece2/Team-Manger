import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Account } from './account.entity';
import { Member } from './member.entity';
import { Workspace } from './workspace.entity';
import { hashValue, compareValue } from '../../common/utils/bcrypt.util';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string;

//头像url
  @Column({ name: 'profile_picture', type: 'varchar', nullable: true })
  profilePicture: string;
//账户状态
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
//最后登录时间
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;
//当前工作区id
  @Column({ name: 'current_workspace_id', type: 'uuid', nullable: true })
  currentWorkspaceId: string | null;

  @ManyToOne(() => Workspace, { nullable: true })
  @JoinColumn({ name: 'current_workspace_id' })
  currentWorkspace: Workspace;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
//一个用户可以是多个工作区的成员
  @OneToMany(() => Member, (member) => member.user)
  memberships: Member[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //插入或更新前
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return compareValue(plainPassword, this.password);
  }

  omitPassword(): Omit<User, 'password' | 'comparePassword' | 'hashPassword'> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword as any;
  }
}