import { z } from 'zod'

export const ChannelType = z.enum(['EMAIL', 'PUSH', 'SLACK', 'WEBSOCKET', 'SMS'])
export const ProviderType = z.enum(['SES', 'RESEND', 'SMTP', 'FCM', 'SLACK_WEBHOOK', 'CUSTOM'])
export const NotificationStatus = z.enum(['PENDING', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED'])

export const CreateChannelSchema = z.object({
  tenantId: z.string().uuid().optional(),
  channelType: ChannelType,
  providerType: ProviderType,
  name: z.string().min(1).max(255),
  configJson: z.record(z.unknown()).optional(),
})
export type CreateChannel = z.infer<typeof CreateChannelSchema>

export const UpdateChannelSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  configJson: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
})
export type UpdateChannel = z.infer<typeof UpdateChannelSchema>

export const CreateTemplateSchema = z.object({
  tenantId: z.string().uuid().optional(),
  channelType: ChannelType,
  templateKey: z.string().min(1).max(150),
  subjectTemplate: z.string(),
  bodyTemplate: z.string(),
  variables: z.array(z.string()).optional(),
  locale: z.string().max(10).optional(),
})
export type CreateTemplate = z.infer<typeof CreateTemplateSchema>

export const UpdateTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  subjectTemplate: z.string().optional(),
  bodyTemplate: z.string().optional(),
  variables: z.array(z.string()).optional(),
  locale: z.string().max(10).optional(),
})
export type UpdateTemplate = z.infer<typeof UpdateTemplateSchema>

export const SendEmailSchema = z.object({
  tenantId: z.string().uuid().optional(),
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  isHtml: z.boolean().optional(),
  channelId: z.string().uuid().optional(),
})
export type SendEmail = z.infer<typeof SendEmailSchema>

export const SendPushSchema = z.object({
  tenantId: z.string().uuid().optional(),
  deviceToken: z.string(),
  title: z.string(),
  body: z.string(),
  dataJson: z.record(z.unknown()).optional(),
  channelId: z.string().uuid().optional(),
})
export type SendPush = z.infer<typeof SendPushSchema>

export const EnqueueNotificationSchema = z.object({
  tenantId: z.string().uuid().optional(),
  channelType: ChannelType,
  channelId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  toAddress: z.string().max(500),
  subject: z.string().optional(),
  body: z.string().optional(),
  variablesJson: z.record(z.unknown()).optional(),
  priority: z.number().int().optional(),
  scheduledAt: z.string().datetime().optional(),
})
export type EnqueueNotification = z.infer<typeof EnqueueNotificationSchema>

export const SetPreferencesSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  channelType: ChannelType,
  isEnabled: z.boolean(),
})
export type SetPreferences = z.infer<typeof SetPreferencesSchema>
