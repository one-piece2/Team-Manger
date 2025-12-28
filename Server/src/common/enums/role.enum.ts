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

export const RolePermissions: Record<RoleName, Permission[]> = {
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