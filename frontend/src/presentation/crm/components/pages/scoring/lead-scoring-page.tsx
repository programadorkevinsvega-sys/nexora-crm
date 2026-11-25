"use client"

import { useState, useEffect } from "react"
import { Plus, Flame, Zap, Snowflake, RefreshCw, ShieldCheck, Activity, Sparkles } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiScoringRepository } from "@/src/infrastructure/crm/repositories/scoring/api-scoring.repository"
import type { LeadScoringRule, LeadScore } from "@/src/domain/crm/scoring/scoring.entity"
import { ApiContactRepository } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { ApiCompanyRepository } from "@/src/infrastructure/crm/repositories/companies/api-company.repository"

type LeadScoringOperator = LeadScoringRule['condition']['operator']
type LeadScoringCategory = LeadScoringRule['category']

function parseOperator(value: string): LeadScoringOperator {
  const operators: LeadScoringOperator[] = ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'IN', 'IS_EMPTY']
  const operator = operators.find((candidate) => candidate === value)
  if (!operator) throw new TypeError(`Unsupported scoring operator: ${value}`)
  return operator
}

function parseCategory(value: string): LeadScoringCategory {
  if (value === 'DEMOGRAPHIC' || value === 'BEHAVIORAL' || value === 'ENGAGEMENT') return value
  throw new TypeError(`Unsupported scoring category: ${value}`)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

const PRESETS = [
  {
    name: "C-Level / Directivo",
    category: "DEMOGRAPHIC" as const,
    field: "contact.jobTitle",
    operator: "CONTAINS" as const,
    value: "Director",
    points: 25,
  },
  {
    name: "Empresa Grande (>50 empleados)",
    category: "DEMOGRAPHIC" as const,
    field: "company.numberOfEmployees",
    operator: "GREATER_THAN" as const,
    value: "50",
    points: 20,
  },
  {
    name: "Solicitó Demostración / Cotización",
    category: "BEHAVIORAL" as const,
    field: "contact.requestedDemo",
    operator: "EQUALS" as const,
    value: "true",
    points: 30,
  },
  {
    name: "Respuesta por WhatsApp / Teléfono",
    category: "ENGAGEMENT" as const,
    field: "contact.hasReplied",
    operator: "EQUALS" as const,
    value: "true",
    points: 15,
  },
]

export function LeadScoringPage() {
  const [rules, setRules] = useState<LeadScoringRule[]>([])
  const [topLeads, setTopLeads] = useState<LeadScore[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newRuleName, setNewRuleName] = useState("")
  const [newRuleCategory, setNewRuleCategory] = useState<"DEMOGRAPHIC" | "BEHAVIORAL" | "ENGAGEMENT">("DEMOGRAPHIC")
  const [newRuleField, setNewRuleField] = useState("contact.jobTitle")
  const [newRuleOperator, setNewRuleOperator] = useState<LeadScoringOperator>("CONTAINS")
  const [newRuleValue, setNewRuleValue] = useState("Director")
  const [newRulePoints, setNewRulePoints] = useState(25)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rulesList, leadsList] = await Promise.all([
        ApiScoringRepository.listRules(),
        ApiScoringRepository.listTopLeads(15),
      ])
      setRules(rulesList)
      setTopLeads(leadsList)
    } catch (err: unknown) {
      console.error("Failed to load scoring data:", errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleRule = async (ruleId: string) => {
    try {
      await ApiScoringRepository.toggleRule(ruleId)
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al alternar regla: ${errorMessage(err)}`)
    }
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setNewRuleName(preset.name)
    setNewRuleCategory(preset.category)
    setNewRuleField(preset.field)
    setNewRuleOperator(preset.operator)
    setNewRuleValue(preset.value)
    setNewRulePoints(preset.points)
  }

  const handleCreateRule = async () => {
    if (!newRuleName.trim()) {
      alert("Por favor ingresa un nombre para la regla")
      return
    }

    let parsedVal: unknown = newRuleValue.trim()
    if (newRuleOperator === "GREATER_THAN" || newRuleOperator === "LESS_THAN") {
      const num = Number(parsedVal)
      if (!isNaN(num)) parsedVal = num
    } else if (parsedVal.toLowerCase() === "true") {
      parsedVal = true
    } else if (parsedVal.toLowerCase() === "false") {
      parsedVal = false
    }

    try {
      setSaving(true)
      await ApiScoringRepository.createRule({
        name: newRuleName.trim(),
        category: newRuleCategory,
        condition: {
          field: newRuleField.trim(),
          operator: newRuleOperator,
          value: parsedVal,
        },
        points: Math.round(Number(newRulePoints)) || 0,
      })
      setShowModal(false)
      setNewRuleName("")
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al crear la regla: ${errorMessage(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRecalculate = async (contactId: string) => {
    try {
      const contact = await ApiContactRepository.getById(contactId)
      const company = contact.companyId
        ? await ApiCompanyRepository.getById(contact.companyId).catch(() => null)
        : null
      const context: Record<string, unknown> = {
        contact: {
          jobTitle: contact.jobTitle,
          leadStatus: contact.leadStatus,
          leadSource: contact.leadSource,
        },
        ...(company ? { company: { numberOfEmployees: company.numberOfEmployees, industry: company.industry } } : {}),
      }
      await ApiScoringRepository.recalculateScore(contactId, context)
      await fetchData()
    } catch (err: unknown) {
      alert(`Error al recalcular: ${errorMessage(err)}`)
    }
  }

  const hotCount = topLeads.filter((l) => l.temperature === "HOT").length
  const warmCount = topLeads.filter((l) => l.temperature === "WARM").length
  const coldCount = topLeads.filter((l) => l.temperature === "COLD").length

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Lead Scoring & Priorización Predictiva"
        description="Puntuación en tiempo real, clasificación de temperatura (HOT, WARM, COLD) y factor de decaimiento por inactividad."
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Regla de Scoring
          </Button>
        }
      />

      {/* Temperature Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-red-500 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">HOT LEADS (≥80 pts)</div>
            <div className="text-2xl font-bold text-foreground mt-1">{hotCount} Prospectos</div>
            <div className="text-xs text-red-500 font-medium mt-1">Alta propensión de compra inmediata</div>
          </div>
          <Flame className="h-8 w-8 text-red-500 opacity-80" />
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">WARM LEADS (40-79 pts)</div>
            <div className="text-2xl font-bold text-foreground mt-1">{warmCount} Prospectos</div>
            <div className="text-xs text-amber-500 font-medium mt-1">En nutrición comercial y activos</div>
          </div>
          <Zap className="h-8 w-8 text-amber-500 opacity-80" />
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">COLD LEADS (&lt;40 pts)</div>
            <div className="text-2xl font-bold text-foreground mt-1">{coldCount} Prospectos</div>
            <div className="text-xs text-blue-500 font-medium mt-1">Etapa temprana o baja interacción</div>
          </div>
          <Snowflake className="h-8 w-8 text-blue-500 opacity-80" />
        </Card>
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Rules List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Reglas Activas ({rules.length})
            </h3>
            {rules.length === 0 ? (
              <Card className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <div>No hay reglas de scoring creadas aún.</div>
                <Button size="sm" variant="outline" onClick={() => setShowModal(true)}>
                  + Agregar Primera Regla
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <Card key={rule.id} className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={rule.category === "DEMOGRAPHIC" ? "default" : rule.category === "BEHAVIORAL" ? "secondary" : "outline"}>
                        {rule.category}
                      </Badge>
                      <span className={`text-xs font-bold ${rule.points >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {rule.points >= 0 ? `+${rule.points}` : rule.points} pts
                      </span>
                    </div>
                    <div className="font-medium text-xs text-foreground">{rule.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono bg-muted p-1 rounded">
                      {rule.condition?.field} {rule.condition?.operator} {String(rule.condition?.value ?? "")}
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        variant={rule.isActive ? "outline" : "ghost"}
                        className="text-[11px] h-7"
                        onClick={() => handleToggleRule(rule.id)}
                      >
                        {rule.isActive ? "Activa" : "Desactivada"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Top Prioritized Leads */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Radar de Prospectos Priorizados
            </h3>
            {topLeads.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">
                No hay prospectos evaluados aún. Al registrar un contacto o interacción, el puntaje se computa automáticamente.
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
                    <tr>
                      <th className="p-3">ID Contacto</th>
                      <th className="p-3">Puntuación</th>
                      <th className="p-3">Temperatura</th>
                      <th className="p-3">Última Actividad</th>
                      <th className="p-3 text-right">Recalcular</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-muted/30">
                        <td className="p-3 font-mono">{lead.contactId.slice(0, 8)}...</td>
                        <td className="p-3 font-bold text-foreground text-sm">{lead.score}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              lead.temperature === "HOT"
                                ? "destructive"
                                : lead.temperature === "WARM"
                                ? "default"
                                : "outline"
                            }
                          >
                            {lead.temperature === "HOT" ? "🔥 HOT" : lead.temperature === "WARM" ? "⚡ WARM" : "❄️ COLD"}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(lead.lastActivityAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRecalculate(lead.contactId)}
                            title="Recalcular Puntuación"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modal Create Rule */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Nueva Regla de Lead Scoring"
        >
          <div className="space-y-4">
            {/* Quick presets */}
            <div className="space-y-1.5 bg-muted/40 p-2.5 rounded-lg">
              <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Plantillas Rápidas:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-[11px] h-6 px-2"
                    onClick={() => applyPreset(p)}
                  >
                    {p.name} ({p.points > 0 ? `+${p.points}` : p.points})
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre de la Regla *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                placeholder="e.g. Cargo C-Level / Director"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Categoría</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-medium"
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(parseCategory(e.target.value))}
                >
                  <option value="DEMOGRAPHIC">DEMOGRAPHIC (Perfil / Cargo / Empresa)</option>
                  <option value="BEHAVIORAL">BEHAVIORAL (Acciones / Solicitudes)</option>
                  <option value="ENGAGEMENT">ENGAGEMENT (Interacciones / Respuestas)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Puntos (+ / -)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-bold"
                  value={newRulePoints}
                  onChange={(e) => setNewRulePoints(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Campo</label>
                <input
                  type="text"
                  className="w-full px-2 py-2 border rounded-md text-xs bg-background font-mono"
                  placeholder="contact.jobTitle"
                  value={newRuleField}
                  onChange={(e) => setNewRuleField(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Operador</label>
                <select
                  className="w-full px-2 py-2 border rounded-md text-xs bg-background font-medium"
                  value={newRuleOperator}
                  onChange={(e) => setNewRuleOperator(parseOperator(e.target.value))}
                >
                  <option value="CONTAINS">CONTAINS (Contiene)</option>
                  <option value="EQUALS">EQUALS (Igual)</option>
                  <option value="GREATER_THAN">GREATER_THAN (&gt;)</option>
                  <option value="LESS_THAN">LESS_THAN (&lt;)</option>
                  <option value="NOT_EQUALS">NOT_EQUALS (!=)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor</label>
                <input
                  type="text"
                  className="w-full px-2 py-2 border rounded-md text-xs bg-background"
                  placeholder="Director"
                  value={newRuleValue}
                  onChange={(e) => setNewRuleValue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRule} disabled={saving}>
                Guardar Regla
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
