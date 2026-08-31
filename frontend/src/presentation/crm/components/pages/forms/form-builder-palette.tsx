"use client"

import React from "react"
import {
  User, Mail, Phone, Building, Briefcase, MapPin,
  MessageSquare, ListPlus, Hash, Plus, Sparkles
} from "lucide-react"
import type { FormField } from "@crm/contracts"

interface FormBuilderPaletteProps {
  onAddField: (field: FormField) => void
}

export function FormBuilderPalette({ onAddField }: FormBuilderPaletteProps) {
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
      label: "Número / Presupuesto",
      icon: Hash,
      field: { id: "field_budget", label: "Presupuesto Estimado (USD)", type: "number", placeholder: "Ej. 5000", required: false, mappedContactField: "custom", options: [] },
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Campos Disponibles</h3>
      </div>
      <p className="text-xs text-zinc-400">Haz clic en un campo para agregarlo a tu formulario:</p>

      <div className="space-y-1.5">
        {PRESET_FIELDS.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onAddField({ ...item.field, id: `field_${Date.now()}_${idx}` })}
              className="flex w-full items-center justify-between p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-cyan-500/30 text-zinc-200 text-xs transition group shadow-sm"
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
