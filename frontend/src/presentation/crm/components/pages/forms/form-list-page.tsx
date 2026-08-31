"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText, Plus, Code, ExternalLink, Pencil, Trash2,
  Globe, Eye, Users, Layers, CheckCircle2
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { useWebFormsList, useDeleteWebForm } from "@/src/application/crm/di/hooks"
import type { WebForm } from "@crm/contracts"
import { FormBuilderEmbedModal } from "./form-builder-embed-modal"

export function FormListPage() {
  const router = useRouter()
  const { data: forms, isLoading, refetch } = useWebFormsList()
  const { mutate: deleteForm } = useDeleteWebForm()

  const [selectedEmbedForm, setSelectedEmbedForm] = useState<WebForm | null>(null)
  const [deletingForm, setDeletingForm] = useState<WebForm | null>(null)

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />

  const formList = Array.isArray(forms) ? forms : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formularios Web & Captura de Leads"
        description="Crea formularios personalizados e intégralos en WordPress, Shopify, Wix o Landing Pages mediante Iframe o Script."
        breadcrumb={[
          { label: "Marketing & Leads", href: "/campaigns" },
          { label: "Formularios Web" },
        ]}
        actions={
          <Button
            onClick={() => router.push("/forms/new")}
            className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            Crear Formulario
          </Button>
        }
      />

      {formList.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-100">No tienes formularios creados</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Crea tu primer formulario web para capturar clientes potenciales directo a la base de datos de tu CRM sin programar.
            </p>
          </div>
          <Button onClick={() => router.push("/forms/new")} className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white">
            <Plus className="h-4 w-4" />
            Crear Primer Formulario
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {formList.map((form) => {
            const fieldCount = Array.isArray(form.fields) ? form.fields.length : 0
            return (
              <div
                key={form.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300 transition">
                          {form.name}
                        </h4>
                        <span className="text-[11px] font-mono text-zinc-400">
                          /f/{form.slug}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {form.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2">
                    {form.title} — {form.description || "Sin descripción"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Campos</span>
                      <span className="font-semibold text-zinc-200">{fieldCount} campos</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 block">Envíos (Leads)</span>
                      <span className="font-semibold text-cyan-400">{form.submissionsCount || 0} recibidos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmbedForm(form)}
                    className="gap-1.5 text-xs text-purple-300 hover:text-purple-200 border-purple-800/40 hover:bg-purple-950/30"
                  >
                    <Code className="h-3.5 w-3.5" />
                    Embeber
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/f/${form.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition"
                      title="Probar en Vivo"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => router.push(`/forms/${form.id}/edit`)}
                      className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition"
                      title="Editar Formulario"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingForm(form)}
                      className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition"
                      title="Eliminar Formulario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Embed Code Modal */}
      {selectedEmbedForm && (
        <FormBuilderEmbedModal form={selectedEmbedForm} onClose={() => setSelectedEmbedForm(null)} />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deletingForm)}
        title="Eliminar formulario"
        message={`¿Estás seguro de que deseas eliminar el formulario "${deletingForm?.name}"?`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deletingForm) {
            deleteForm(deletingForm.id, {
              onSuccess: () => {
                setDeletingForm(null)
                refetch()
              },
            })
          }
        }}
        onCancel={() => setDeletingForm(null)}
      />
    </div>
  )
}
export default FormListPage
