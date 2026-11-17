"use client"

import React, { useState } from "react"
import { Trash2, ArrowUp, ArrowDown, Plus, X, ListPlus } from "lucide-react"
import type { FormField } from "@crm/contracts"

interface FormBuilderPreviewProps {
  title: string
  description?: string | null
  fields: FormField[]
  buttonText: string
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderRadius: string
  onRemoveField: (index: number) => void
  onToggleRequired: (index: number) => void
  onMoveField: (index: number, direction: "up" | "down") => void
  onUpdateFieldLabel: (index: number, newLabel: string) => void
  onUpdateFieldOptions: (index: number, options: string[]) => void
}

export function FormBuilderPreview({
  title,
  description,
  fields,
  buttonText,
  primaryColor,
  backgroundColor,
  textColor,
  borderRadius,
  onRemoveField,
  onToggleRequired,
  onMoveField,
  onUpdateFieldLabel,
  onUpdateFieldOptions,
}: FormBuilderPreviewProps) {
  const [activeSelectIndex, setActiveSelectIndex] = useState<number | null>(null)
  const [newOptionText, setNewOptionText] = useState("")

  const handleAddOption = (idx: number) => {
    if (!newOptionText.trim()) return
    const currentOptions = fields[idx]?.options || []
    onUpdateFieldOptions(idx, [...currentOptions, newOptionText.trim()])
    setNewOptionText("")
  }

  const handleRemoveOption = (fieldIdx: number, optIdx: number) => {
    const currentOptions = fields[fieldIdx]?.options || []
    onUpdateFieldOptions(fieldIdx, currentOptions.filter((_, i) => i !== optIdx))
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Live Form Mockup Card */}
      <div
        className="w-full max-w-lg border border-zinc-800/80 p-6 md:p-8 shadow-2xl transition-all duration-200"
        style={{
          backgroundColor: backgroundColor || "#09090b",
          color: textColor || "#f4f4f5",
          borderRadius: borderRadius || "12px",
        }}
      >
        {/* Form Title & Description */}
        <div className="mb-6 text-center space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: textColor || "#f4f4f5" }}>
            {title || "Contáctanos"}
          </h2>
          {description && (
            <p className="text-xs opacity-75 max-w-md mx-auto" style={{ color: textColor || "#f4f4f5" }}>
              {description}
            </p>
          )}
        </div>

        {/* Form Fields List */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-zinc-700/50 rounded-xl text-xs text-zinc-400">
              No has añadido campos todavía. Haz clic en los campos de la izquierda para agregarlos.
            </div>
          ) : (
            fields.map((field, idx) => (
              <div key={field.id} className="group relative rounded-xl p-2.5 hover:bg-zinc-800/40 border border-transparent hover:border-zinc-700/50 transition">
                {/* Field Header: Label and Inline Controls */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => onUpdateFieldLabel(idx, e.target.value)}
                      style={{ color: textColor || "#f4f4f5" }}
                      className="bg-transparent border-b border-transparent hover:border-zinc-600 focus:border-cyan-500 text-xs font-semibold px-1 py-0.5 focus:outline-none"
                    />
                    {field.required && (
                      <span className="text-rose-400 text-xs font-bold" title="Requerido">*</span>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
                    {field.type === "select" && (
                      <button
                        type="button"
                        onClick={() => setActiveSelectIndex(activeSelectIndex === idx ? null : idx)}
                        className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-cyan-700 text-cyan-300 bg-cyan-950/40 flex items-center gap-1"
                      >
                        <ListPlus className="h-3 w-3" />
                        Opciones
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleRequired(idx)}
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition ${
                        field.required ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {field.required ? "Obligatorio" : "Opcional"}
                    </button>
                    {idx > 0 && (
                      <button type="button" onClick={() => onMoveField(idx, "up")} className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700">
                        <ArrowUp className="h-3 w-3" />
                      </button>
                    )}
                    {idx < fields.length - 1 && (
                      <button type="button" onClick={() => onMoveField(idx, "down")} className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700">
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    )}
                    <button type="button" onClick={() => onRemoveField(idx)} className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/30">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Field Input Mock */}
                {field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder || "Escribe aquí..."}
                    style={{ borderRadius: borderRadius || "12px", color: textColor || "#f4f4f5" }}
                    className="w-full border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs focus:outline-none resize-none opacity-90"
                    disabled
                  />
                ) : field.type === "select" ? (
                  <div className="space-y-2">
                    <select
                      style={{ borderRadius: borderRadius || "12px", color: textColor || "#f4f4f5" }}
                      className="w-full border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs focus:outline-none opacity-90"
                      disabled
                    >
                      <option>{field.placeholder || "Selecciona una opción"}</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>

                    {/* Options Inline Editor */}
                    {activeSelectIndex === idx && (
                      <div className="p-2.5 rounded-xl border border-cyan-500/40 bg-zinc-900/95 space-y-2 text-xs shadow-lg">
                        <div className="font-semibold text-cyan-300 text-[11px]">Editar Opciones del Menú:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(field.options || []).map((opt, optIdx) => (
                            <span key={optIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-200">
                              {opt}
                              <button type="button" onClick={() => handleRemoveOption(idx, optIdx)} className="text-zinc-400 hover:text-rose-400">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="Nueva opción (ej. Plan Pro)..."
                            value={newOptionText}
                            onChange={(e) => setNewOptionText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOption(idx) } }}
                            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddOption(idx)}
                            className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder || "Escribe aquí..."}
                    style={{ borderRadius: borderRadius || "12px", color: textColor || "#f4f4f5" }}
                    className="w-full border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs focus:outline-none opacity-90"
                    disabled
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Submit Button Preview */}
        {fields.length > 0 && (
          <div className="mt-6">
            <button
              type="button"
              className="w-full font-semibold py-2.5 text-xs text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]"
              style={{
                backgroundColor: primaryColor || "#06b6d4",
                borderRadius: borderRadius || "12px",
              }}
            >
              {buttonText || "Enviar Solicitud"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
