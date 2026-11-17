import type {
  PriceBook,
  CreatePriceBookDto,
  PriceBookEntry,
  CreatePriceBookEntryDto,
  ProductInventoryLevel,
  UpdateInventoryStockDto,
} from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiPriceBooksRepository {
  static async listPriceBooks(): Promise<PriceBook[]> {
    return api.get<PriceBook[]>('/api/price-books')
  }

  static async createPriceBook(dto: CreatePriceBookDto): Promise<PriceBook> {
    return api.post<PriceBook>('/api/price-books', dto)
  }

  static async listEntries(priceBookId: string): Promise<PriceBookEntry[]> {
    return api.get<PriceBookEntry[]>(`/api/price-books/${priceBookId}/entries`)
  }

  static async addEntry(dto: CreatePriceBookEntryDto): Promise<PriceBookEntry> {
    return api.post<PriceBookEntry>('/api/price-books/entries', dto)
  }

  static async listInventory(): Promise<ProductInventoryLevel[]> {
    return api.get<ProductInventoryLevel[]>('/api/price-books/inventory')
  }

  static async updateStock(dto: UpdateInventoryStockDto): Promise<ProductInventoryLevel> {
    return api.put<ProductInventoryLevel>('/api/price-books/inventory', dto)
  }
}
