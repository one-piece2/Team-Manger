import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { compareValue,hashValue } from 'src/common/utils/bcrypt.util';
import { User } from '../../database/entities/user.entity';
import { Account } from '../../database/entities/account.entity';
import { AccountProvider } from 'src/common/enums/account-provider.enum';
import { Workspace } from '../../database/entities/workspace.entity';
import { Member } from '../../database/entities/member.entity';
import { Role } from '../../database/entities/role.entity';
import { RoleName } from 'src/common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/app.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  
 //验证用户凭据
  async validateUser(email: string, password: string): Promise<User | null> {
    const account = await this.accountRepository.findOne({
      where: { provider: AccountProvider.EMAIL, providerId: email },
    });

    if (!account) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { id: account.userId },
      select: ['id', 'name', 'email', 'password', 'profilePicture', 'isActive', 'currentWorkspaceId'],
    });

    if (!user) {
      return null;
    }

        const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

   
    return user.omitPassword() as User
  }

  //用户注册
  async register(registerDto: RegisterDto): Promise<{ userId: string; workspaceId: string }> {
    const { email, name, password } = registerDto;
//创建查询运行器
    const queryRunner = this.dataSource.createQueryRunner();
    //连接查询运行器
    await queryRunner.connect();
    //开始事务
    await queryRunner.startTransaction();

    try {
      // 检查邮箱是否已存在
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // 创建用户
      const hashedPassword = await hashValue(password);
      const user = queryRunner.manager.create(User, {
        email,
        name,
        password: hashedPassword,
      });
      await queryRunner.manager.save(user);

      // 创建账户
      const account = queryRunner.manager.create(Account, {
        userId: user.id,
        provider: AccountProvider.EMAIL,
        providerId: email,
      });
      await queryRunner.manager.save(account);

      // 创建默认工作空间
      const workspace = queryRunner.manager.create(Workspace, {
        name: 'My Workspace',
        description: `Workspace created for ${name}`,
        ownerId: user.id,
      });
      await queryRunner.manager.save(workspace);

      // 获取 OWNER 角色
      const ownerRole = await queryRunner.manager.findOne(Role, {
        where: { name: RoleName.OWNER },
      });

      if (!ownerRole) {
        throw new NotFoundException('Owner role not found');
      }

      // 创建成员关系
      const member = queryRunner.manager.create(Member, {
        userId: user.id,
        workspaceId: workspace.id,
        roleId: ownerRole.id,
        joinedAt: new Date(),
      });
      await queryRunner.manager.save(member);

      // 更新用户的当前工作空间
      user.currentWorkspaceId = workspace.id;
      await queryRunner.manager.save(user);
//提交事务
      await queryRunner.commitTransaction();

      return {
        userId: user.id,
        workspaceId: workspace.id,
      };
    } catch (error) {
        //一个事务失败，全部回滚
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
        //释放查询运行器
      await queryRunner.release();
    }
  }

  //登录或创建 Google 账户
  async loginOrCreateGoogleAccount(data: {
    googleId: string;
    displayName: string;
    email?: string;
    picture?: string;
  }): Promise<{ user: User; accessToken: string }> {
    const { googleId, displayName, email, picture } = data;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let user = await queryRunner.manager.findOne(User, {
        where: { email },
        relations: ['currentWorkspace'],
      });

      if (!user) {
        // 创建新用户
        user = queryRunner.manager.create(User, {
          email,
          name: displayName,
          profilePicture: picture || undefined,
        });
        await queryRunner.manager.save(user);

        // 创建 Google 账户
        const account = queryRunner.manager.create(Account, {
          userId: user.id,
          provider: AccountProvider.GOOGLE,
          providerId: googleId,
        });
        await queryRunner.manager.save(account);

        // 创建默认工作空间
        const workspace = queryRunner.manager.create(Workspace, {
          name: 'My Workspace',
          description: `Workspace created for ${displayName}`,
          ownerId: user.id,
        });
        await queryRunner.manager.save(workspace);

        // 获取 OWNER 角色
        const ownerRole = await queryRunner.manager.findOne(Role, {
          where: { name: RoleName.OWNER },
        });

        if (!ownerRole) {
          throw new NotFoundException('Owner role not found');
        }

        // 创建成员关系
        const member = queryRunner.manager.create(Member, {
          userId: user.id,
          workspaceId: workspace.id,
          roleId: ownerRole.id,
          joinedAt: new Date(),
        });
        await queryRunner.manager.save(member);

        // 更新用户的当前工作空间
        user.currentWorkspaceId = workspace.id;
        user.currentWorkspace = workspace;
        await queryRunner.manager.save(user);
      } else {
        // 用户已存在，检查是否有 Google 账户关联
        const existingGoogleAccount = await queryRunner.manager.findOne(Account, {
          where: { userId: user.id, provider: AccountProvider.GOOGLE },
        });

        // 如果没有 Google 账户关联，创建一个
        if (!existingGoogleAccount) {
          const account = queryRunner.manager.create(Account, {
            userId: user.id,
            provider: AccountProvider.GOOGLE,
            providerId: googleId,
          });
          await queryRunner.manager.save(account);
        }
      }

      await queryRunner.commitTransaction();

      const accessToken = this.generateToken(user.id);

      return { user, accessToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  
 //生成 JWT Token
  generateToken(userId: string): string {
    const payload = { userId };
    return this.jwtService.sign(payload, {
    
      audience: ['user'],
    });
  }

  //通过 ID 查找用户
  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['currentWorkspace'],
    });
  }
}