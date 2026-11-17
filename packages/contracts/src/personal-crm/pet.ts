import { z } from 'zod'

export const PetSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  petCategory: z.string().max(50),
  name: z.string().min(1).max(255),
  breed: z.string().max(255).nullable(),
  createdAt: z.string().datetime(),
})
export type Pet = z.infer<typeof PetSchema>

export const AddPetSchema = z.object({
  contactId: z.string().uuid(),
  petCategory: z.string().max(50),
  name: z.string().min(1).max(255),
  breed: z.string().max(255).optional(),
})
export type AddPet = z.infer<typeof AddPetSchema>
