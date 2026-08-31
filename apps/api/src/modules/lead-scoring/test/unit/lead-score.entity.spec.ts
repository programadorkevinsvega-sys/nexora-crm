import { LeadScore } from '../../domain/entities/lead-score.entity'

describe('LeadScore Entity', () => {
  it('should initialize with score 0 and COLD temperature', () => {
    const leadScore = LeadScore.create('tenant-1', 'contact-1', 0)

    expect(leadScore.score).toBe(0)
    expect(leadScore.temperature).toBe('COLD')
    expect(leadScore.contactId).toBe('contact-1')
  })

  it('should update temperature correctly based on score thresholds', () => {
    const leadScore = LeadScore.create('tenant-1', 'contact-1', 20)
    expect(leadScore.temperature).toBe('COLD')

    const warmResult = leadScore.applyPoints(30, 'Requested product demo')
    expect(warmResult.updated.score).toBe(50)
    expect(warmResult.updated.temperature).toBe('WARM')
    expect(warmResult.temperatureChanged).toBe(true)
    expect(warmResult.previousTemperature).toBe('COLD')

    const hotResult = warmResult.updated.applyPoints(35, 'C-Level executive meeting attended')
    expect(hotResult.updated.score).toBe(85)
    expect(hotResult.updated.temperature).toBe('HOT')
    expect(hotResult.temperatureChanged).toBe(true)
    expect(hotResult.previousTemperature).toBe('WARM')
  })

  it('should apply inactivity decay after prolonged period without interactions', () => {
    const hotScore = LeadScore.create('tenant-1', 'contact-1', 85)

    // 21 days without activity = 3 periods * 5 points = -15 points decay
    const decayResult = hotScore.applyDecay(21, 5, 7)

    expect(decayResult.pointsDecayed).toBe(15)
    expect(decayResult.updated.score).toBe(70)
    expect(decayResult.updated.temperature).toBe('WARM')
    expect(decayResult.temperatureChanged).toBe(true)
  })
})
