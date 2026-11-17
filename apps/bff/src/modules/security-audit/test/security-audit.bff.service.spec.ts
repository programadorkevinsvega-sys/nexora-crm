import { AnomalyTypeSchema, LoginStatusSchema, SecuritySeveritySchema } from '@crm/contracts'

describe('Security Audit & Anomaly Detection Logic', () => {
  it('should validate anomaly types', () => {
    expect(AnomalyTypeSchema.parse('IMPOSSIBLE_TRAVEL')).toBe('IMPOSSIBLE_TRAVEL')
    expect(AnomalyTypeSchema.parse('BRUTE_FORCE')).toBe('BRUTE_FORCE')
    expect(AnomalyTypeSchema.parse('NEW_COUNTRY')).toBe('NEW_COUNTRY')
  })

  it('should validate login statuses and severities', () => {
    expect(LoginStatusSchema.parse('SUCCESS')).toBe('SUCCESS')
    expect(LoginStatusSchema.parse('BLOCKED')).toBe('BLOCKED')
    expect(SecuritySeveritySchema.parse('CRITICAL')).toBe('CRITICAL')
  })
})
