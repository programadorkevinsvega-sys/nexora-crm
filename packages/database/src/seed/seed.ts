import 'dotenv/config'
import { getDb } from '@crm/database'
import {
  users as usersTable,
  naturalPersonProfiles as naturalPersonTable,
  passwordPolicies as passwordPoliciesTable,
  oauthProviders as oauthProvidersTable,
  ipRestrictions as ipRestrictionsTable,
} from '@crm/database'
import bcrypt from 'bcrypt'
import { seedIamData } from './seed-iam'
import { seedCoreData } from './seed-core'
import { seedCpqEnterpriseData } from './seed-cpq-enterprise'
import { seedSupportInboxData } from './seed-support-inbox'
import { seedAdvancedData } from './seed-advanced'

async function runSeed() {
  console.log('🌱 Starting Enterprise CRM Complete Demo Seed...')
  const db = getDb()
  const tenantId = '00000000-0000-0000-0000-000000000001'
  const now = new Date()

  // 1. Password Hash
  const passwordHash = await bcrypt.hash('Password123!', 10)

  // 2. Demo Users
  const usersToCreate = [
    { email: 'demo@nexoracrm.com', firstName: 'Kevin', lastName: 'Demo (CEO)', role: 'admin', phone: '+57-300-123-4567' },
    { email: 'admin@nexoracrm.com', firstName: 'Admin', lastName: 'Sistema', role: 'admin', phone: '+57-300-987-6543' },
    { email: 'sarah.connor@nexoracrm.com', firstName: 'Sarah', lastName: 'Connor', role: 'manager', phone: '+1-415-555-0101' },
    { email: 'alex.mercer@nexoracrm.com', firstName: 'Alex', lastName: 'Mercer', role: 'agent', phone: '+1-415-555-0102' },
    { email: 'elena.rostova@nexoracrm.com', firstName: 'Elena', lastName: 'Rostova', role: 'agent', phone: '+1-415-555-0103' },
  ]

  const userIds: string[] = []
  for (const u of usersToCreate) {
    const userId = crypto.randomUUID()
    const profileId = crypto.randomUUID()
    userIds.push(userId)

    await db.insert(usersTable).values({
      id: userId,
      tenantId,
      email: u.email,
      passwordHash,
      profileId,
      profileType: 'NATURAL_PERSON',
      status: 'ACTIVE',
      isEmailVerified: true,
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()

    await db.insert(naturalPersonTable).values({
      id: profileId,
      tenantId,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      countryCode: 'CO',
      preferredLanguage: 'es',
      timezone: 'America/Bogota',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()
  }

  // 3. Password Policies & Auth
  await db.insert(passwordPoliciesTable).values({
    tenantId,
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
    expireDays: 90,
    preventReuseLastN: 5,
    updatedAt: now,
  }).onConflictDoNothing()

  await db.insert(ipRestrictionsTable).values({
    id: crypto.randomUUID(),
    tenantId,
    ipAddress: '127.0.0.1',
    type: 'ALLOW',
    description: 'Localhost Developer Access',
    createdAt: now,
  }).onConflictDoNothing()

  console.log('  ✔ Demo Tenant & 5 Authenticated Users created')

  // 4. IAM Roles & Permissions
  await seedIamData(db, tenantId, userIds)
  console.log('  ✔ IAM: Super Admin, Admin, Manager, Agent roles & module permissions assigned')

  // 5. Core Entities (Companies, Contacts, Tags, Pipelines, Stages, Deals)
  const { companyIds, contactIds, dealIds } = await seedCoreData(db, tenantId, userIds[0])
  console.log('  ✔ Core: 6 B2B Enterprises, 8 Contacts, 6 Tags, Pipelines, Stages, Deals seeded')

  // 6. CPQ & Enterprise Sales
  await seedCpqEnterpriseData(db, tenantId, companyIds, contactIds, userIds, dealIds)
  console.log('  ✔ CPQ & Sales: Products, Quotes, Approvals, Contracts, Sales Teams, Campaigns seeded')

  // 7. Support & Omnichannel Inbox & Knowledge Base
  await seedSupportInboxData(db, tenantId, contactIds, userIds)
  console.log('  ✔ Support: Notes, Tasks, Calls, Support Tickets, Helpdesk Mailboxes, KB Articles seeded')

  // 8. Advanced Modules (Personal CRM, Loyalty, Affiliates, Automations, Lead Scoring, AI, Developer, Audit)
  await seedAdvancedData(db, tenantId, contactIds, dealIds, userIds)
  console.log('  ✔ Advanced: Personal CRM, Loyalty, Affiliates, Automations, Scoring, AI, API Keys, Audit Logs seeded')

  console.log('\n======================================================')
  console.log('🎉 DEMO ENVIRONMENT READY FOR USE!')
  console.log('======================================================')
  console.log('🔑 Credenciales de Acceso Demo:')
  console.log('   - Email Demo:     demo@nexoracrm.com (o admin@nexoracrm.com)')
  console.log('   - Contraseña:     Password123!')
  console.log('   - Tenant ID:      00000000-0000-0000-0000-000000000001')
  console.log('======================================================\n')
  process.exit(0)
}

runSeed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
