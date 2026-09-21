export type Role = 'admin' | 'member' | 'viewer'

export const PERMISSIONS = {
  usersRead: 'users:read',
  usersWrite: 'users:write',
  settingsRead: 'settings:read',
  settingsWrite: 'settings:write',
  billingRead: 'billing:read',
  billingWrite: 'billing:write',
  reportsRead: 'reports:read',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    PERMISSIONS.usersRead,
    PERMISSIONS.usersWrite,
    PERMISSIONS.settingsRead,
    PERMISSIONS.settingsWrite,
    PERMISSIONS.billingRead,
    PERMISSIONS.billingWrite,
    PERMISSIONS.reportsRead,
  ],
  member: [
    PERMISSIONS.usersRead,
    PERMISSIONS.settingsRead,
    PERMISSIONS.billingRead,
    PERMISSIONS.reportsRead,
  ],
  viewer: [PERMISSIONS.reportsRead],
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission)
}
