import { z } from 'zod'

export const INTEGRATION_PROVIDERS = [
  'WHATSAPP_CLOUD',
  'TWILIO_SMS',
  'SMTP_EMAIL',
  'SENDGRID',
  'AWS_SES',
  'TELEGRAM_BOT',
  'STRIPE',
  'OPENAI_LLM',
  'META_FACEBOOK_LEADS',
  'INSTAGRAM_LEADS',
  'TIKTOK_LEADS',
  'GOOGLE_WORKSPACE',
  'MICROSOFT_365',
  'SLACK_APP',
  'SHOPIFY_STORE',
  'HUBSPOT_SYNC',
  'ZAPIER_MAKE',
  'DISCORD',
  'ACCOUNTING',
  'CLOUDFLARE_R2',
  'AWS_S3',
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
  verifyToken: z.string().default('nexora_wh_verify_token'),
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
  fromName: z.string().default('Nexora CRM'),
})
export type SmtpEmailConfig = z.infer<typeof SmtpEmailConfigSchema>

export const AwsSesConfigSchema = z.object({
  accessKeyId: z.string().min(1, 'AWS Access Key ID is required'),
  secretAccessKey: z.string().min(1, 'AWS Secret Access Key is required'),
  region: z.string().default('us-east-1'),
  fromEmail: z.string().email('Valid verified from email is required'),
  fromName: z.string().default('Nexora CRM'),
})
export type AwsSesConfig = z.infer<typeof AwsSesConfigSchema>

export const TelegramBotConfigSchema = z.object({
  botToken: z.string().min(1, 'Telegram Bot Token is required'),
  botUsername: z.string().optional(),
})
export type TelegramBotConfig = z.infer<typeof TelegramBotConfigSchema>

export const StripeConfigSchema = z.object({
  publishableKey: z.string().min(1, 'Publishable Key is required'),
  secretKey: z.string().min(1, 'Secret Key is required'),
  webhookSecret: z.string().optional(),
  currency: z.string().default('USD'),
})
export type StripeConfig = z.infer<typeof StripeConfigSchema>

export const GoogleWorkspaceConfigSchema = z.object({
  clientId: z.string().min(1, 'Google Client ID is required'),
  clientSecret: z.string().min(1, 'Google Client Secret is required'),
  redirectUri: z.string().default('http://localhost:3000/api/auth/callback/google'),
  syncCalendar: z.boolean().default(true),
  syncGmail: z.boolean().default(true),
})
export type GoogleWorkspaceConfig = z.infer<typeof GoogleWorkspaceConfigSchema>

export const SlackConfigSchema = z.object({
  botToken: z.string().min(1, 'Slack Bot Token (xoxb-...) is required'),
  webhookUrl: z.string().url().optional(),
  defaultChannel: z.string().default('#general'),
  notifyWonDeals: z.boolean().default(true),
  notifyNewLeads: z.boolean().default(true),
})
export type SlackConfig = z.infer<typeof SlackConfigSchema>

export const ShopifyConfigSchema = z.object({
  shopUrl: z.string().min(1, 'Shop URL (*.myshopify.com) is required'),
  accessToken: z.string().min(1, 'Admin API Access Token is required'),
  syncCustomers: z.boolean().default(true),
  syncOrdersAsDeals: z.boolean().default(true),
})
export type ShopifyConfig = z.infer<typeof ShopifyConfigSchema>

export const HubSpotConfigSchema = z.object({
  accessToken: z.string().min(1, 'HubSpot Private App Access Token is required'),
  syncContacts: z.boolean().default(true),
  syncCompanies: z.boolean().default(true),
  syncDeals: z.boolean().default(true),
})
export type HubSpotConfig = z.infer<typeof HubSpotConfigSchema>

export const ZapierMakeConfigSchema = z.object({
  webhookUrl: z.string().url('Valid Webhook URL is required'),
  apiKey: z.string().optional(),
  enabledEvents: z.array(z.string()).default(['contact.created', 'deal.won']),
})
export type ZapierMakeConfig = z.infer<typeof ZapierMakeConfigSchema>

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
