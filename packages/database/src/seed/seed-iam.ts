import { getDb, roles, permissions, rolePermissions, userRoles } from '@crm/database'
import { eq } from 'drizzle-orm'

const MODULES = [
  'companies', 'contacts', 'pipelines', 'deals', 'interactions', 'tags',
  'campaigns', 'contracts', 'sales-teams', 'support-tickets',
  'helpdesk', 'affiliates', 'personal-crm', 'loyalty', 'users', 'iam',
] as const

const ACTIONS = ['create', 'read', 'update', 'delete', 'list'] as const

export async function seedIamData(db: ReturnType<typeof getDb>, tenantId: string, userIds: string[]) {
  const permMap: Record<string, string> = {}

  for (const module of MODULES) {
    for (const action of ACTIONS) {
      const id = crypto.randomUUID()
      await db.insert(permissions).values({
        id,
        module,
        action,
        description: `${action} ${module}`,
      }).onConflictDoNothing()
      permMap[`${module}:${action}`] = id
    }
  }

  const rolesData = [
    { name: 'super_admin', description: 'Full system access across all tenants', isSystemRole: true },
    { name: 'admin', description: 'Full tenant access', isSystemRole: true },
    { name: 'manager', description: 'Read/write access to assigned modules', isSystemRole: true },
    { name: 'agent', description: 'Support and daily operations', isSystemRole: true },
    { name: 'viewer', description: 'Read-only access', isSystemRole: true },
  ]

  for (const r of rolesData) {
    const existing = await db.query.roles.findFirst({
      where: eq(roles.name, r.name),
    })
    if (existing) continue

    const roleId = crypto.randomUUID()
    await db.insert(roles).values({
      id: roleId,
      tenantId,
      name: r.name,
      description: r.description,
      isSystemRole: r.isSystemRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const allActions = r.name === 'viewer' ? ['read', 'list'] : ACTIONS.map(a => a)
    const modulesForRole = r.name === 'super_admin'
      ? MODULES
      : r.name === 'agent'
        ? ['contacts', 'interactions', 'tags', 'support-tickets', 'helpdesk']
        : MODULES

    for (const module of modulesForRole) {
      for (const action of allActions) {
        const permId = permMap[`${module}:${action}`]
        if (permId) {
          await db.insert(rolePermissions).values({
            roleId, permissionId: permId,
          }).onConflictDoNothing()
        }
      }
    }
  }

  if (userIds.length > 0) {
    const roleNames = ['admin', 'manager', 'agent', 'viewer']
    for (let i = 0; i < Math.min(userIds.length, roleNames.length); i++) {
      const r = await db.query.roles.findFirst({
        where: eq(roles.name, roleNames[i]),
      })
      if (r && userIds[i]) {
        await db.insert(userRoles).values({
          userId: userIds[i],
          roleId: r.id,
          tenantId,
        }).onConflictDoNothing()
      }
    }
  }

  console.log('  - IAM seed: permissions, roles, assignments')
}
