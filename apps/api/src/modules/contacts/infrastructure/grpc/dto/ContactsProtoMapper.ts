import { CreateContactInputDto } from '../../../application/dto/CreateContactInputDto'
import { UpdateContactInputDto } from '../../../application/dto/UpdateContactInputDto'
import { ListContactsInputDto } from '../../../application/dto/ListContactsInputDto'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown): UnknownRecord {
  if (!isRecord(value)) throw new TypeError('Contact gRPC payload must be an object')
  return value
}

function pick(data: UnknownRecord, camelCase: string, snakeCase?: string): unknown {
  const camelValue = data[camelCase]
  return camelValue !== undefined ? camelValue : snakeCase ? data[snakeCase] : undefined
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(`Missing or invalid ${field}`)
  return value
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  throw new TypeError('Expected a string or null')
}

function optionalNullableString(value: unknown): string | null | undefined {
  return value === undefined ? undefined : nullableString(value)
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function numberOrDefault(value: unknown, fallback: number): number {
  return optionalNumber(value) ?? fallback
}

function optionalDate(value: unknown): Date | string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) throw new TypeError('Invalid contact date')
    return value
  }
  throw new TypeError('Expected a date string or null')
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string')) {
    throw new TypeError('Expected an array of strings')
  }
  return value
}

function metadataOrDefault(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) return {}
  if (!isRecord(value)) throw new TypeError('Contact metadata must be an object')
  return value
}

function optionalMetadata(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  return metadataOrDefault(value)
}

export class ContactsProtoMapper {
  static toCreateInput(input: unknown): CreateContactInputDto {
    const data = asRecord(input)
    return {
      tenantId: requiredString(pick(data, 'tenantId', 'tenant_id'), 'tenantId'),
      firstName: requiredString(data.firstName ?? data.first_name, 'firstName'),
      lastName: nullableString(pick(data, 'lastName', 'last_name')),
      email: nullableString(data.email),
      phone: nullableString(data.phone),
      companyId: nullableString(pick(data, 'companyId', 'company_id')),
      jobTitle: nullableString(data.jobTitle),
      leadSource: nullableString(pick(data, 'leadSource', 'lead_source')),
      leadStatus: optionalString(pick(data, 'leadStatus', 'lead_status')),
      identificationType: nullableString(pick(data, 'identificationType', 'identification_type')),
      identificationNumber: nullableString(pick(data, 'identificationNumber', 'identification_number')),
      verificationDigit: nullableString(pick(data, 'verificationDigit', 'verification_digit')),
      birthDate: optionalDate(pick(data, 'birthDate', 'birth_date')) ?? null,
      streetAddress: nullableString(pick(data, 'streetAddress', 'street_address')),
      city: nullableString(data.city),
      stateProvince: nullableString(pick(data, 'stateProvince', 'state_province')),
      postalCode: nullableString(pick(data, 'postalCode', 'postal_code')),
      country: nullableString(data.country),
      latitude: nullableString(data.latitude),
      longitude: nullableString(data.longitude),
      nickname: nullableString(data.nickname),
      gender: nullableString(data.gender),
      isStarred: booleanOrDefault(pick(data, 'isStarred', 'is_starred'), false),
      isDeceased: booleanOrDefault(pick(data, 'isDeceased', 'is_deceased'), false),
      stayInTouchFrequencyDays: optionalNumber(pick(data, 'stayInTouchFrequencyDays', 'stay_in_touch_frequency_days')) ?? null,
      lastTalkedToAt: optionalDate(pick(data, 'lastTalkedToAt', 'last_talked_to_at')) ?? null,
      taxRegime: nullableString(pick(data, 'taxRegime', 'tax_regime')),
      isTaxLiable: booleanOrDefault(pick(data, 'isTaxLiable', 'is_tax_liable'), false),
      loyaltyPoints: numberOrDefault(pick(data, 'loyaltyPoints', 'loyalty_points'), 0),
      avatarUrl: nullableString(pick(data, 'avatarUrl', 'avatar_url')),
      metadata: metadataOrDefault(data.metadata),
    }
  }

  static toUpdateInput(input: unknown): UpdateContactInputDto {
    const data = asRecord(input)
    return {
      tenantId: requiredString(pick(data, 'tenantId', 'tenant_id'), 'tenantId'),
      id: requiredString(data.id, 'id'),
      firstName: optionalString(data.firstName ?? data.first_name),
      lastName: optionalNullableString(pick(data, 'lastName', 'last_name')),
      email: optionalNullableString(data.email),
      phone: optionalNullableString(data.phone),
      companyId: optionalNullableString(pick(data, 'companyId', 'company_id')),
      jobTitle: optionalNullableString(data.jobTitle),
      leadSource: optionalNullableString(pick(data, 'leadSource', 'lead_source')),
      leadStatus: optionalString(pick(data, 'leadStatus', 'lead_status')),
      identificationType: optionalNullableString(pick(data, 'identificationType', 'identification_type')),
      identificationNumber: optionalNullableString(pick(data, 'identificationNumber', 'identification_number')),
      verificationDigit: optionalNullableString(pick(data, 'verificationDigit', 'verification_digit')),
      birthDate: optionalDate(pick(data, 'birthDate', 'birth_date')),
      streetAddress: optionalNullableString(pick(data, 'streetAddress', 'street_address')),
      city: optionalNullableString(data.city),
      stateProvince: optionalNullableString(pick(data, 'stateProvince', 'state_province')),
      postalCode: optionalNullableString(pick(data, 'postalCode', 'postal_code')),
      country: optionalNullableString(data.country),
      latitude: optionalNullableString(data.latitude),
      longitude: optionalNullableString(data.longitude),
      nickname: optionalNullableString(data.nickname),
      gender: optionalNullableString(data.gender),
      isStarred: optionalBoolean(pick(data, 'isStarred', 'is_starred')),
      isDeceased: optionalBoolean(pick(data, 'isDeceased', 'is_deceased')),
      stayInTouchFrequencyDays: optionalNumber(pick(data, 'stayInTouchFrequencyDays', 'stay_in_touch_frequency_days')),
      lastTalkedToAt: optionalDate(pick(data, 'lastTalkedToAt', 'last_talked_to_at')),
      taxRegime: optionalNullableString(pick(data, 'taxRegime', 'tax_regime')),
      isTaxLiable: optionalBoolean(pick(data, 'isTaxLiable', 'is_tax_liable')),
      loyaltyPoints: optionalNumber(pick(data, 'loyaltyPoints', 'loyalty_points')),
      avatarUrl: optionalNullableString(pick(data, 'avatarUrl', 'avatar_url')),
      metadata: optionalMetadata(data.metadata),
    }
  }

  static toListInput(input: unknown): ListContactsInputDto {
    const data = asRecord(input)
    return {
      tenantId: requiredString(pick(data, 'tenantId', 'tenant_id'), 'tenantId'),
      cursor: optionalString(data.cursor),
      limit: optionalNumber(data.limit),
      search: optionalString(data.search),
      leadStatus: optionalString(pick(data, 'leadStatus', 'lead_status')),
      companyId: optionalString(pick(data, 'companyId', 'company_id')),
      isStarred: optionalBoolean(pick(data, 'isStarred', 'is_starred')),
      assignedUserId: optionalString(pick(data, 'assignedUserId', 'assigned_user_id')),
      visibleUserIds: optionalStringArray(pick(data, 'visibleUserIds', 'visible_user_ids')),
      requestingUserId: optionalString(pick(data, 'requestingUserId', 'requesting_user_id'))
        ?? optionalString(pick(data, 'userId', 'user_id')),
      requestingUserRole: optionalString(pick(data, 'requestingUserRole', 'requesting_user_role'))
        ?? optionalString(pick(data, 'userRole', 'user_role')),
      scope: optionalString(data.scope),
    }
  }
}
