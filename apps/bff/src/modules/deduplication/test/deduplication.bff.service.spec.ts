import { LevenshteinHelper } from '../levenshtein.helper'
import { DeduplicationEntityTypeSchema, MatchTypeSchema } from '@crm/contracts'

describe('Deduplication Contracts & Fuzzy Levenshtein Logic', () => {
  it('should calculate 100% similarity for identical strings', () => {
    expect(LevenshteinHelper.similarityPercentage('kevin@example.com', 'kevin@example.com')).toBe(100)
    expect(LevenshteinHelper.similarityPercentage('Acme Corp', 'acme corp')).toBe(100)
  })

  it('should calculate high similarity for typos', () => {
    const score = LevenshteinHelper.similarityPercentage('Kevins Vega', 'Kevin Vega')
    expect(score).toBeGreaterThanOrEqual(90)
  })

  it('should validate deduplication entity types', () => {
    expect(DeduplicationEntityTypeSchema.parse('CONTACT')).toBe('CONTACT')
    expect(DeduplicationEntityTypeSchema.parse('COMPANY')).toBe('COMPANY')
  })

  it('should validate match types', () => {
    expect(MatchTypeSchema.parse('EXACT')).toBe('EXACT')
    expect(MatchTypeSchema.parse('FUZZY_LEVENSHTEIN')).toBe('FUZZY_LEVENSHTEIN')
  })
})
