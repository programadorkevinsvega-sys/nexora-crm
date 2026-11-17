import { Injectable, Logger } from '@nestjs/common'
import { BantQualification } from '../../domain/entities/bant-qualification.entity'
import { LeadBantQualifiedEvent } from '../../domain/events/bant.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

export interface QualifyLeadBantCommand {
  tenantId: string
  contactId: string
  messageOrNotes: string
  jobTitle?: string
  budgetDeclared?: number | string
  timelineDeclared?: string
  companySize?: string
}

@Injectable()
export class QualifyLeadBantHandler {
  private readonly logger = new Logger(QualifyLeadBantHandler.name)

  constructor(private readonly outbox: OutboxService) {}

  async execute(command: QualifyLeadBantCommand): Promise<BantQualification> {
    const text = (command.messageOrNotes || '').toLowerCase()
    const job = (command.jobTitle || '').toLowerCase()

    // 1. Budget Score (0-25)
    let budgetScore = 10
    if (command.budgetDeclared) {
      budgetScore = 22
    } else if (text.includes('presupuesto') || text.includes('precio') || text.includes('cotización') || text.includes('costo')) {
      budgetScore = 18
    } else if (text.includes('gratis') || text.includes('demo') || text.includes('barato')) {
      budgetScore = 8
    }

    // 2. Authority Score (0-25)
    let authorityScore = 10
    const decisionMakers = ['ceo', 'founder', 'director', 'gerente', 'head', 'vp', 'owner', 'dueño', 'socio']
    if (decisionMakers.some((dm) => job.includes(dm) || text.includes(dm))) {
      authorityScore = 25
    } else if (text.includes('decidir') || text.includes('comprar') || text.includes('aprobado')) {
      authorityScore = 20
    }

    // 3. Need Score (0-25)
    let needScore = 12
    const highNeedKeywords = ['urgente', 'problema', 'necesitamos', 'implementar', 'reemplazar', 'escalar', 'automatizar', 'migrar']
    if (highNeedKeywords.some((kw) => text.includes(kw))) {
      needScore = 23
    } else if (text.length > 50) {
      needScore = 16
    }

    // 4. Timeline Score (0-25)
    let timelineScore = 10
    const urgentTimelineKeywords = ['hoy', 'inmediato', 'esta semana', 'este mes', 'urgente', 'asap']
    if (urgentTimelineKeywords.some((tk) => text.includes(tk)) || command.timelineDeclared === 'IMMEDIATE') {
      timelineScore = 24
    } else if (text.includes('próximo mes') || text.includes('q1') || text.includes('q2')) {
      timelineScore = 16
    }

    const total = budgetScore + authorityScore + needScore + timelineScore
    let recommendedAction = 'Nutrir prospecto con secuencia de bienvenida por email.'
    let summaryReason = 'Interés inicial detectado pero requiere mayor cualificación BANT.'

    if (total >= 75) {
      recommendedAction = 'Agendar llamada de demostración inmediata y asignar a Sales Executive.'
      summaryReason = 'Lead altamente calificado (SQL): Presupuesto y toma de decisión confirmados.'
    } else if (total >= 50) {
      recommendedAction = 'Enviar propuesta de valor interactiva por WhatsApp y programar seguimiento.'
      summaryReason = 'Lead con potencial claro (MQL): Necesidad y autoridad identificadas.'
    }

    const qualification = BantQualification.create({
      tenantId: command.tenantId,
      contactId: command.contactId,
      budgetScore,
      authorityScore,
      needScore,
      timelineScore,
      summaryReason,
      recommendedAction,
    })

    this.logger.log(
      `Lead ${command.contactId} BANT Qualified: ${qualification.totalBantScore}/100 (${qualification.classification})`,
    )

    await this.outbox.publish(
      new LeadBantQualifiedEvent(
        qualification.contactId,
        qualification.tenantId,
        qualification.totalBantScore,
        qualification.classification,
        qualification.summaryReason,
        qualification.recommendedAction,
        {
          budgetScore: qualification.budgetScore,
          authorityScore: qualification.authorityScore,
          needScore: qualification.needScore,
          timelineScore: qualification.timelineScore,
        },
      ),
    )

    return qualification
  }
}
