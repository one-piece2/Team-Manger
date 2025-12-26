# 数据库迁移指南 - MongoDB to PostgreSQL

## 一、数据模型对照

### 1.1 User 模型

#### MongoDB (Mongoose)
```typescript
interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  currentWorkspace: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PostgreSQL (TypeORM)
```typescript
// src/database/entities/user.entity.ts
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
import * as bcrypt from 'bcrypt';
import { Account } from './account.entity';
import { Member } from './member.entity';
import { Workspace } from './workspace.entity';

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

  @Column({ name: 'profile_picture', type: 'varchar', nullable: true })
  profilePicture: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ name: 'current_workspace_id', type: 'uuid', nullable: true })
  currentWorkspaceId: string;

  @ManyToOne(() => Workspace, { nullable: true })
  @JoinColumn({ name: 'current_workspace_id' })
  currentWorkspace: Workspace;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => Member, (member) => member.user)
  memberships: Member[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  omitPassword(): Omit<User, 'password' | 'comparePassword' | 'hashPassword'> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword as any;
  }
}
```

---

### 1.2 Account 模型

#### MongoDB (Mongoose)
```typescript
interface AccountDocument {
  _id: ObjectId;
  provider: 'GOOGLE' | 'GITHUB' | 'FACEBOOK' | 'EMAIL';
  providerId: string;
  userId: ObjectId;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  createdAt: Date;
}
```

#### PostgreSQL (TypeORM)
```typescript
// src/database/entities/account.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum AccountProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  FACEBOOK = 'FACEBOOK',
  EMAIL = 'EMAIL',
}

@Entity('accounts')
@Unique(['provider', 'providerId'])
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: AccountProvider })
  provider: AccountProvider;

  @Column({ name: 'provider_id', type: 'varchar', length: 255 })
  providerId: string;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true, select: false })
  refreshToken: string;

  @Column({ name: 'token_expiry', type: 'timestamp', nullable: true })
  tokenExpiry: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

### 1.3 Workspace 模型

#### MongoDB (Mongoose)
```typescript
interface WorkspaceDocument {
  _id: ObjectId;
  name: string;
  description: string;
  owner: ObjectId;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PostgreSQL (TypeORM)
```typescript
// src/database/entities/workspace.entity.ts
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
import { v4 as uuidv4 } from 'uuid';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'invite_code', type: 'varchar', length: 50, unique: true })
  inviteCode: string;

  @OneToMany(() => Member, (member) => member.workspace)
  members: Member[];

  @OneToMany(() => Project, (project) => project.workspace)
  projects: Project[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  generateInviteCode() {
    if (!this.inviteCode) {
      this.inviteCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    }
  }

  resetInviteCode(): void {
    this.inviteCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }
}
```

---

### 1.4 Role 模型

#### MongoDB (Mongoose)
```typescript
interface RoleDocument {
  _id: ObjectId;
  name: 'OWNER' | 'ADMIN' | 'MEMBER';
  permissions: string[];
}
```

#### PostgreSQL (TypeORM)
```typescript
// src/database/entities/role.entity.ts
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

  @Column({ type: 'enum', enum: RoleName, unique: true })
  name: RoleName;

  @Column({ type: 'simple-array' })
  permissions: Permission[];

  @OneToMany(() => Member, (member) => member.role)
  members: Member[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

### 1.5 Member 模型

#### MongoDB (Mongoose)
```typescript
interface MemberDocument {
  _id: ObjectId;
  userId: ObjectId;
  workspaceId: ObjectId;
  role: ObjectId;
  joinedAt: Date;
}
```

#### PostgreSQL (TypeORM)
```typescript
// src/database/entities/member.entity.ts
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

  @ManyToOne(() => Workspace, (workspace) => workspace.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

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
```

---

### 1.6 Project 模型

#### MongoDB (Mongoose)
```typescript
interface ProjectDocument {
  _id: ObjectId;
  name: string;
  description: string | null;
  emoji: string;
  workspace: ObjectId;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PostgreSQL (TypeORM)
```typescript
// src/database/entities/project.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 10, default: '📊' })
  emoji: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

### 1.7 Task 模型

#### MongoDB (Mongoose)
```typescript
interface TaskDocument {
  _id: ObjectId;
  taskCode: string;
  title: string;
  description: string | null;
  project: ObjectId;
  workspace: ObjectId;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo: ObjectId | null;
  createdBy: ObjectId;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PostgreSQL (TypeORM)
```typescript
// src/database/entities/task.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Project } from './project.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_code', type: 'varchar', length: 20, unique: true })
  taskCode: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  generateTaskCode() {
    if (!this.taskCode) {
      this.taskCode = `TASK-${uuidv4().substring(0, 8).toUpperCase()}`;
    }
  }
}
```

---

## 二、PostgreSQL Schema SQL

### 2.1 创建数据库
```sql
-- 创建数据库
CREATE DATABASE teamsync_db;

-- 连接到数据库
\c teamsync_db;

-- 创建 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2.2 完整建表语句
```sql
-- 角色表
CREATE TYPE role_name AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name role_name UNIQUE NOT NULL,
    permissions TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    profile_picture VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    current_workspace_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 账户表
CREATE TYPE account_provider AS ENUM ('GOOGLE', 'GITHUB', 'FACEBOOK', 'EMAIL');

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider account_provider NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(500),
    token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_id)
);

-- 工作空间表
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    invite_code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加用户表的外键约束
ALTER TABLE users ADD CONSTRAINT fk_current_workspace 
    FOREIGN KEY (current_workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;

-- 成员表
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workspace_id)
);

-- 项目表
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    emoji VARCHAR(10) DEFAULT '📊',
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TYPE task_status AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    status task_status DEFAULT 'TODO',
    priority task_priority DEFAULT 'MEDIUM',
    assigned_to_id UUID REFERENCES users(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_workspace_id ON members(workspace_id);
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

---

## 三、TypeORM 数据源配置

### 3.1 创建 `src/database/data-source.ts`
```typescript
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'teamsync_db',
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // 生产环境务必设为 false
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
```

### 3.2 在 AppModule 中配置 TypeORM
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

## 四、数据迁移脚本

### 4.1 生成迁移文件
```bash
npm run migration:generate -- src/database/migrations/InitialSchema
```

### 4.2 运行迁移
```bash
npm run migration:run
```

### 4.3 回滚迁移
```bash
npm run migration:revert
```

---

## 五、数据种子

### 5.1 角色种子 `src/database/seeders/role.seeder.ts`
```typescript
import { DataSource } from 'typeorm';
import { Role, RoleName, Permission } from '../entities/role.entity';
import dataSource from '../data-source';

const RolePermissions: Record<RoleName, Permission[]> = {
  [RoleName.OWNER]: [
    Permission.CREATE_WORKSPACE,
    Permission.EDIT_WORKSPACE,
    Permission.DELETE_WORKSPACE,
    Permission.MANAGE_WORKSPACE_SETTINGS,
    Permission.ADD_MEMBER,
    Permission.CHANGE_MEMBER_ROLE,
    Permission.REMOVE_MEMBER,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.CREATE_TASK,
    Permission.EDIT_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_ONLY,
  ],
  [RoleName.ADMIN]: [
    Permission.ADD_MEMBER,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.CREATE_TASK,
    Permission.EDIT_TASK,
    Permission.DELETE_TASK,
    Permission.MANAGE_WORKSPACE_SETTINGS,
    Permission.VIEW_ONLY,
  ],
  [RoleName.MEMBER]: [
    Permission.VIEW_ONLY,
    Permission.CREATE_TASK,
    Permission.EDIT_TASK,
  ],
};

async function seedRoles() {
  console.log('Seeding roles started...');

  try {
    await dataSource.initialize();
    console.log('Database connected.');

    const roleRepository = dataSource.getRepository(Role);

    // 清除现有角色
    await roleRepository.clear();
    console.log('Existing roles cleared.');

    // 插入新角色
    for (const [roleName, permissions] of Object.entries(RolePermissions)) {
      const role = roleRepository.create({
        name: roleName as RoleName,
        permissions,
      });
      await roleRepository.save(role);
      console.log(`Role ${roleName} created with permissions.`);
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedRoles();
```

---

## 六、关键变更对照

| MongoDB 操作 | PostgreSQL/TypeORM 操作 |
|-------------|------------------------|
| `Model.findById(id)` | `repository.findOne({ where: { id } })` |
| `Model.find({ field: value })` | `repository.find({ where: { field: value } })` |
| `Model.findOne({ field: value })` | `repository.findOne({ where: { field: value } })` |
| `doc.save()` | `repository.save(entity)` |
| `Model.findByIdAndUpdate()` | `repository.update(id, data)` |
| `Model.findByIdAndDelete()` | `repository.delete(id)` |
| `Model.countDocuments()` | `repository.count({ where: {} })` |
| `.populate('field')` | `relations: ['field']` 或 QueryBuilder |
| `mongoose.startSession()` | `queryRunner.startTransaction()` |
| `session.commitTransaction()` | `queryRunner.commitTransaction()` |

---

*文档版本: 1.0*
*创建日期: 2024-12-25*
