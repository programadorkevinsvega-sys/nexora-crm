import 'dotenv/config'
import { getDb, companies, contacts, pipelines, pipelineStages, deals, tags, contactTags } from '@crm/database'
import { seedIamData } from './seed-iam'
import { seedExtendedData } from './seed-extended'
import {
  users as usersTable,
  naturalPersonProfiles as naturalPersonTable,
  legalEntityProfiles as legalEntityTable,
  userMobileDevices as devicesTable,
  userOauthLinks as oauthLinksTable,
} from '@crm/database'
import {
  passwordPolicies as passwordPoliciesTable,
  oauthProviders as oauthProvidersTable,
  ipRestrictions as ipRestrictionsTable,
  mfaMethods as mfaMethodsTable,
  mfaRecoveryCodes as recoveryCodesTable,
} from '@crm/database'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'

const PLATFORM_VALUES = ['IOS', 'ANDROID', 'WEB'] as const

async function seed() {
  const db = getDb()

  const tenantId = '00000000-0000-0000-0000-000000000001'

  const companyIds: string[] = []
  for (let i = 1; i <= 5; i++) {
    const id = crypto.randomUUID()
    await db.insert(companies).values({
      id,
      tenantId,
      name: `Company ${i}`,
      taxId: `900.100.20${i}-${i}`,
      industry: ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing'][i - 1],
      numberOfEmployees: [100, 500, 50, 200, 1000][i - 1],
      website: `https://company${i}.com`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    companyIds.push(id)
  }

  const contactIds: string[] = []
  for (let i = 1; i <= 20; i++) {
    const id = crypto.randomUUID()
    await db.insert(contacts).values({
      id,
      tenantId,
      companyId: companyIds[i % companyIds.length],
      firstName: `Contact ${i}`,
      lastName: `Lastname ${i}`,
      email: `contact${i}@example.com`,
      phone: `+1-555-${String(i).padStart(4, '0')}`,
      jobTitle: ['CEO', 'CTO', 'CFO', 'VP of Sales', 'Software Engineer'][i % 5],
      identificationType: 'CC',
      identificationNumber: String(12345000 + i),
      birthDate: new Date(1985 + (i % 20), i % 12, (i % 28) + 1).toISOString().split('T')[0],
      streetAddress: `Calle ${i} #12-34`,
      city: 'Bogota',
      stateProvince: 'Cundinamarca',
      postalCode: '110111',
      country: 'Colombia',
      nickname: `Nick ${i}`,
      gender: ['Male', 'Female'][i % 2],
      taxRegime: 'Simplificado',
      isTaxLiable: i % 2 === 0,
      leadSource: ['Web', 'Referral', 'Social Media'][i % 3],
      leadStatus: ['NEW', 'CONTACTED', 'QUALIFIED', 'CUSTOMER', 'CHURNED'][i % 5] as any,
      loyaltyPoints: i * 10,
      isStarred: i % 5 === 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    contactIds.push(id)
  }

  const tagIds: string[] = []
  const tagNames = ['VIP', 'Hot Lead', 'Cold', 'Follow-up', 'Partner']
  for (const name of tagNames) {
    const id = crypto.randomUUID()
    await db.insert(tags).values({
      id,
      tenantId,
      name,
      color: ['#E2E8F0', '#F56565', '#48BB78', '#ED8936', '#4299E1'][tagNames.indexOf(name)],
      createdAt: new Date(),
    })
    tagIds.push(id)
  }

  for (const contactId of contactIds.slice(0, 5)) {
    await db.insert(contactTags).values({
      contactId,
      tagId: tagIds[Math.floor(Math.random() * tagIds.length)],
      tenantId,
    }).onConflictDoNothing()
  }

  const pipelineId = crypto.randomUUID()
  await db.insert(pipelines).values({
    id: pipelineId,
    tenantId,
    name: 'Sales Pipeline',
    createdAt: new Date(),
  })

  const stageNames = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won']
  const stageIds: string[] = []
  for (let i = 0; i < stageNames.length; i++) {
    const id = crypto.randomUUID()
    await db.insert(pipelineStages).values({
      id,
      tenantId,
      pipelineId,
      name: stageNames[i],
      probabilityPercent: [10, 25, 50, 75, 100][i],
      displayOrder: i + 1,
      createdAt: new Date(),
    })
    stageIds.push(id)
  }

  const dealIds: string[] = []
  const dealStatuses: Array<'OPEN' | 'WON' | 'LOST'> = ['OPEN', 'OPEN', 'OPEN', 'WON', 'LOST']
  for (let i = 0; i < 10; i++) {
    const id = crypto.randomUUID()
    await db.insert(deals).values({
      id,
      tenantId,
      pipelineId,
      stageId: stageIds[i % stageIds.length],
      contactId: contactIds[i],
      companyId: companyIds[i % companyIds.length],
      name: `Deal ${i + 1}`,
      amount: String(Math.floor(Math.random() * 100000) + 1000),
      status: dealStatuses[i],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    dealIds.push(id)
  }

  console.log('Seed completed successfully')
  const adminProfileId = crypto.randomUUID()
  const managerProfileId = crypto.randomUUID()
  const employeeProfileId = crypto.randomUUID()
  const legalProfileId = crypto.randomUUID()

  const passwordHash = await bcrypt.hash('seedpassword123', 10)

  const userIds: string[] = []
  const userData = [
    { email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' },
    { email: 'manager@example.com', firstName: 'Manager', lastName: 'User', role: 'manager' },
    { email: 'employee@example.com', firstName: 'Employee', lastName: 'User', role: 'employee' },
  ]

  for (const u of userData) {
    const id = crypto.randomUUID()
    userIds.push(id)
    const profileId = u.role === 'admin' ? adminProfileId : u.role === 'manager' ? managerProfileId : employeeProfileId
    await db.insert(usersTable).values({
      id,
      tenantId,
      email: u.email,
      passwordHash,
      profileId,
      profileType: 'NATURAL_PERSON',
      status: 'ACTIVE',
      isEmailVerified: true,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await db.insert(naturalPersonTable).values({
      id: profileId,
      tenantId,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: `+1-555-${['0001', '0002', '0003'][userData.indexOf(u)]}`,
      countryCode: 'US',
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const legalUserId = crypto.randomUUID()
  userIds.push(legalUserId)
  await db.insert(usersTable).values({
    id: legalUserId,
    tenantId,
    email: 'company@example.com',
    passwordHash,
    profileId: legalProfileId,
    profileType: 'LEGAL_ENTITY',
    status: 'ACTIVE',
    isEmailVerified: true,
    failedLoginAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await db.insert(legalEntityTable).values({
    id: legalProfileId,
    tenantId,
    legalName: 'Demo Corporation S.A.S.',
    commercialName: 'DemoCorp',
    taxId: 'NIT900123456',
    legalAddress: 'Av. Principal #123, Ciudad',
    countryCode: 'CO',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  for (let i = 0; i < 3; i++) {
    await db.insert(devicesTable).values({
      id: crypto.randomUUID(),
      tenantId,
      userId: userIds[i],
      deviceIdentifier: `DEVICE-${i + 1}-${crypto.randomUUID().slice(0, 8)}`,
      platform: PLATFORM_VALUES[i],
      deviceModel: ['iPhone 15 Pro', 'Samsung Galaxy S24', null][i],
      osVersion: ['18.0', '14.0', null][i],
      pushNotificationToken: i < 2 ? `fcm-token-${i + 1}` : null,
      isTrustedDevice: i === 0,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  await db.insert(passwordPoliciesTable).values({
    tenantId,
    minLength: 10,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
    expireDays: 90,
    preventReuseLastN: 5,
    updatedAt: new Date(),
  }).onConflictDoNothing()

  const authOauthProviderId = crypto.randomUUID()
  await db.insert(oauthProvidersTable).values({
    id: authOauthProviderId,
    tenantId,
    providerName: 'google',
    clientId: process.env.GOOGLE_CLIENT_ID || (() => { console.warn('Seed: GOOGLE_CLIENT_ID not set, using placeholder'); return 'google-client-id-placeholder' })(),
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => { console.warn('Seed: GOOGLE_CLIENT_SECRET not set, using placeholder'); return 'google-client-secret-placeholder' })(),
    isActive: true,
    createdAt: new Date(),
  }).onConflictDoNothing()

  await db.insert(ipRestrictionsTable).values({
    id: crypto.randomUUID(),
    tenantId,
    ipAddress: '127.0.0.1',
    type: 'ALLOW',
    description: 'Localhost access',
    createdAt: new Date(),
  })

  await db.insert(ipRestrictionsTable).values({
    id: crypto.randomUUID(),
    tenantId,
    ipAddress: '10.0.0.0/8',
    type: 'ALLOW',
    description: 'Internal network',
    createdAt: new Date(),
  })

  if (userIds.length > 0) {
    const buf = crypto.getRandomValues(new Uint8Array(20))
    const totpSecret = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
    await db.insert(mfaMethodsTable).values({
      id: crypto.randomUUID(),
      tenantId,
      userId: userIds[0],
      type: 'TOTP',
      secret: totpSecret,
      isPrimary: true,
      isActive: false,
      createdAt: new Date(),
    })
  }

  const recoveryCodes = []
  for (let i = 0; i < 3; i++) {
    recoveryCodes.push({
      id: crypto.randomUUID(),
      userId: userIds.length > 0 ? userIds[i % userIds.length] : crypto.randomUUID(),
      codeHash: `$2b$10$seed_recovery_code_hash_${i}`,
      isUsed: false,
      usedAt: null as Date | null,
      createdAt: new Date(),
    })
  }
  for (const rc of recoveryCodes) {
    await db.insert(recoveryCodesTable).values(rc).onConflictDoNothing()
  }

  console.log(`  - Auth: password policy, OAuth, IP restrictions, MFA`)
  console.log(`  - 3 natural person profiles, 1 legal entity, 3 devices`)
  console.log(`  - ${contactIds.length} contacts, ${tagIds.length} tags`)
  console.log(`  - 1 pipeline, ${stageIds.length} stages, ${dealIds.length} deals`)

  await seedIamData(db, tenantId, userIds)
  await seedExtendedData(db, tenantId, companyIds, contactIds, userIds, pipelineId, stageIds, tagIds, dealIds)

  console.log('')
  console.log('✅ All seed data completed successfully')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
