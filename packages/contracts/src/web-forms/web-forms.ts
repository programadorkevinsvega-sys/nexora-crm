import { z } from 'zod'

export const FormFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'number']),
  placeholder: z.string().optional().default(''),
  required: z.boolean().optional().default(false),
  mappedContactField: z.enum(['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'companyName', 'city', 'notes', 'custom']).default('custom'),
  options: z.array(z.string()).optional().default([]),
})
export type FormField = z.infer<typeof FormFieldSchema>

export const WebFormSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  title: z.string().default('Contáctanos'),
  description: z.string().nullable().optional(),
  fields: z.array(FormFieldSchema),
  buttonText: z.string().default('Enviar Solicitud'),
  successMessage: z.string().default('¡Gracias! Hemos recibido tu información correctamente.'),
  redirectUrl: z.string().nullable().optional(),
  leadSource: z.string().default('Formulario Web'),
  defaultLeadStatus: z.string().default('NEW'),
  defaultTags: z.array(z.string()).default([]),
  assignToUserId: z.string().uuid().nullable().optional(),
  primaryColor: z.string().default('#06b6d4'),
  backgroundColor: z.string().default('#09090b'),
  textColor: z.string().default('#f4f4f5'),
  borderRadius: z.string().default('12px'),
  customCss: z.string().nullable().optional(),
  submissionsCount: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.any(),
  updatedAt: z.any(),
})
export type WebForm = z.infer<typeof WebFormSchema>

export const CreateWebFormSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  title: z.string().default('Contáctanos').optional(),
  description: z.string().nullable().optional(),
  fields: z.array(FormFieldSchema).default([]),
  buttonText: z.string().default('Enviar Solicitud').optional(),
  successMessage: z.string().default('¡Gracias! Hemos recibido tu información correctamente.').optional(),
  redirectUrl: z.string().nullable().optional(),
  leadSource: z.string().default('Formulario Web').optional(),
  defaultLeadStatus: z.string().default('NEW').optional(),
  defaultTags: z.array(z.string()).default([]).optional(),
  assignToUserId: z.string().uuid().nullable().optional(),
  primaryColor: z.string().default('#06b6d4').optional(),
  backgroundColor: z.string().default('#09090b').optional(),
  textColor: z.string().default('#f4f4f5').optional(),
  borderRadius: z.string().default('12px').optional(),
  customCss: z.string().nullable().optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreateWebForm = z.infer<typeof CreateWebFormSchema>

export const UpdateWebFormSchema = CreateWebFormSchema.partial()
export type UpdateWebForm = z.infer<typeof UpdateWebFormSchema>

export const SubmitWebFormSchema = z.object({
  formData: z.record(z.any()),
})
export type SubmitWebForm = z.infer<typeof SubmitWebFormSchema>
