import { LeadTemperature, ScoreAdjustmentLog } from '@crm/contracts'

export class LeadScore {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly score: number,
    readonly temperature: LeadTemperature,
    readonly lastActivityAt: Date,
    readonly history: ScoreAdjustmentLog[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(tenantId: string, contactId: string, initialScore = 0): LeadScore {
    const clampedScore = Math.max(0, initialScore)
    const temperature = LeadScore.calculateTemperature(clampedScore)
    return new LeadScore(
      crypto.randomUUID(),
      tenantId,
      contactId,
      clampedScore,
      temperature,
      new Date(),
      [],
      new Date(),
      new Date(),
    )
  }

  static calculateTemperature(score: number): LeadTemperature {
    if (score >= 80) return 'HOT'
    if (score >= 40) return 'WARM'
    return 'COLD'
  }

  applyPoints(points: number, reason: string, ruleId?: string): {
    updated: LeadScore
    temperatureChanged: boolean
    previousTemperature: LeadTemperature
  } {
    const newScore = Math.max(0, this.score + points)
    const newTemperature = LeadScore.calculateTemperature(newScore)
    const temperatureChanged = newTemperature !== this.temperature
    const previousTemperature = this.temperature

    const logEntry: ScoreAdjustmentLog = {
      ruleId,
      reason,
      points,
      appliedAt: new Date().toISOString(),
    }

    const updated = new LeadScore(
      this.id,
      this.tenantId,
      this.contactId,
      newScore,
      newTemperature,
      new Date(),
      [logEntry, ...this.history.slice(0, 49)], // Keep up to 50 logs
      this.createdAt,
      new Date(),
    )

    return { updated, temperatureChanged, previousTemperature }
  }

  applyDecay(daysWithoutActivity: number, decayRatePerPeriod = 5, periodDays = 7): {
    updated: LeadScore
    pointsDecayed: number
    temperatureChanged: boolean
  } {
    if (daysWithoutActivity < periodDays) {
      return { updated: this, pointsDecayed: 0, temperatureChanged: false }
    }

    const periods = Math.floor(daysWithoutActivity / periodDays)
    const totalDecay = periods * decayRatePerPeriod
    const newScore = Math.max(0, this.score - totalDecay)
    const newTemp = LeadScore.calculateTemperature(newScore)
    const temperatureChanged = newTemp !== this.temperature

    const logEntry: ScoreAdjustmentLog = {
      reason: `Inactivity decay: ${daysWithoutActivity} days without interactions`,
      points: -totalDecay,
      appliedAt: new Date().toISOString(),
    }

    const updated = new LeadScore(
      this.id,
      this.tenantId,
      this.contactId,
      newScore,
      newTemp,
      this.lastActivityAt,
      [logEntry, ...this.history.slice(0, 49)],
      this.createdAt,
      new Date(),
    )

    return { updated, pointsDecayed: totalDecay, temperatureChanged }
  }
}
