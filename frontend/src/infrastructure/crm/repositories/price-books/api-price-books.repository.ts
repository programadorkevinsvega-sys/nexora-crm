import type {
  PriceBook,
  CreatePriceBookDto,
  PriceBookEntry,
  CreatePriceBookEntryDto,
  ProductInventoryLevel,
  UpdateInventoryStockDto,
} from '@crm/contracts'

export class ApiPriceBooksRepository {
  static async listPriceBooks(): Promise<PriceBook[]> {
    const res = await fetch('/api/price-books', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar listas de precios')
    return res.json()
  }

  static async createPriceBook(dto: CreatePriceBookDto): Promise<PriceBook> {
    const res = await fetch('/api/price-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al crear lista de precios')
    return res.json()
  }

  static async listEntries(priceBookId: string): Promise<PriceBookEntry[]> {
    const res = await fetch(`/api/price-books/${priceBookId}/entries`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al listar entradas de lista de precios')
    return res.json()
  }

  static async addEntry(dto: CreatePriceBookEntryDto): Promise<PriceBookEntry> {
    const res = await fetch('/api/price-books/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al registrar precio de producto')
    return res.json()
  }

  static async listInventory(): Promise<ProductInventoryLevel[]> {
    const res = await fetch('/api/price-books/inventory', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al consultar inventario de productos')
    return res.json()
  }

  static async updateStock(dto: UpdateInventoryStockDto): Promise<ProductInventoryLevel> {
    const res = await fetch('/api/price-books/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al actualizar stock de producto')
    return res.json()
  }
}
