export interface ListContactsInputDto {
  tenantId: string
  search?: string
  leadStatus?: string
  companyId?: string
  isStarred?: boolean
  cursor?: string
  limit?: number
}
