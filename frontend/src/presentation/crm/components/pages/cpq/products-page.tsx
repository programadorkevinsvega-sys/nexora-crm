"use client"

import { useState, useEffect } from "react"
import { Plus, Package, Edit2, Trash2, Sparkles, BookmarkPlus, Layers, Check } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiCpqRepository } from "@/src/infrastructure/crm/repositories/cpq/api-cpq.repository"
import type { Product, ProductTemplate, ProductPricingType } from "@/src/domain/crm/cpq/cpq.entity"

export const BILLING_MODELS: { value: ProductPricingType; label: string; badge: string; desc: string }[] = [
  { value: "ONE_TIME", label: "Pago Único / Venta Directa", badge: "Pago Único", desc: "Cobro una sola vez" },
  { value: "MONTHLY_SUBSCRIPTION", label: "Suscripción Mensual (MRR)", badge: "Mensual", desc: "Recurrencia mensual" },
  { value: "QUARTERLY_SUBSCRIPTION", label: "Suscripción Trimestral", badge: "Trimestral", desc: "Cada 3 meses" },
  { value: "BIANNUAL_SUBSCRIPTION", label: "Suscripción Semestral", badge: "Semestral", desc: "Cada 6 meses" },
  { value: "ANNUAL_SUBSCRIPTION", label: "Suscripción Anual (ARR)", badge: "Anual", desc: "Facturación anual con descuento" },
  { value: "USAGE_BASED", label: "Por Consumo / Métricas (API/GB)", badge: "Consumo", desc: "Pago variable por uso" },
  { value: "TIERED_VOLUME", label: "Por Volumen / Escala de Usuarios", badge: "Volumen", desc: "Precio decreciente por volumen" },
  { value: "CUSTOM_MILESTONE", label: "Por Hitos de Proyecto / Entregables", badge: "Por Hitos", desc: "Pagos contra entregables" },
  { value: "HOURLY_RATE", label: "Por Horas / Consultoría / Soporte", badge: "Por Horas", desc: "Tarifa por hora dedicada" },
  { value: "RETAINER", label: "Retainer Mensual + Bolsa de Horas", badge: "Retainer", desc: "Fee fijo recurrente" },
  { value: "CUSTOM", label: "Modelo Personalizado / Negociado", badge: "Personalizado", desc: "Esquema a medida" },
]

function parsePricingType(value: string): ProductPricingType {
  const option = BILLING_MODELS.find((model) => model.value === value)
  if (!option) throw new TypeError(`Unsupported product pricing type: ${value}`)
  return option.value
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

const DEFAULT_PRESETS: Partial<ProductTemplate>[] = [
  {
    name: "Licencia Cloud Pro (Mensual)",
    defaultSkuPrefix: "LIC-PRO",
    defaultUnitPrice: 299,
    pricingType: "MONTHLY_SUBSCRIPTION",
    defaultTaxRate: 19,
    defaultDescription: "Acceso completo a Nexora CRM con automatizaciones ilimitadas.",
  },
  {
    name: "Plan Enterprise Anual (ARR)",
    defaultSkuPrefix: "LIC-ENT",
    defaultUnitPrice: 2400,
    pricingType: "ANNUAL_SUBSCRIPTION",
    defaultTaxRate: 19,
    defaultDescription: "Soporte 24/7, SLA garantizado y motor de IA predictivo.",
  },
  {
    name: "Paquete de Implementación & Setup",
    defaultSkuPrefix: "SRV-SETUP",
    defaultUnitPrice: 1200,
    pricingType: "ONE_TIME",
    defaultTaxRate: 19,
    defaultDescription: "Configuración personalizada de pipelines y migración de datos.",
  },
  {
    name: "Bolsa de 20 Horas Consultoría",
    defaultSkuPrefix: "SRV-HOURS",
    defaultUnitPrice: 1500,
    pricingType: "HOURLY_RATE",
    defaultTaxRate: 19,
    defaultDescription: "Horas de desarrollo e integración personalizada para el cliente.",
  },
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [customTemplates, setCustomTemplates] = useState<ProductTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Product Form State
  const [sku, setSku] = useState("PROD-001")
  const [name, setName] = useState("Licencia Cloud Pro")
  const [unitPrice, setUnitPrice] = useState(299)
  const [pricingType, setPricingType] = useState<ProductPricingType>("MONTHLY_SUBSCRIPTION")
  const [taxRate, setTaxRate] = useState(19)
  const [description, setDescription] = useState("Acceso a la plataforma CRM.")
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // Template Form State
  const [templateName, setTemplateName] = useState("")
  const [templateCategory, setTemplateCategory] = useState("SOFTWARE")
  const [templateSkuPrefix, setTemplateSkuPrefix] = useState("MOD-")
  const [templatePrice, setTemplatePrice] = useState(199)
  const [templatePricingType, setTemplatePricingType] = useState<ProductPricingType>("MONTHLY_SUBSCRIPTION")
  const [templateTaxRate, setTemplateTaxRate] = useState(19)
  const [templateDescription, setTemplateDescription] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prodList, tmplList] = await Promise.all([
        ApiCpqRepository.listProducts(),
        ApiCpqRepository.listTemplates(),
      ])
      setProducts(prodList)
      setCustomTemplates(tmplList)
    } catch (err: unknown) {
      console.error("Failed to load CPQ data:", errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreateModal = () => {
    setEditingProduct(null)
    setSku(`PROD-${Math.floor(100 + Math.random() * 900)}`)
    setName("")
    setUnitPrice(99)
    setPricingType("ONE_TIME")
    setTaxRate(19)
    setDescription("")
    setIsActive(true)
    setShowModal(true)
  }

  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setSku(p.sku)
    setName(p.name)
    setUnitPrice(p.unitPrice)
    setPricingType(p.pricingType)
    setTaxRate(p.taxRate)
    setDescription(p.description || "")
    setIsActive(p.isActive)
    setShowModal(true)
  }

  const applyTemplate = (t: Partial<ProductTemplate>) => {
    if (t.defaultSkuPrefix) {
      setSku(`${t.defaultSkuPrefix}-${Math.floor(100 + Math.random() * 900)}`)
    }
    if (t.name) setName(t.name)
    if (t.defaultUnitPrice !== undefined) setUnitPrice(t.defaultUnitPrice)
    if (t.pricingType) setPricingType(t.pricingType)
    if (t.defaultTaxRate !== undefined) setTaxRate(t.defaultTaxRate)
    if (t.defaultDescription) setDescription(t.defaultDescription)
  }

  const handleSaveProduct = async () => {
    if (!name.trim()) {
      alert("Por favor ingresa el nombre del producto")
      return
    }
    if (Number(unitPrice) <= 0) {
      alert("El precio unitario debe ser mayor a 0")
      return
    }

    try {
      setSaving(true)
      if (editingProduct) {
        await ApiCpqRepository.updateProduct(editingProduct.id, {
          name: name.trim(),
          unitPrice: Number(unitPrice),
          pricingType,
          taxRate: Number(taxRate) || 0,
          description: description.trim() || null,
          isActive,
        })
      } else {
        if (!sku.trim()) {
          alert("Por favor ingresa un SKU único")
          return
        }
        await ApiCpqRepository.createProduct({
          sku: sku.trim().toUpperCase(),
          name: name.trim(),
          unitPrice: Number(unitPrice),
          pricingType,
          taxRate: Number(taxRate) || 0,
          description: description.trim() || undefined,
        })
      }
      setShowModal(false)
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al guardar producto: ${errorMessage(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert("Por favor ingresa el nombre de la plantilla")
      return
    }
    try {
      setSaving(true)
      await ApiCpqRepository.createTemplate({
        name: templateName.trim(),
        category: templateCategory,
        defaultSkuPrefix: templateSkuPrefix.trim().toUpperCase() || undefined,
        defaultUnitPrice: Number(templatePrice),
        pricingType: templatePricingType,
        defaultTaxRate: Number(templateTaxRate) || 0,
        defaultDescription: templateDescription.trim() || undefined,
      })
      setShowTemplateModal(false)
      setTemplateName("")
      setTemplateDescription("")
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al crear plantilla: ${errorMessage(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string, templateTitle: string) => {
    if (!confirm(`¿Eliminar plantilla "${templateTitle}"?`)) return
    try {
      await ApiCpqRepository.deleteTemplate(templateId)
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al eliminar plantilla: ${errorMessage(err)}`)
    }
  }

  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${p.name}" (${p.sku})?`)) return
    try {
      await ApiCpqRepository.deleteProduct(p.id)
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al eliminar producto: ${errorMessage(err)}`)
    }
  }

  const handleToggleActive = async (p: Product) => {
    try {
      await ApiCpqRepository.updateProduct(p.id, { isActive: !p.isActive })
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al cambiar estado: ${errorMessage(err)}`)
    }
  }

  const allTemplates = [...customTemplates, ...DEFAULT_PRESETS]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Catálogo de Productos & Modelos de Cobro (CPQ)"
        description="Configura modelos de facturación personalizados (Pago Único, MRR, ARR, Por Consumo, Hitos, Horas, Retainers) y reutiliza plantillas rápidas."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowTemplateModal(true)}>
              <BookmarkPlus className="h-4 w-4 mr-2 text-primary" />
              Nueva Plantilla
            </Button>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        }
      />

      {/* Templates Bar */}
      <Card className="p-4 bg-muted/30 border space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Plantillas de Productos Rápidas Guardadas ({allTemplates.length}):
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
          >
            + Crear Plantilla Personalizada
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allTemplates.map((t, idx) => {
            const customTemplateId = "id" in t && typeof t.id === "string" ? t.id : null
            return (
              <div key={idx} className="flex items-center group">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-[11px] h-7 px-2.5 bg-background shadow-xs hover:border-primary"
                  onClick={() => {
                    applyTemplate(t)
                    setEditingProduct(null)
                    setShowModal(true)
                  }}
                  title={`Crear producto con plantilla: ${t.name}`}
                >
                  <span className="font-semibold mr-1">{t.name}</span>
                  <span className="text-muted-foreground font-mono">(${t.defaultUnitPrice})</span>
                </Button>
                {customTemplateId && (
                  <button
                    onClick={() => handleDeleteTemplate(customTemplateId, t.name || "")}
                    className="h-7 px-1 text-muted-foreground hover:text-destructive text-[11px] -ml-1 bg-background border border-l-0 rounded-r-md"
                    title="Eliminar plantilla guardada"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Products Table */}
      {loading ? (
        <Skeleton className="h-64" />
      ) : products.length === 0 ? (
        <Card className="p-12 text-center space-y-4 shadow-sm">
          <Package className="h-12 w-12 text-primary mx-auto opacity-80" />
          <div className="font-bold text-base">No hay productos en el catálogo</div>
          <div className="text-xs text-muted-foreground max-w-md mx-auto">
            Crea tu primer producto o haz clic en cualquiera de las plantillas rápidas de arriba para comenzar.
          </div>
          <div className="pt-2">
            <Button size="sm" onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-1" />
              Crear Primer Producto
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Modelo de Facturación</th>
                <th className="p-3">Precio Unitario</th>
                <th className="p-3">Impuesto (%)</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => {
                const modelInfo = BILLING_MODELS.find((b) => b.value === p.pricingType) || BILLING_MODELS[0]
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-bold text-primary">{p.sku}</td>
                    <td className="p-3 font-medium text-foreground">
                      <div className="font-semibold">{p.name}</div>
                      {p.description && <div className="text-[11px] text-muted-foreground">{p.description}</div>}
                    </td>
                    <td className="p-3">
                      <Badge variant={p.pricingType === "ONE_TIME" ? "secondary" : "default"}>
                        {modelInfo.badge}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{modelInfo.desc}</div>
                    </td>
                    <td className="p-3 font-bold text-sm">
                      ${Number(p.unitPrice).toLocaleString()} {p.currency}
                    </td>
                    <td className="p-3 font-mono">{p.taxRate}%</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className="cursor-pointer"
                        title={p.isActive ? "Desactivar producto" : "Activar producto"}
                      >
                        <Badge variant={p.isActive ? "default" : "outline"} className="cursor-pointer">
                          {p.isActive ? "🟢 Activo" : "⚪ Archivado"}
                        </Badge>
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => openEditModal(p)}
                        title="Editar producto"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteProduct(p)}
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal Crear / Editar Producto */}
      {showModal && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editingProduct ? `Editar Producto: ${editingProduct.sku}` : "Crear Producto en Catálogo (CPQ)"}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">SKU / Código Único *</label>
                <input
                  type="text"
                  disabled={!!editingProduct}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-mono uppercase font-bold disabled:opacity-50"
                  placeholder="PROD-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Modelo de Facturación *</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-medium"
                  value={pricingType}
                  onChange={(e) => setPricingType(parsePricingType(e.target.value))}
                >
                  {BILLING_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre del Producto o Servicio *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background font-semibold"
                placeholder="e.g. Consultoría Cloud / Servidor Dedicado / Licencia SaaS"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Precio Unitario ($ USD) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-bold"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tasa Impuestos (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción / Términos de Entrega</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-xs bg-background"
                rows={2}
                placeholder="Especificaciones, alcance de trabajo o SLA..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {editingProduct && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is-active" className="text-xs font-medium text-foreground">
                  Producto Activo en Catálogo (habilitado para cotizaciones)
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} disabled={saving}>
                {editingProduct ? "Guardar Cambios" : "Guardar Producto"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Crear Plantilla de Producto Personalizada */}
      {showTemplateModal && (
        <Modal
          open={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          title="Guardar Nueva Plantilla de Producto Reutilizable"
          size="md"
        >
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Define paquetes y servicios recurrentes de tu empresa para crearlos con 1 clic en el catálogo.
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre de la Plantilla *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background font-semibold"
                placeholder="e.g. Módulo Addon Soporte Premium"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Prefijo SKU Sugerido</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-mono uppercase font-bold"
                  placeholder="MOD-SOPORTE"
                  value={templateSkuPrefix}
                  onChange={(e) => setTemplateSkuPrefix(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Modelo de Facturación</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-medium"
                  value={templatePricingType}
                  onChange={(e) => setTemplatePricingType(parsePricingType(e.target.value))}
                >
                  {BILLING_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Precio Sugerido ($ USD) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-bold"
                  value={templatePrice}
                  onChange={(e) => setTemplatePrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tasa Impuestos (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  value={templateTaxRate}
                  onChange={(e) => setTemplateTaxRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción Predeterminada</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-xs bg-background"
                rows={2}
                placeholder="Alcance estándar para esta plantilla..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTemplate} disabled={saving}>
                Guardar Plantilla
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
