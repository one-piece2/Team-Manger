import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RoleInitService } from './database/services/role-init.service';
import { Role } from './database/entities/role.entity';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { MemberModule } from './member/member.module';
import { ProjectModule } from './project/project.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import googleConfig from './config/goole.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, jwtConfig, googleConfig],
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('database.type')! as 'postgres',
        host: configService.get<string>('database.host')!,
        port: parseInt(configService.get<string>('database.port')!, 10),
        username: configService.get<string>('database.username')!,
        password: configService.get<string>('database.password')!,
        database: configService.get<string>('database.database')!,
        entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('app.nodeEnv') === 'development',
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Role]),
    AuthModule,
    UserModule,
    WorkspaceModule,
    MemberModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService, RoleInitService],
})
export class AppModule {}
