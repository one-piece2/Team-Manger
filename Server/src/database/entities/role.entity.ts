import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Member } from './member.entity';
import { RoleName, Permission } from '../../common/enums/role.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;
//type:枚举类型 enum:可选值 unique:唯一
  @Column({ type: 'enum', enum: RoleName, unique: true })
  name: RoleName;

//type:简单数组
  @Column({ type: 'simple-array' })
  permissions: Permission[];

// 一个角色可以有多个成员
  @OneToMany(() => Member, (member) => member.role)
  members: Member[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}