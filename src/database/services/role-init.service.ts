import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RoleName, RolePermissions } from '../../common/enums/role.enum';

@Injectable()
export class RoleInitService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.initializeRoles();
  }

  private async initializeRoles() {
    console.log('Checking roles...');

    for (const roleName of Object.values(RoleName)) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!existingRole) {
        const permissions = RolePermissions[roleName];
        const role = this.roleRepository.create({
          name: roleName,
          permissions,
        });
        await this.roleRepository.save(role);
        console.log(`✅ Role ${roleName} created with ${permissions.length} permissions`);
      } else {
        console.log(`✓ Role ${roleName} already exists`);
      }
    }

    console.log('Roles initialization completed');
  }
}
