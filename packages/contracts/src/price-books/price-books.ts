import { z } from 'zod'

export const CurrencyCodeSchema = z.enum(['USD', 'COP', 'MXN', 'EUR'])
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>

export const PriceBookSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  currency: CurrencyCodeSchema,
  description: z.string().nullable().optional(),
  isStandard: z.boolean(),
  isActive: z.boolean(),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type PriceBook = z.infer<typeof PriceBookSchema>

export const CreatePriceBookDtoSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  currency: CurrencyCodeSchema.default('USD'),
  description: z.string().optional(),
  isStandard: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreatePriceBookDto = z.infer<typeof CreatePriceBookDtoSchema>

export const PriceBookEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  priceBookId: z.string().uuid(),
  productId: z.string().uuid(),
  unitPrice: z.number(),
  minQuantity: z.number(),
  discountPercentage: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type PriceBookEntry = z.infer<typeof PriceBookEntrySchema>

export const CreatePriceBookEntryDtoSchema = z.object({
  priceBookId: z.string().uuid(),
  productId: z.string().uuid(),
  unitPrice: z.number().min(0),
  minQuantity: z.number().min(1).default(1).optional(),
  discountPercentage: z.number().min(0).max(100).default(0).optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreatePriceBookEntryDto = z.infer<typeof CreatePriceBookEntryDtoSchema>

export const ProductInventoryLevelSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  stockOnHand: z.number(),
  stockReserved: z.number(),
  stockAvailable: z.number(),
  reorderPoint: z.number(),
  warehouseLocation: z.string(),
  updatedAt: z.string(),
})
export type ProductInventoryLevel = z.infer<typeof ProductInventoryLevelSchema>

export const UpdateInventoryStockDtoSchema = z.object({
  productId: z.string().uuid(),
  stockOnHand: z.number().min(0),
  stockReserved: z.number().min(0).default(0).optional(),
  reorderPoint: z.number().min(0).default(10).optional(),
  warehouseLocation: z.string().default('Principal').optional(),
})
export type UpdateInventoryStockDto = z.infer<typeof UpdateInventoryStockDtoSchema>
