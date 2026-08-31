export interface ListContactsInputDto {
  tenantId: string
  search?: string
  leadStatus?: string
  companyId?: string
  isStarred?: boolean
  assignedUserId?: string
  visibleUserIds?: string[]
  requestingUserId?: string
  requestingUserRole?: string
  scope?: string
  cursor?: string
  limit?: number
}
