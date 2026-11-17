"use client"

import React, { useState } from "react"
import {
  User, Mail, Phone, Building, Briefcase, MapPin,
  MessageSquare, ListPlus, Hash, Plus, Sparkles, Sliders, Check
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import type { FormField } from "@crm/contracts"

interface FormBuilderPaletteProps {
  onAddField: (field: FormField) => void
}

export function FormBuilderPalette({ onAddField }: FormBuilderPaletteProps) {
  const [showCustomCreator, setShowCustomCreator] = useState(false)
  const [customLabel, setCustomLabel] = useState("")
  const [customType, setCustomType] = useState<FormField["type"]>("text")
  const [customPlaceholder, setCustomPlaceholder] = useState("")
  const [customRequired, setCustomRequired] = useState(false)
  const [customOptions, setCustomOptions] = useState("Opción 1, Opción 2, Opción 3")

  const PRESET_FIELDS: Array<{
    label: string
    icon: React.ElementType
    field: FormField
  }> = [
    {
      label: "Nombre",
      icon: User,
      field: { id: "field_firstName", label: "Nombre", type: "text", placeholder: "Ej. Juan", required: true, mappedContactField: "firstName", options: [] },
    },
    {
      label: "Apellido",
      icon: User,
      field: { id: "field_lastName", label: "Apellido", type: "text", placeholder: "Ej. Pérez", required: false, mappedContactField: "lastName", options: [] },
    },
    {
      label: "Correo Electrónico",
      icon: Mail,
      field: { id: "field_email", label: "Correo Electrónico", type: "email", placeholder: "juan@empresa.com", required: true, mappedContactField: "email", options: [] },
    },
    {
      label: "Teléfono / WhatsApp",
      icon: Phone,
      field: { id: "field_phone", label: "Teléfono / WhatsApp", type: "phone", placeholder: "+57 300 123 4567", required: false, mappedContactField: "phone", options: [] },
    },
    {
      label: "Nombre de Empresa",
      icon: Building,
      field: { id: "field_company", label: "Empresa", type: "text", placeholder: "Ej. Acme Corp", required: false, mappedContactField: "companyName", options: [] },
    },
    {
      label: "Cargo o Puesto",
      icon: Briefcase,
      field: { id: "field_jobTitle", label: "Cargo", type: "text", placeholder: "Ej. Director de TI", required: false, mappedContactField: "jobTitle", options: [] },
    },
    {
      label: "Ciudad / Ubicación",
      icon: MapPin,
      field: { id: "field_city", label: "Ciudad", type: "text", placeholder: "Ej. Bogotá", required: false, mappedContactField: "city", options: [] },
    },
    {
      label: "Mensaje o Consulta",
      icon: MessageSquare,
      field: { id: "field_message", label: "¿En qué podemos ayudarte?", type: "textarea", placeholder: "Escribe tu consulta...", required: false, mappedContactField: "notes", options: [] },
    },
    {
      label: "Menú Desplegable",
      icon: ListPlus,
      field: { id: "field_service", label: "Servicio de Interés", type: "select", placeholder: "Selecciona una opción", required: false, mappedContactField: "custom", options: ["Plan Enterprise", "AI Copilot Suite", "Consultoría Personalizada"] },
    },
    {
      label: "Presupuesto / Número",
      icon: Hash,
      field: { id: "field_budget", label: "Presupuesto Estimado (USD)", type: "number", placeholder: "Ej. 5000", required: false, mappedContactField: "custom", options: [] },
    },
  ]

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customLabel.trim()) return

    const parsedOptions = customType === "select"
      ? customOptions.split(",").map((s) => s.trim()).filter(Boolean)
      : []

    const newCustomField: FormField = {
      id: `custom_${Date.now()}`,
      label: customLabel.trim(),
      type: customType,
      placeholder: customPlaceholder.trim() || "",
      required: customRequired,
      mappedContactField: "custom",
      options: parsedOptions,
    }

    onAddField(newCustomField)
    setCustomLabel("")
    setCustomPlaceholder("")
    setShowCustomCreator(false)
  }

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h3 className="font-semibold uppercase tracking-wider text-zinc-300">Campos del Formulario</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomCreator(!showCustomCreator)}
          className="text-[11px] gap-1 h-6 px-2 text-cyan-300 border-cyan-800/40 hover:bg-cyan-950/40"
        >
          <Sliders className="h-3 w-3" />
          {showCustomCreator ? "Cerrar" : "+ Crear Campo Propio"}
        </Button>
      </div>

      {/* Custom Field Creator Form */}
      {showCustomCreator && (
        <form onSubmit={handleCreateCustom} className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2.5 animate-in fade-in">
          <div className="font-semibold text-cyan-200 text-xs">Diseña tu Campo Personalizado:</div>
          <div>
            <label className="block text-[11px] text-zinc-300 mb-1">Nombre / Etiqueta *</label>
            <input
              type="text"
              required
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Ej. Nivel de Urgencia, Sector, etc."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-zinc-300 mb-1">Tipo de Campo</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-100 text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="text">Texto Corto</option>
                <option value="textarea">Texto Largo / Área</option>
                <option value="email">Email</option>
                <option value="phone">Teléfono</option>
                <option value="number">Número</option>
                <option value="select">Menú Desplegable</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-300 mb-1">Texto Guía (Placeholder)</label>
              <input
                type="text"
                value={customPlaceholder}
                onChange={(e) => setCustomPlaceholder(e.target.value)}
                placeholder="Ej. Selecciona..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-100 text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {customType === "select" && (
            <div>
              <label className="block text-[11px] text-zinc-300 mb-1">Opciones (separadas por comas)</label>
              <input
                type="text"
                value={customOptions}
                onChange={(e) => setCustomOptions(e.target.value)}
                placeholder="Opción 1, Opción 2, Opción 3"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-zinc-100 text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-300">
              <input
                type="checkbox"
                checked={customRequired}
                onChange={(e) => setCustomRequired(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-cyan-500"
              />
              <span>¿Es obligatorio?</span>
            </label>
            <Button type="submit" size="sm" className="h-6 px-2.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white">
              <Plus className="h-3 w-3 mr-1" /> Añadir
            </Button>
          </div>
        </form>
      )}

      {/* Preset Standard Fields */}
      <p className="text-[11px] text-zinc-400">Haz clic en un campo predefinido para agregarlo:</p>
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {PRESET_FIELDS.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onAddField({ ...item.field, id: `field_${Date.now()}_${idx}` })}
              className="flex w-full items-center justify-between p-2 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-cyan-500/30 text-zinc-200 text-xs transition group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-cyan-400 transition">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <Plus className="h-3.5 w-3.5 text-zinc-500 group-hover:text-cyan-400 transition" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
