"use client"

import { useState, useRef } from "react"
import { Upload, FileText, FileImage, File, X, CheckCircle2, Loader2, Plus, FolderPlus } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { ApiKnowledgeBaseRepository } from "@/src/infrastructure/crm/repositories/knowledge-base/api-knowledge-base.repository"
import type { KnowledgeBaseCategory } from "@crm/contracts"

const ACCEPTED = ".pdf,.txt,.md,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp"

interface Props {
  open: boolean
  onClose: () => void
  categories: KnowledgeBaseCategory[]
  onSuccess: () => void
}

function fileIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.endsWith(".pdf")) return <File className="h-5 w-5 text-red-500" />
  if (lower.match(/\.(png|jpg|jpeg|webp|gif)$/)) return <FileImage className="h-5 w-5 text-green-500" />
  if (lower.match(/\.(doc|docx)$/)) return <FileText className="h-5 w-5 text-indigo-500" />
  return <FileText className="h-5 w-5 text-blue-500" />
}

export function KbFileUploadModal({ open, onClose, categories, onSuccess }: Props) {
  const [localCategories, setLocalCategories] = useState<KnowledgeBaseCategory[]>(categories)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const [showNewCatInput, setShowNewCatInput] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [creatingCat, setCreatingCat] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep localCategories synced with incoming props
  if (categories.length > 0 && localCategories.length === 0) {
    setLocalCategories(categories)
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    setCreatingCat(true)
    setError("")
    try {
      const created = await ApiKnowledgeBaseRepository.createCategory({
        name: newCatName.trim(),
        description: "Categoría creada al importar documentos",
      })
      setLocalCategories((prev) => [...prev, created])
      setCategoryId(created.id)
      setNewCatName("")
      setShowNewCatInput(false)
    } catch (err: any) {
      setError(err?.message || "Error al crear la categoría")
    } finally {
      setCreatingCat(false)
    }
  }

  const reset = () => {
    setFile(null); setTitle(""); setCategoryId(""); setUploading(false)
    setProgress(0); setSuccess(false); setError(""); setDragging(false)
    setShowNewCatInput(false); setNewCatName("")
  }

  const handleClose = () => { reset(); onClose() }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) { setFile(dropped); setError("") }
  }

  const handleSubmit = async () => {
    if (!file) { setError("Selecciona un archivo primero."); return }
    setUploading(true); setError("")
    const ticker = setInterval(() => setProgress((p) => Math.min(p + 12, 88)), 300)

    try {
      const fd = new FormData()
      fd.append("file", file)
      if (title) fd.append("title", title)
      if (categoryId) fd.append("categoryId", categoryId)

      const res = await fetch("/api/bff/kb/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "Error al subir el archivo")
      }
      clearInterval(ticker)
      setProgress(100); setSuccess(true)
      setTimeout(() => { onSuccess(); handleClose() }, 1800)
    } catch (err: any) {
      clearInterval(ticker)
      setError(err.message || "Error inesperado al subir.")
      setUploading(false); setProgress(0)
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="📤 Subir Documento a la Base de Conocimiento">
      <div className="space-y-4 min-w-[420px]">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60"}`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              {fileIcon(file.name)}
              <div className="text-left">
                <p className="font-medium text-sm truncate max-w-[280px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="ml-auto text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Arrastra un archivo o <span className="text-primary font-medium">haz clic para buscar</span></p>
              <p className="text-xs text-muted-foreground mt-1">PDF, TXT, MD, DOC, DOCX, PNG, JPG — máx. 20 MB</p>
            </>
          )}
          <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setError("") } }} />
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Título del artículo (opcional)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={file?.name.replace(/\.[^.]+$/, "") || "Nombre del documento..."} className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-muted-foreground">Categoría de la Base de Conocimiento</label>
            <button
              type="button"
              onClick={() => setShowNewCatInput(!showNewCatInput)}
              className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium"
            >
              <Plus className="h-3 w-3" /> {showNewCatInput ? "Elegir existente" : "+ Nueva Categoría"}
            </button>
          </div>

          {showNewCatInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ej: Manuales de Producto, Políticas..."
                className="flex-1 px-3 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory() } }}
              />
              <Button size="sm" type="button" onClick={handleCreateCategory} disabled={creatingCat || !newCatName.trim()} className="text-xs h-8 px-3">
                {creatingCat ? "Creando..." : "Crear"}
              </Button>
            </div>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Sin categoría (General)</option>
              {localCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  📁 {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Progress */}
        {uploading && (
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">{progress < 100 ? "Subiendo y extrayendo texto..." : "Indexando en el motor RAG..."}</p>
          </div>
        )}

        {success && <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2"><CheckCircle2 className="h-4 w-4" /> Documento indexado correctamente en la Base de Conocimiento RAG ✅</div>}
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">⚠️ {error}</div>}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={uploading}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit} disabled={uploading || !file}>
            {uploading ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Subiendo...</> : <><Upload className="h-3.5 w-3.5 mr-1.5" /> Subir & Indexar</>}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
