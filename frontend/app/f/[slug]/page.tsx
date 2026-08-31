"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react"
import { usePublicWebForm } from "@/src/application/crm/di/hooks"
import { ApiWebFormsRepository } from "@/src/infrastructure/crm/repositories/web-forms/api-web-forms.repository"
import type { FormField } from "@crm/contracts"

export default function PublicFormPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { data: form, isLoading, isError } = usePublicWebForm(slug)

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          Cargando formulario...
        </div>
      </div>
    )
  }

  if (isError || !form) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-100">Formulario no disponible</h2>
          <p className="text-xs text-zinc-400">El formulario que buscas no existe o ha sido desactivado.</p>
        </div>
      </div>
    )
  }

  const fields = (form.fields as FormField[]) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await ApiWebFormsRepository.submitPublic(form.slug || form.id, formData)
      if (res.success) {
        setSubmitted(true)
        if (res.redirectUrl) {
          setTimeout(() => {
            window.location.href = res.redirectUrl!
          }, 1500)
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocurrió un error al enviar el formulario. Intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 md:p-8">
      <div
        className="w-full max-w-lg border border-zinc-800/80 p-6 md:p-8 shadow-2xl transition-all"
        style={{
          backgroundColor: form.backgroundColor || "#09090b",
          color: form.textColor || "#f4f4f5",
          borderRadius: form.borderRadius || "12px",
        }}
      >
        {submitted ? (
          <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold" style={{ color: form.textColor }}>
                ¡Mensaje Enviado!
              </h3>
              <p className="text-xs opacity-80 max-w-sm mx-auto">
                {form.successMessage || "Hemos recibido tu información con éxito."}
              </p>
            </div>
            {form.redirectUrl && (
              <p className="text-[11px] text-cyan-400 animate-pulse">
                Redirigiendo a la página de destino...
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title & Description */}
            <div className="text-center space-y-1.5 mb-6">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: form.textColor }}>
                {form.title || "Contáctanos"}
              </h1>
              {form.description && (
                <p className="text-xs opacity-75 max-w-md mx-auto">
                  {form.description}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Fields */}
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold">
                    {field.label}
                    {field.required && <span className="text-rose-400 ml-1">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      rows={4}
                      placeholder={field.placeholder || ""}
                      value={formData[field.id] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                    />
                  ) : field.type === "select" ? (
                    <select
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    >
                      <option value="">{field.placeholder || "Selecciona una opción"}</option>
                      {(field.options || []).map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                      required={field.required}
                      placeholder={field.placeholder || ""}
                      value={formData[field.id] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 font-semibold py-3 text-xs text-white shadow-xl transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                style={{
                  backgroundColor: form.primaryColor || "#06b6d4",
                  borderRadius: form.borderRadius || "12px",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando información...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{form.buttonText || "Enviar Solicitud"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
