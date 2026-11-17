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
            variant="default"
            onClick={() => router.push("/forms/new")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Formulario
          </Button>
        }
      />

      {formList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No tienes formularios creados</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Crea tu primer formulario web para capturar clientes potenciales directo a la base de datos de tu CRM sin programar.
            </p>
          </div>
          <Button variant="default" onClick={() => router.push("/forms/new")} className="gap-2">
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
                className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-border/80 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {form.name}
                        </h4>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          /f/{form.slug}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      {form.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {form.title} — {form.description || "Sin descripción"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground/70 block">Campos</span>
                      <span className="font-semibold text-foreground">{fieldCount} campos</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground/70 block">Envíos (Leads)</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{form.submissionsCount || 0} recibidos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmbedForm(form)}
                    className="gap-1.5 text-xs"
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
