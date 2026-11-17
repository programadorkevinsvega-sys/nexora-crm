"use client"

import React, { useState } from "react"
import { Settings, Palette, Target, CheckCircle2 } from "lucide-react"

interface FormBuilderSettingsProps {
  leadSource: string
  defaultLeadStatus: string
  successMessage: string
  redirectUrl: string
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderRadius: string
  onUpdate: (key: string, value: any) => void
}

export function FormBuilderSettings({
  leadSource,
  defaultLeadStatus,
  successMessage,
  redirectUrl,
  primaryColor,
  backgroundColor,
  textColor,
  borderRadius,
  onUpdate,
}: FormBuilderSettingsProps) {
  const [activeTab, setActiveTab] = useState<"leads" | "style">("leads")

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === "leads"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Captura de Leads</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === "style"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Estilos & Diseño</span>
        </button>
      </div>

      {activeTab === "leads" && (
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Fuente del Lead (Lead Source)</label>
            <input
              type="text"
              value={leadSource}
              onChange={(e) => onUpdate("leadSource", e.target.value)}
              placeholder="Ej. Facebook Ads, Landing Page"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Estado Inicial del Lead</label>
            <select
              value={defaultLeadStatus}
              onChange={(e) => onUpdate("defaultLeadStatus", e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="NEW">Nuevo (NEW)</option>
              <option value="CONTACTED">Contactado (CONTACTED)</option>
              <option value="QUALIFIED">Calificado (QUALIFIED)</option>
              <option value="CUSTOMER">Cliente (CUSTOMER)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Mensaje de Éxito al Enviar</label>
            <textarea
              rows={2}
              value={successMessage}
              onChange={(e) => onUpdate("successMessage", e.target.value)}
              placeholder="¡Gracias! Hemos recibido tu mensaje."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">URL de Redirección (Opcional)</label>
            <input
              type="url"
              value={redirectUrl}
              onChange={(e) => onUpdate("redirectUrl", e.target.value)}
              placeholder="https://tuempresa.com/gracias"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {activeTab === "style" && (
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Color del Botón Principal</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => onUpdate("primaryColor", e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-lg border border-zinc-700 bg-transparent p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => onUpdate("primaryColor", e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Color de Fondo del Formulario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onUpdate("backgroundColor", e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-lg border border-zinc-700 bg-transparent p-0.5"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => onUpdate("backgroundColor", e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Color del Texto</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onUpdate("textColor", e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-lg border border-zinc-700 bg-transparent p-0.5"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => onUpdate("textColor", e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Radio de Bordes</label>
            <select
              value={borderRadius}
              onChange={(e) => onUpdate("borderRadius", e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="0px">Cuadrado (0px)</option>
              <option value="8px">Ligero (8px)</option>
              <option value="12px">Estándar (12px)</option>
              <option value="20px">Redondeado (20px)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
