import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Member } from './member.entity';

export enum RoleName {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum Permission {
  CREATE_WORKSPACE = 'CREATE_WORKSPACE',
  DELETE_WORKSPACE = 'DELETE_WORKSPACE',
  EDIT_WORKSPACE = 'EDIT_WORKSPACE',
  //管理工作区设置
  MANAGE_WORKSPACE_SETTINGS = 'MANAGE_WORKSPACE_SETTINGS',
  ADD_MEMBER = 'ADD_MEMBER',
  CHANGE_MEMBER_ROLE = 'CHANGE_MEMBER_ROLE',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  CREATE_TASK = 'CREATE_TASK',
  EDIT_TASK = 'EDIT_TASK',
  DELETE_TASK = 'DELETE_TASK',
  VIEW_ONLY = 'VIEW_ONLY',
}

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