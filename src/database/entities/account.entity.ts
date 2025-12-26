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
//确保数据库中provider和providerId的组合是唯一的
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