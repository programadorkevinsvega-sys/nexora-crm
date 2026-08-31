import { Role } from '../../domain/entities/role.entity'
import { Permission } from '../../domain/entities/permission.entity'
import { UserRole } from '../../domain/entities/user-role.entity'

describe('IAM Domain Entities', () => {
  describe('Role Entity', () => {
    it('should create role with system default properties', () => {
      const role = Role.create({
        tenantId: 'tenant-1',
        name: 'Account Executive',
        description: 'Closes enterprise deals',
      })

      expect(role.id).toBeDefined()
      expect(role.name).toBe('Account Executive')
      expect(role.createdAt).toBeInstanceOf(Date)
    })

    it('should immutably update role properties', () => {
      const role = Role.create({
        tenantId: 'tenant-1',
        name: 'Junior Rep',
      })

      const updated = role.update({
        name: 'Senior Account Executive',
        description: 'Leads strategic accounts',
      })

      expect(updated.name).toBe('Senior Account Executive')
      expect(updated.description).toBe('Leads strategic accounts')
      expect(role.name).toBe('Junior Rep') // immutability
    })
  })

  describe('Permission Entity', () => {
    it('should format module:action permission identifier correctly', () => {
      const perm = Permission.create({
        module: 'deals',
        action: 'approve_discount',
        description: 'Allows approving discounts above 20%',
      })

      expect(perm.module).toBe('deals')
      expect(perm.action).toBe('approve_discount')
    })
  })

  describe('UserRole Entity', () => {
    it('should assign role to user with tenant scoping', () => {
      const userRole = UserRole.create({
        tenantId: 'tenant-1',
        userId: 'user-123',
        roleId: 'role-admin',
      })

      expect(userRole.tenantId).toBe('tenant-1')
      expect(userRole.userId).toBe('user-123')
      expect(userRole.roleId).toBe('role-admin')
      expect(userRole.grantedAt).toBeInstanceOf(Date)
    })
  })
})
