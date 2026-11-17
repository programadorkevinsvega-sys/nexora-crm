'use client'

import React, { useState, useEffect } from 'react'
import type { PriceBook, ProductInventoryLevel } from '@crm/contracts'
import { ApiPriceBooksRepository } from '@src/infrastructure/crm/repositories/price-books/api-price-books.repository'
import { CreatePriceBookModal } from './create-price-book-modal'
import { Package, Plus, DollarSign, Layers, CheckCircle2, AlertTriangle, Globe } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function PriceBooksDashboardPage() {
  const [priceBooks, setPriceBooks] = useState<PriceBook[]>([])
  const [inventory, setInventory] = useState<ProductInventoryLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pbData, invData] = await Promise.all([
        ApiPriceBooksRepository.listPriceBooks(),
        ApiPriceBooksRepository.listInventory(),
      ])
      setPriceBooks(pbData || [])
      setInventory(invData || [])
    } catch (err) {
      console.error('Failed to load price books data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Package size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Listas de Precios (Price Books) & Stock
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tarifarios multi-moneda (USD, COP, MXN, EUR), reglas de descuento y control de stock disponible para CPQ.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all"
        >
          <Plus size={14} /> Nueva Lista de Precios
        </button>
      </div>

      {/* Price Books Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Listas de Precios Configuradas</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {priceBooks.map((pb) => (
              <div
                key={pb.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                      {pb.code}
                    </span>
                    {pb.isStandard && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        ⭐ Estándar
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground">{pb.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {pb.description || 'Lista de precios activa para cotizaciones.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Globe size={14} className="text-primary" />
                    <span>Moneda: {pb.currency}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">🟢 Activa</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock & Inventory Levels Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Control de Inventario & Disponibilidad</h2>
          <span className="text-xs text-muted-foreground">{inventory.length} productos rastreados</span>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Ubicación Bodega</th>
                  <th className="p-3.5">Físico en Mano</th>
                  <th className="p-3.5">Reservado (Deals)</th>
                  <th className="p-3.5">Disponible para Venta</th>
                  <th className="p-3.5">Punto de Reorden</th>
                  <th className="p-3.5 text-right">Estado Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No hay registros de inventario configurados.
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-bold text-foreground">{inv.warehouseLocation}</td>
                      <td className="p-3.5 text-foreground">{inv.stockOnHand} uds</td>
                      <td className="p-3.5 text-amber-600 font-semibold">{inv.stockReserved} uds</td>
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {inv.stockAvailable} uds
                      </td>
                      <td className="p-3.5 text-muted-foreground">{inv.reorderPoint} uds</td>
                      <td className="p-3.5 text-right">
                        {inv.stockAvailable <= inv.reorderPoint ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 inline-flex items-center gap-1">
                            <AlertTriangle size={11} /> Reordenar
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 size={11} /> En Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <CreatePriceBookModal
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}

export default PriceBooksDashboardPage
