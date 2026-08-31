import { DrizzleAiRepository } from '../../infrastructure/drizzle-ai.repository'
import * as dbModule from '@crm/database'

// ---------------------------------------------------------------------------
// Mock builder helpers
// ---------------------------------------------------------------------------

function makeSelectChain(responsesByCall: unknown[][]) {
  let callIdx = 0
  return jest.fn().mockImplementation(() => {
    const rows = responsesByCall[callIdx] ?? []
    callIdx++
    return {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(rows),
          then: (resolve: (v: unknown[]) => void) => Promise.resolve().then(() => resolve(rows as unknown[])),
        }),
        then: (resolve: (v: unknown[]) => void) => Promise.resolve().then(() => resolve(rows as unknown[])),
      }),
    }
  })
}

function makeInsertChain() {
  const onConflictDoUpdate = jest.fn().mockResolvedValue(undefined)
  return jest.fn().mockImplementation(() => ({
    values: jest.fn().mockImplementation(() => ({
      onConflictDoUpdate,
      then: (resolve: (v: unknown) => void) => Promise.resolve().then(() => resolve(undefined)),
    })),
  }))
}

// ---------------------------------------------------------------------------
// Test Suite 2: generateMessageDraft (2 cases)
// ---------------------------------------------------------------------------

describe('DrizzleAiRepository – generateMessageDraft', () => {
  let repository: DrizzleAiRepository
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any

  beforeEach(() => {
    mockDb = { select: jest.fn(), insert: makeInsertChain() }
    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleAiRepository()
  })

  afterEach(() => jest.restoreAllMocks())

  it('EMAIL + FORMAL + FOLLOW_UP with contactId → returns draft with non-empty subject and body', async () => {
    const contact = { id: 'con-1', firstName: 'María', lastName: 'López', companyId: 'comp-1', tenantId: 't1' }
    const company = { id: 'comp-1', name: 'Acme Corp', tenantId: 't1' }
    const deal = { id: 'deal-9', name: 'Software Suite', tenantId: 't1' }
    // contact query, company query, deal query
    mockDb.select = makeSelectChain([[contact], [company], [deal]])

    const result = await repository.generateMessageDraft('t1', {
      contactId: 'con-1',
      dealId: 'deal-9',
      channel: 'EMAIL',
      tone: 'FORMAL',
      objective: 'FOLLOW_UP',
    })

    expect(result.channel).toBe('EMAIL')
    expect(result.tone).toBe('FORMAL')
    expect(result.subject).not.toBeNull()
    expect(result.subject).toContain('Seguimiento')
    expect(result.bodyText.length).toBeGreaterThan(20)
    expect(result.tenantId).toBe('t1')
    expect(mockDb.insert).toHaveBeenCalled()
  })

  it('WHATSAPP + FRIENDLY + RE_ENGAGEMENT → body contains greeting', async () => {
    // No contactId or dealId → uses defaults
    mockDb.select = makeSelectChain([])

    const result = await repository.generateMessageDraft('t1', {
      channel: 'WHATSAPP',
      tone: 'FRIENDLY',
      objective: 'RE_ENGAGEMENT',
    })

    expect(result.channel).toBe('WHATSAPP')
    expect(result.tone).toBe('FRIENDLY')
    // RE_ENGAGEMENT body includes 'Hola'
    expect(result.bodyText).toContain('Hola')
    expect(result.bodyText.length).toBeGreaterThan(10)
  })
})

// ---------------------------------------------------------------------------
// Test Suite 3: generateContactExecutiveSummary (1 case)
// ---------------------------------------------------------------------------

describe('DrizzleAiRepository – generateContactExecutiveSummary', () => {
  let repository: DrizzleAiRepository
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any

  beforeEach(() => {
    mockDb = { select: jest.fn(), insert: makeInsertChain() }
    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleAiRepository()
  })

  afterEach(() => jest.restoreAllMocks())

  it('contact with 2+ open tickets → sentiment NEGATIVE', async () => {
    const contact = { id: 'con-2', firstName: 'Carlos', lastName: 'Ruiz', companyId: null, tenantId: 't1' }
    const openTickets = [
      { id: 'tk1', contactId: 'con-2', status: 'OPEN' },
      { id: 'tk2', contactId: 'con-2', status: 'IN_PROGRESS' },
    ]
    const dealRows = [{ id: 'd1', name: 'Deal A' }]
    // contact query → limit(1), then deals and tickets via Promise.all
    mockDb.select = makeSelectChain([[contact], dealRows, openTickets])

    const result = await repository.generateContactExecutiveSummary('t1', 'con-2')

    expect(result.contactId).toBe('con-2')
    expect(result.contactName).toBe('Carlos Ruiz')
    expect(result.sentiment).toBe('NEGATIVE')
    expect(result.keyPainPoints.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Test Suite 4: predictChurnRisk (1 case)
// ---------------------------------------------------------------------------

describe('DrizzleAiRepository – predictChurnRisk', () => {
  let repository: DrizzleAiRepository
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any

  beforeEach(() => {
    mockDb = { select: jest.fn(), insert: makeInsertChain() }
    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleAiRepository()
  })

  afterEach(() => jest.restoreAllMocks())

  it('contact with 2 open tickets → churnRiskLevel MEDIUM and percent = 55', async () => {
    const contact = { id: 'con-3', firstName: 'Ana', lastName: 'Gómez', tenantId: 't1' }
    const openTickets = [
      { id: 'tk3', contactId: 'con-3', status: 'OPEN' },
      { id: 'tk4', contactId: 'con-3', status: 'PENDING' },
    ]
    mockDb.select = makeSelectChain([[contact], openTickets])

    const result = await repository.predictChurnRisk('t1', 'con-3')

    expect(result.contactId).toBe('con-3')
    expect(result.contactName).toBe('Ana Gómez')
    // 15 base + 40 (≥2 open tickets) = 55; HIGH threshold is ≥60, so level is MEDIUM
    expect(result.churnRiskPercent).toBe(55)
    expect(result.churnRiskLevel).toBe('MEDIUM')
    expect(result.preventiveActions.length).toBeGreaterThan(0)
  })
})
