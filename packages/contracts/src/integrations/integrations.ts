import { z } from 'zod'

export const INTEGRATION_PROVIDERS = [
  'WHATSAPP_CLOUD',
  'TWILIO_SMS',
  'SMTP_EMAIL',
  'SENDGRID',
  'TELEGRAM_BOT',
  'STRIPE',
  'OPENAI_LLM',
] as const

export type IntegrationProvider = typeof INTEGRATION_PROVIDERS[number]

export const OpenAiLlmConfigSchema = z.object({
  providerPreset: z.enum(['OPENAI', 'OLLAMA_LOCAL', 'LOCALAI', 'GROQ', 'DEEPSEEK', 'CUSTOM']).default('OPENAI'),
  baseUrl: z.string().url().default('https://api.openai.com/v1'),
  apiKey: z.string().optional().default(''),
  model: z.string().min(1).default('gpt-4o-mini'),
  temperature: z.number().min(0).max(2).default(0.7),
})
export type OpenAiLlmConfig = z.infer<typeof OpenAiLlmConfigSchema>

export const WhatsAppConfigSchema = z.object({
  phoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  wabaId: z.string().min(1, 'WhatsApp Business Account ID is required'),
  accessToken: z.string().min(1, 'Access Token is required'),
  verifyToken: z.string().default('nexus_wh_verify_token'),
})
export type WhatsAppConfig = z.infer<typeof WhatsAppConfigSchema>

export const TwilioSmsConfigSchema = z.object({
  accountSid: z.string().min(1, 'Account SID is required'),
  authToken: z.string().min(1, 'Auth Token is required'),
  fromNumber: z.string().min(1, 'Sender phone number is required'),
})
export type TwilioSmsConfig = z.infer<typeof TwilioSmsConfigSchema>

export const SmtpEmailConfigSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().default(587),
  secure: z.boolean().default(false),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password or App Key is required'),
  fromEmail: z.string().email('Valid from email is required'),
  fromName: z.string().default('Nexus CRM'),
})
export type SmtpEmailConfig = z.infer<typeof SmtpEmailConfigSchema>

export const TelegramBotConfigSchema = z.object({
  botToken: z.string().min(1, 'Telegram Bot Token is required'),
  botUsername: z.string().optional(),
})
export type TelegramBotConfig = z.infer<typeof TelegramBotConfigSchema>

export const SaveIntegrationSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
  credentials: z.record(z.any()),
  isEnabled: z.boolean().default(true),
})
export type SaveIntegrationInput = z.infer<typeof SaveIntegrationSchema>

export const TestIntegrationSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
  recipient: z.string().min(1, 'Destination phone, email or chat ID is required'),
  testMessage: z.string().optional(),
})
export type TestIntegrationInput = z.infer<typeof TestIntegrationSchema>

export const IntegrationStatusSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
  isEnabled: z.boolean(),
  isConfigured: z.boolean(),
  maskedDetails: z.record(z.string()).optional(),
  lastTestedAt: z.string().nullable().optional(),
  lastTestSuccess: z.boolean().nullable().optional(),
  webhookUrl: z.string().optional(),
})
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>
