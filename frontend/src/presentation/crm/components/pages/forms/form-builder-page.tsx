"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Code, Check, Sparkles, Globe, Eye } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { useCreateWebForm, useUpdateWebForm, useWebForm } from "@/src/application/crm/di/hooks"
import type { FormField, WebForm } from "@crm/contracts"
import { FormBuilderPalette } from "./form-builder-palette"
import { FormBuilderPreview } from "./form-builder-preview"
import { FormBuilderSettings } from "./form-builder-settings"
import { FormBuilderEmbedModal } from "./form-builder-embed-modal"

export function FormBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined
  const isEditing = Boolean(id)

  const { data: existingForm, isLoading } = useWebForm(id || "")
  const { mutate: createForm, isPending: isCreating } = useCreateWebForm()
  const { mutate: updateForm, isPending: isUpdating } = useUpdateWebForm()

  const [name, setName] = useState("Formulario de Contacto Web")
  const [slug, setSlug] = useState("contacto-web")
  const [title, setTitle] = useState("Contáctanos")
  const [description, setDescription] = useState("Déjanos tus datos y un especialista se pondrá en contacto contigo.")
  const [fields, setFields] = useState<FormField[]>([
    { id: "f1", label: "Nombre Completo", type: "text", placeholder: "Ej. Juan Pérez", required: true, mappedContactField: "firstName", options: [] },
    { id: "f2", label: "Correo Electrónico Corporativo", type: "email", placeholder: "juan@empresa.com", required: true, mappedContactField: "email", options: [] },
    { id: "f3", label: "Teléfono / WhatsApp", type: "phone", placeholder: "+57 300 123 4567", required: false, mappedContactField: "phone", options: [] },
    { id: "f4", label: "Mensaje o Requerimiento", type: "textarea", placeholder: "Cuéntanos sobre tu proyecto...", required: false, mappedContactField: "notes", options: [] },
  ])
  const [buttonText, setButtonText] = useState("Enviar Solicitud")
  const [successMessage, setSuccessMessage] = useState("¡Gracias! Hemos recibido tu información y te contactaremos en breve.")
  const [redirectUrl, setRedirectUrl] = useState("")
  const [leadSource, setLeadSource] = useState("Formulario Web")
  const [defaultLeadStatus, setDefaultLeadStatus] = useState("NEW")
  const [primaryColor, setPrimaryColor] = useState("#06b6d4")
  const [backgroundColor, setBackgroundColor] = useState("#09090b")
  const [textColor, setTextColor] = useState("#f4f4f5")
  const [borderRadius, setBorderRadius] = useState("12px")
  const [showEmbedModal, setShowEmbedModal] = useState(false)

  useEffect(() => {
    if (existingForm) {
      setName(existingForm.name)
      setSlug(existingForm.slug)
      setTitle(existingForm.title)
      setDescription(existingForm.description || "")
      setFields((existingForm.fields as FormField[]) || [])
      setButtonText(existingForm.buttonText)
      setSuccessMessage(existingForm.successMessage)
      setRedirectUrl(existingForm.redirectUrl || "")
      setLeadSource(existingForm.leadSource)
      setDefaultLeadStatus(existingForm.defaultLeadStatus)
      setPrimaryColor(existingForm.primaryColor)
      setBackgroundColor(existingForm.backgroundColor)
      setTextColor(existingForm.textColor)
      setBorderRadius(existingForm.borderRadius)
    }
  }, [existingForm])

  const handleSave = () => {
    const payload = {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
      title,
      description: description || null,
      fields,
      buttonText,
      successMessage,
      redirectUrl: redirectUrl.trim().length > 0 ? redirectUrl : null,
      leadSource,
      defaultLeadStatus,
      primaryColor,
      backgroundColor,
      textColor,
      borderRadius,
    }

    if (isEditing && id) {
      updateForm({ id, data: payload })
    } else {
      createForm(payload, {
        onSuccess: (newForm) => {
          router.push(`/forms/${newForm.id}/edit`)
        },
      })
    }
  }

  const isSaving = isCreating || isUpdating

  return (
    <div className="space-y-4">
      {/* Top Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Volver
          </Button>
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base font-bold text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-cyan-500 px-1 focus:outline-none"
              placeholder="Nombre del formulario"
            />
            <p className="text-xs text-zinc-400 font-mono px-1">
              Slug: /f/{slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <Button variant="outline" size="sm" onClick={() => setShowEmbedModal(true)} className="gap-1.5 text-xs">
              <Code className="h-3.5 w-3.5 text-purple-400" />
              Obtener Código Embebible
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs h-8">
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Guardando..." : "Guardar Formulario"}
          </Button>
        </div>
      </div>

      {/* 3-Column Studio: Palette | Live Canvas Preview | Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Fields Palette */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-md space-y-4">
          <FormBuilderPalette onAddField={(field) => setFields((f) => [...f, field])} />
        </div>

        {/* Center: Live Real-Time Interactive Canvas */}
        <div className="lg:col-span-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 min-h-[550px] shadow-inner flex flex-col justify-start">
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-zinc-800/80 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="h-3.5 w-3.5 text-cyan-400" />
              Vista Previa en Vivo (WYSIWYG)
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Auto-renderizado en tiempo real</span>
          </div>
          <FormBuilderPreview
            title={title}
            description={description}
            fields={fields}
            buttonText={buttonText}
            primaryColor={primaryColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderRadius={borderRadius}
            onRemoveField={(idx) => setFields((f) => f.filter((_, i) => i !== idx))}
            onToggleRequired={(idx) => setFields((f) => f.map((item, i) => i === idx ? { ...item, required: !item.required } : item))}
            onMoveField={(idx, dir) => {
              const targetIdx = dir === "up" ? idx - 1 : idx + 1
              if (targetIdx < 0 || targetIdx >= fields.length) return
              const newFields = [...fields]
              const temp = newFields[idx]
              newFields[idx] = newFields[targetIdx]
              newFields[targetIdx] = temp
              setFields(newFields)
            }}
            onUpdateFieldLabel={(idx, label) => setFields((f) => f.map((item, i) => i === idx ? { ...item, label } : item))}
          />
        </div>

        {/* Right: Customization & Leads Settings */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-md space-y-4">
          <FormBuilderSettings
            leadSource={leadSource}
            defaultLeadStatus={defaultLeadStatus}
            successMessage={successMessage}
            redirectUrl={redirectUrl}
            primaryColor={primaryColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderRadius={borderRadius}
            onUpdate={(key, val) => {
              if (key === "leadSource") setLeadSource(val)
              if (key === "defaultLeadStatus") setDefaultLeadStatus(val)
              if (key === "successMessage") setSuccessMessage(val)
              if (key === "redirectUrl") setRedirectUrl(val)
              if (key === "primaryColor") setPrimaryColor(val)
              if (key === "backgroundColor") setBackgroundColor(val)
              if (key === "textColor") setTextColor(val)
              if (key === "borderRadius") setBorderRadius(val)
            }}
          />
        </div>
      </div>

      {/* Embed Code Modal */}
      {showEmbedModal && existingForm && (
        <FormBuilderEmbedModal form={existingForm} onClose={() => setShowEmbedModal(false)} />
      )}
    </div>
  )
}
export default FormBuilderPage
