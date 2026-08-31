"use client"

import React from "react"
import { Trash2, ArrowUp, ArrowDown, Asterisk } from "lucide-react"
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
}: FormBuilderPreviewProps) {
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
          <h2 className="text-xl font-bold tracking-tight" style={{ color: textColor }}>
            {title || "Contáctanos"}
          </h2>
          {description && (
            <p className="text-xs opacity-75 max-w-md mx-auto">
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
              <div key={field.id} className="group relative rounded-xl p-2.5 hover:bg-zinc-800/30 border border-transparent hover:border-zinc-700/40 transition">
                {/* Field Header: Label and Inline Controls */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => onUpdateFieldLabel(idx, e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-zinc-600 focus:border-cyan-500 text-xs font-semibold text-zinc-200 px-1 py-0.5 focus:outline-none"
                    />
                    {field.required && (
                      <span className="text-rose-400 text-xs font-bold" title="Requerido">*</span>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
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
                      <button
                        type="button"
                        onClick={() => onMoveField(idx, "up")}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                        title="Mover arriba"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                    )}
                    {idx < fields.length - 1 && (
                      <button
                        type="button"
                        onClick={() => onMoveField(idx, "down")}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                        title="Mover abajo"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveField(idx)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                      title="Eliminar campo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Field Input Mock */}
                {field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder || "Escribe aquí..."}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 focus:outline-none resize-none"
                    disabled
                  />
                ) : field.type === "select" ? (
                  <select
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                    disabled
                  >
                    <option>{field.placeholder || "Selecciona una opción"}</option>
                    {(field.options || []).map((opt, i) => (
                      <option key={i}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder || "Escribe aquí..."}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
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
