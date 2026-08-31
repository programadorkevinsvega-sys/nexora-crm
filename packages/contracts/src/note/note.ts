import { z } from 'zod'

export const NoteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  companyId: z.string().uuid().nullable(),
  dealId: z.string().uuid().nullable(),
  content: z.string().min(1),
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
  authorUserId: z.string().uuid().nullable().optional(),
})
export type CreateNote = z.infer<typeof CreateNoteSchema>

export const UpdateNoteSchema = z.object({ content: z.string().min(1) })
export type UpdateNote = z.infer<typeof UpdateNoteSchema>
