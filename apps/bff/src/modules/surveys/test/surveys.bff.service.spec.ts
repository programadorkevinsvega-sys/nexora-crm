import { SurveyTypeSchema, SurveyTriggerEventSchema, CreateCustomerSurveyDtoSchema } from '@crm/contracts'

describe('Surveys Contracts & Classification Rules', () => {
  it('should validate survey types and trigger events', () => {
    expect(SurveyTypeSchema.parse('NPS')).toBe('NPS')
    expect(SurveyTypeSchema.parse('CSAT')).toBe('CSAT')
    expect(SurveyTriggerEventSchema.parse('DEAL_WON')).toBe('DEAL_WON')
    expect(SurveyTriggerEventSchema.parse('TICKET_RESOLVED')).toBe('TICKET_RESOLVED')
  })

  it('should validate create survey dto', () => {
    const dto = CreateCustomerSurveyDtoSchema.parse({
      name: 'Encuesta Calidad',
      type: 'CSAT',
      triggerEvent: 'TICKET_RESOLVED',
      questionText: '¿Cómo calificaría el servicio recibido?',
    })
    expect(dto.name).toBe('Encuesta Calidad')
  })
})
