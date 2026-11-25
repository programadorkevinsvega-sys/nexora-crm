import { eq, ilike, and, asc, gt, type SQL } from 'drizzle-orm'
import { getDb, users as usersTable } from '@crm/database'
import { UserFilter, PaginatedUsers } from '../domain/repositories/user.repository'
import { User } from '../domain/entities/user.entity'
import { UserMapper } from './user.mapper'
import { UsersProfilesDevicesDrizzleHelper } from './users-profiles-devices.drizzle'

export class UsersCoreDrizzleHelper {
  private static get db() { return getDb() }

  static async findById(tenantId: string, id: string): Promise<User | null> {
    const row = await this.db.query.users.findFirst({
      where: and(eq(usersTable.tenantId, tenantId), eq(usersTable.id, id)),
    })
    if (!row) return null

    const user = UserMapper.toDomain(row)
    return this.attachProfile(user)
  }

  static async findByEmail(tenantId: string, email: string): Promise<User | null> {
    const row = await this.db.query.users.findFirst({
      where: and(
        eq(usersTable.tenantId, tenantId),
        eq(usersTable.email, email.toLowerCase().trim()),
      ),
    })
    if (!row) return null

    const user = UserMapper.toDomain(row)
    return this.attachProfile(user)
  }

  static async list(tenantId: string, filter: UserFilter): Promise<PaginatedUsers> {
    const conditions: SQL[] = [eq(usersTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(usersTable.createdAt, new Date(filter.cursor)))
    if (filter.search) {
      conditions.push(
        ilike(usersTable.email, `%${filter.search}%`),
      )
    }
    if (filter.status) conditions.push(eq(usersTable.status, filter.status))
    if (filter.profileType) conditions.push(eq(usersTable.profileType, filter.profileType))

    const rows = await this.db.query.users.findMany({
      where: and(...conditions.filter(Boolean)),
      limit: filter.limit + 1,
      orderBy: [asc(usersTable.createdAt), asc(usersTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    const users: User[] = []
    for (const row of data) {
      const user = UserMapper.toDomain(row)
      users.push(await this.attachProfile(user))
    }

    return {
      data: users,
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  static async save(user: User): Promise<void> {
    const row = UserMapper.toPersistence(user)
    await this.db.insert(usersTable).values(row).onConflictDoUpdate({
      target: usersTable.id,
      set: row,
    })
  }

  static async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(usersTable).where(
      and(eq(usersTable.tenantId, tenantId), eq(usersTable.id, id)),
    )
  }

  private static async attachProfile(user: User): Promise<User> {
    if (user.profileType === 'NATURAL_PERSON') {
      const profile = await UsersProfilesDevicesDrizzleHelper.getNaturalPersonProfile(user.profileId)
      if (profile) return user.attachProfile(profile)
    } else {
      const profile = await UsersProfilesDevicesDrizzleHelper.getLegalEntityProfile(user.profileId)
      if (profile) return user.attachProfile(profile)
    }
    return user
  }
}
