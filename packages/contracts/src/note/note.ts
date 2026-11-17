import { z } from 'zod'

export const NoteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  content: z.string().min(1),
  isPinned: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).nullable().optional(),
  authorUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Note = z.infer<typeof NoteSchema>

export const CreateNoteSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  content: z.string().min(1),
  isPinned: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  authorUserId: z.string().uuid().nullable().optional(),
})
export type CreateNote = z.infer<typeof CreateNoteSchema>

export const UpdateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  isPinned: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
}).partial()
export type UpdateNote = z.infer<typeof UpdateNoteSchema>
