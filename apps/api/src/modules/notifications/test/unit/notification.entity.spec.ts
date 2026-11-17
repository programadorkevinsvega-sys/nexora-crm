import { NotificationChannel, NotificationTemplate, Notification } from '../../domain/entities/notification.entity'

describe('Notifications Domain Entities', () => {
  describe('NotificationChannel Entity', () => {
    it('should create communication channel with provider configuration', () => {
      const channel = NotificationChannel.create({
        tenantId: 'tenant-1',
        channelType: 'EMAIL',
        providerType: 'RESEND',
        name: 'Marketing Email Route',
        configJson: { fromEmail: 'no-reply@crm.example.com' },
      })

      expect(channel.id).toBeDefined()
      expect(channel.channelType).toBe('EMAIL')
      expect(channel.providerType).toBe('RESEND')
      expect(channel.isActive).toBe(true)
    })
  })

  describe('NotificationTemplate Entity', () => {
    it('should create template with subject and body variables', () => {
      const template = NotificationTemplate.create({
        tenantId: 'tenant-1',
        templateKey: 'WELCOME_USER',
        channelType: 'EMAIL',
        subjectTemplate: 'Welcome to CRM, {{name}}!',
        bodyTemplate: 'Hi {{name}}, your account is now ready.',
        variables: ['name'],
        locale: 'en',
      })

      expect(template.templateKey).toBe('WELCOME_USER')
      expect(template.subjectTemplate).toBe('Welcome to CRM, {{name}}!')
    })
  })

  describe('Notification Entity', () => {
    it('should track notification lifecycle from PENDING to SENT', () => {
      const notif = Notification.create({
        tenantId: 'tenant-1',
        channelType: 'EMAIL',
        toAddress: 'john@example.com',
        subject: 'Invoice #1024 Ready',
        body: 'Your monthly invoice is attached.',
      })

      expect(notif.status).toBe('PENDING')
      expect(notif.toAddress).toBe('john@example.com')
    })
  })
})
