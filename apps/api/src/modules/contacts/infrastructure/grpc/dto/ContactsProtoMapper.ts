import { CreateContactInputDto } from '../../../application/dto/CreateContactInputDto'
import { UpdateContactInputDto } from '../../../application/dto/UpdateContactInputDto'
import { ListContactsInputDto } from '../../../application/dto/ListContactsInputDto'

export class ContactsProtoMapper {
  static toCreateInput(data: any): CreateContactInputDto {
    return {
      tenantId: data.tenantId || data.tenant_id,
      firstName: data.firstName || data.first_name,
      lastName: data.lastName ?? data.last_name ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      companyId: data.companyId ?? data.company_id ?? null,
      jobTitle: data.jobTitle ?? data.job_title ?? null,
      leadSource: data.leadSource ?? data.lead_source ?? null,
      leadStatus: data.leadStatus ?? data.lead_status ?? undefined,
      identificationType: data.identificationType ?? data.identification_type ?? null,
      identificationNumber: data.identificationNumber ?? data.identification_number ?? null,
      verificationDigit: data.verificationDigit ?? data.verification_digit ?? null,
      birthDate: data.birthDate ?? data.birth_date ?? null,
      streetAddress: data.streetAddress ?? data.street_address ?? null,
      city: data.city ?? null,
      stateProvince: data.stateProvince ?? data.state_province ?? null,
      postalCode: data.postalCode ?? data.postal_code ?? null,
      country: data.country ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      nickname: data.nickname ?? null,
      gender: data.gender ?? null,
      isStarred: data.isStarred ?? data.is_starred ?? false,
      isDeceased: data.isDeceased ?? data.is_deceased ?? false,
      stayInTouchFrequencyDays: data.stayInTouchFrequencyDays ?? data.stay_in_touch_frequency_days ?? null,
      lastTalkedToAt: data.lastTalkedToAt ?? data.last_talked_to_at ?? null,
      taxRegime: data.taxRegime ?? data.tax_regime ?? null,
      isTaxLiable: data.isTaxLiable ?? data.is_tax_liable ?? false,
      loyaltyPoints: data.loyaltyPoints ?? data.loyalty_points ?? 0,
      avatarUrl: data.avatarUrl ?? data.avatar_url ?? null,
      metadata: data.metadata ?? {},
    }
  }

  static toUpdateInput(data: any): UpdateContactInputDto {
    return {
      tenantId: data.tenantId || data.tenant_id,
      id: data.id,
      firstName: data.firstName ?? data.first_name ?? undefined,
      lastName: data.lastName !== undefined ? data.lastName : (data.last_name !== undefined ? data.last_name : undefined),
      email: data.email !== undefined ? data.email : undefined,
      phone: data.phone !== undefined ? data.phone : undefined,
      companyId: data.companyId !== undefined ? data.companyId : (data.company_id !== undefined ? data.company_id : undefined),
      jobTitle: data.jobTitle !== undefined ? data.jobTitle : (data.job_title !== undefined ? data.job_title : undefined),
      leadSource: data.leadSource !== undefined ? data.leadSource : (data.lead_source !== undefined ? data.lead_source : undefined),
      leadStatus: data.leadStatus !== undefined ? data.leadStatus : (data.lead_status !== undefined ? data.lead_status : undefined),
      identificationType: data.identificationType !== undefined ? data.identificationType : (data.identification_type !== undefined ? data.identification_type : undefined),
      identificationNumber: data.identificationNumber !== undefined ? data.identificationNumber : (data.identification_number !== undefined ? data.identification_number : undefined),
      verificationDigit: data.verificationDigit !== undefined ? data.verificationDigit : (data.verification_digit !== undefined ? data.verification_digit : undefined),
      birthDate: data.birthDate !== undefined ? data.birthDate : (data.birth_date !== undefined ? data.birth_date : undefined),
      streetAddress: data.streetAddress !== undefined ? data.streetAddress : (data.street_address !== undefined ? data.street_address : undefined),
      city: data.city !== undefined ? data.city : undefined,
      stateProvince: data.stateProvince !== undefined ? data.stateProvince : (data.state_province !== undefined ? data.state_province : undefined),
      postalCode: data.postalCode !== undefined ? data.postalCode : (data.postal_code !== undefined ? data.postal_code : undefined),
      country: data.country !== undefined ? data.country : undefined,
      latitude: data.latitude !== undefined ? data.latitude : undefined,
      longitude: data.longitude !== undefined ? data.longitude : undefined,
      nickname: data.nickname !== undefined ? data.nickname : undefined,
      gender: data.gender !== undefined ? data.gender : undefined,
      isStarred: data.isStarred !== undefined ? data.isStarred : (data.is_starred !== undefined ? data.is_starred : undefined),
      isDeceased: data.isDeceased !== undefined ? data.isDeceased : (data.is_deceased !== undefined ? data.is_deceased : undefined),
      stayInTouchFrequencyDays: data.stayInTouchFrequencyDays !== undefined ? data.stayInTouchFrequencyDays : (data.stay_in_touch_frequency_days !== undefined ? data.stay_in_touch_frequency_days : undefined),
      lastTalkedToAt: data.lastTalkedToAt !== undefined ? data.lastTalkedToAt : (data.last_talked_to_at !== undefined ? data.last_talked_to_at : undefined),
      taxRegime: data.taxRegime !== undefined ? data.taxRegime : (data.tax_regime !== undefined ? data.tax_regime : undefined),
      isTaxLiable: data.isTaxLiable !== undefined ? data.isTaxLiable : (data.is_tax_liable !== undefined ? data.is_tax_liable : undefined),
      loyaltyPoints: data.loyaltyPoints !== undefined ? data.loyaltyPoints : (data.loyalty_points !== undefined ? data.loyalty_points : undefined),
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : (data.avatar_url !== undefined ? data.avatar_url : undefined),
      metadata: data.metadata !== undefined ? data.metadata : undefined,
    }
  }

  static toListInput(data: any): ListContactsInputDto {
    return {
      tenantId: data.tenantId || data.tenant_id,
      cursor: data.cursor,
      limit: data.limit,
      search: data.search,
      leadStatus: data.leadStatus || data.lead_status,
      companyId: data.companyId || data.company_id,
      isStarred: data.isStarred ?? data.is_starred,
      assignedUserId: data.assignedUserId || data.assigned_user_id,
      visibleUserIds: data.visibleUserIds || data.visible_user_ids,
    }
  }
}
