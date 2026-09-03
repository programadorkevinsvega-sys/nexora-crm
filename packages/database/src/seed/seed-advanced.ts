import crypto from 'node:crypto'
import { eq } from 'drizzle-orm'
import { getDb, metaIntegrations, metaLeads, metaLeadLogs } from '@crm/database'

export async function seedAdvanced() {
  const db = getDb()
  const tenantId = crypto.randomUUID()
  const now = new Date()

  await db.insert(metaIntegrations).values({
    id: crypto.randomUUID(),
    tenantId,
    status: 'CONNECTED',
    metaAppId: 'seed-meta-app',
    metaPageId: 'seed-meta-page',
    metaPageName: 'Seed Meta Page',
    accessTokenEncrypted: 'seed-token',
    tokenExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    connectedAt: now,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  const [integration] = await db.select().from(metaIntegrations).where(eq(metaIntegrations.tenantId, tenantId)).limit(1)
  const metaIntegrationId = integration?.id

  if (!metaIntegrationId) return

  const [existingMeta] = await db.select().from(metaIntegrations).where(eq(metaIntegrations.id, metaIntegrationId)).limit(1)
  const metaIntegration = existingMeta ?? integration

  if (!metaIntegration) return

  // Preserve the existing seed data and continue with the remaining advanced records.
  await db.insert(metaLeads).values({
    id: crypto.randomUUID(),
    tenantId,
    integrationId: metaIntegration.id,
    externalLeadId: `seed-lead-${crypto.randomUUID()}`,
    fullName: 'Seed Meta Lead',
    email: 'seed@example.com',
    phone: '+573000000000',
    formName: 'Seed Form',
    status: 'NEW',
    rawPayload: {},
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing()

  await db.insert(metaLeadLogs).values({
    id: crypto.randomUUID(),
    tenantId,
    integrationId: metaIntegration.id,
    eventType: 'SEED',
    status: 'SUCCESS',
    message: 'Seeded advanced Meta integration data',
    payload: {},
    createdAt: now,
  }).onConflictDoNothing()
}
