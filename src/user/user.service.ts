import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { User } from '../database/entities/user.entity';
import { NotFoundException } from '../common/exceptions/app.exception';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 获取当前用户信息
  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['currentWorkspace'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  // 通过 ID 获取用户（用于内部验证，如 JWT Strategy）
  // 不加载关联关系，性能更好，返回 null 而不是抛出异常
  async findById(userId: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  // 通过邮箱获取用户
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['currentWorkspace'],
    });

    if (!user) {
      return null;
    }

    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  // 更新用户信息
  async updateUser(
    userId: string,
    updateData: Partial<Pick<User, 'name' | 'profilePicture'>>,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['currentWorkspace'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  // 更新用户当前工作空间
  async updateCurrentWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['currentWorkspace'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.currentWorkspaceId = workspaceId;
    await this.userRepository.save(user);

    // 重新加载以获取更新后的 currentWorkspace 关联
    const updatedUser = await this.getCurrentUser(userId);

    return plainToClass(UserResponseDto, updatedUser, { excludeExtraneousValues: true });
  }
}