"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react"
import { usePublicWebForm } from "@/src/application/crm/di/hooks"
import { ApiWebFormsRepository } from "@/src/infrastructure/crm/repositories/web-forms/api-web-forms.repository"
import type { FormField } from "@crm/contracts"

export default function EmbedFormPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: form, isLoading, isError } = usePublicWebForm(id)

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center bg-transparent">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (isError || !form) {
    return (
      <div className="p-4 text-center text-xs text-rose-400">
        Formulario no disponible
      </div>
    )
  }

  const fields = (form.fields as FormField[]) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await ApiWebFormsRepository.submitPublic(form.id, formData)
      if (res.success) {
        setSubmitted(true)
        if (res.redirectUrl) {
          setTimeout(() => {
            window.top ? (window.top.location.href = res.redirectUrl!) : (window.location.href = res.redirectUrl!)
          }, 1200)
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al enviar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="p-5 w-full mx-auto"
      style={{
        backgroundColor: form.backgroundColor || "transparent",
        color: form.textColor || "#f4f4f5",
        borderRadius: form.borderRadius || "12px",
      }}
    >
      {submitted ? (
        <div className="text-center py-6 space-y-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold">{form.successMessage || "¡Información enviada con éxito!"}</h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="text-center space-y-0.5 mb-3">
            <h2 className="text-base font-bold" style={{ color: form.textColor }}>
              {form.title}
            </h2>
            {form.description && <p className="text-[11px] opacity-75">{form.description}</p>}
          </div>

          {errorMessage && (
            <div className="p-2 rounded bg-rose-500/10 text-rose-300 text-[11px]">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2.5">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-[11px] font-semibold">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    required={field.required}
                    rows={3}
                    placeholder={field.placeholder || ""}
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none"
                  />
                ) : field.type === "select" ? (
                  <select
                    required={field.required}
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                  >
                    <option value="">{field.placeholder || "Seleccionar..."}</option>
                    {(field.options || []).map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                    required={field.required}
                    placeholder={field.placeholder || ""}
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-semibold py-2 text-xs text-white shadow transition hover:brightness-110 disabled:opacity-50"
            style={{
              backgroundColor: form.primaryColor || "#06b6d4",
              borderRadius: form.borderRadius || "8px",
            }}
          >
            {submitting ? "Enviando..." : form.buttonText || "Enviar"}
          </button>
        </form>
      )}
    </div>
  )
}
