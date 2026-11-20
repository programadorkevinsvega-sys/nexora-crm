import { ConflictException } from '@nestjs/common'

export function assertTenantHasRemainingAdmin(
  adminUserIds: string[],
  affectedUserId: string,
  keepsAdminRole: boolean,
): void {
  if (keepsAdminRole) return
  const otherAdmins = new Set(adminUserIds.filter((userId) => userId !== affectedUserId))
  if (otherAdmins.size < 1) {
    throw new ConflictException('The tenant must retain at least one administrator')
  }
}
