import { NotFoundException } from '@nestjs/common'
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
// Test Suite 1: predictDealWinProbability (4 cases)
// ---------------------------------------------------------------------------

describe('DrizzleAiRepository – predictDealWinProbability', () => {
  let repository: DrizzleAiRepository
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any

  beforeEach(() => {
    mockDb = { select: jest.fn(), insert: makeInsertChain() }
    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleAiRepository()
  })

  afterEach(() => jest.restoreAllMocks())

  it('deal WON → winProbabilityPercent = 100 and health EXCELLENT', async () => {
    const wonDeal = { id: 'deal-1', tenantId: 't1', name: 'Enterprise Deal', amount: '5000', status: 'WON', contactId: null }
    // deal row returned first, then empty arrays for quotes/calls/emails/whatsapp
    mockDb.select = makeSelectChain([[wonDeal], [], [], [], []])

    const result = await repository.predictDealWinProbability('t1', 'deal-1')

    expect(result.winProbabilityPercent).toBe(100)
    expect(result.dealHealth).toBe('EXCELLENT')
    expect(result.dealId).toBe('deal-1')
  })

  it('deal OPEN with approved quote + 4 interactions → probability ≥ 80', async () => {
    const deal = { id: 'deal-2', tenantId: 't1', name: 'Big Opportunity', amount: '20000', status: 'OPEN', contactId: 'c1' }
    const quotes = [{ id: 'q1', dealId: 'deal-2', status: 'APPROVED', tenantId: 't1' }]
    const calls = [{ id: 'ca1' }, { id: 'ca2' }]
    const emails = [{ id: 'em1' }, { id: 'em2' }]
    mockDb.select = makeSelectChain([[deal], quotes, calls, emails, []])

    const result = await repository.predictDealWinProbability('t1', 'deal-2')

    // 35 base + 35 approved quote + 15 interactions(4) + 10 high amount = 95 (capped)
    expect(result.winProbabilityPercent).toBeGreaterThanOrEqual(80)
    expect(result.dealHealth).toBe('EXCELLENT')
  })

  it('deal OPEN, no quote, no interactions → probability ≤ 30 and health WARNING or CRITICAL', async () => {
    const deal = { id: 'deal-3', tenantId: 't1', name: 'Cold Lead', amount: '500', status: 'OPEN', contactId: 'c2' }
    mockDb.select = makeSelectChain([[deal], [], [], [], []])

    const result = await repository.predictDealWinProbability('t1', 'deal-3')

    // 35 - 20 (zero interactions) = 15, no quote risk
    expect(result.winProbabilityPercent).toBeLessThanOrEqual(30)
    expect(['CRITICAL', 'WARNING']).toContain(result.dealHealth)
  })

  it('deal not found → throws NotFoundException', async () => {
    mockDb.select = makeSelectChain([[]])

    await expect(repository.predictDealWinProbability('t1', 'nonexistent')).rejects.toThrow(NotFoundException)
  })
})
