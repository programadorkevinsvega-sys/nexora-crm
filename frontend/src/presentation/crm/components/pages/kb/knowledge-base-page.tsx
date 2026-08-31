"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Folder,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Tag,
  Upload,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiKnowledgeBaseRepository } from "@/src/infrastructure/crm/repositories/knowledge-base/api-knowledge-base.repository"
import { KbFileUploadModal } from "./kb-file-upload-modal"
import type { KnowledgeBaseCategory, KnowledgeBaseArticle } from "@crm/contracts"

export function KnowledgeBasePage() {
  const [categories, setCategories] = useState<KnowledgeBaseCategory[]>([])
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  // Create article modal state
  const [showCreate, setShowCreate] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [summary, setSummary] = useState("")
  const [contentMarkdown, setContentMarkdown] = useState("")
  const [saving, setSaving] = useState(false)

  // Create category modal state
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatDescription, setNewCatDescription] = useState("")
  const [savingCategory, setSavingCategory] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [cats, arts] = await Promise.all([
        ApiKnowledgeBaseRepository.listCategories(),
        ApiKnowledgeBaseRepository.listArticles({
          categoryId: selectedCategory || undefined,
          query: searchQuery || undefined,
        }),
      ])
      setCategories(cats)
      setArticles(arts)
    } catch (err) {
      console.error("Failed to load knowledge base:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedCategory, searchQuery])

  const handleSelectArticle = async (art: KnowledgeBaseArticle) => {
    try {
      const full = await ApiKnowledgeBaseRepository.getArticle(art.id)
      setSelectedArticle(full)
    } catch (err) {
      setSelectedArticle(art)
    }
  }

  const handleVote = async (isHelpful: boolean) => {
    if (!selectedArticle) return
    try {
      const updated = await ApiKnowledgeBaseRepository.voteArticle(selectedArticle.id, isHelpful)
      setSelectedArticle(updated)
      fetchData()
    } catch (err) {
      console.error("Vote failed:", err)
    }
  }

  const handleCreateArticle = async () => {
    if (!title.trim() || !contentMarkdown.trim()) return
    try {
      setSaving(true)
      await ApiKnowledgeBaseRepository.createArticle({
        title: title.trim(),
        categoryId: categoryId || undefined,
        summary: summary.trim() || undefined,
        contentMarkdown: contentMarkdown.trim(),
        isPublished: true,
      })
      setShowCreate(false)
      setTitle("")
      setSummary("")
      setContentMarkdown("")
      fetchData()
    } catch (err: any) {
      alert(`Error al crear artículo: ${err?.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setSavingCategory(true)
    try {
      await ApiKnowledgeBaseRepository.createCategory({
        name: newCatName.trim(),
        description: newCatDescription.trim() || undefined,
      })
      setShowCreateCategory(false)
      setNewCatName("")
      setNewCatDescription("")
      fetchData()
    } catch (err: any) {
      alert(`Error al crear categoría: ${err?.message || err}`)
    } finally {
      setSavingCategory(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Base de Conocimiento (Help Center)
          </h1>
          <p className="text-xs text-muted-foreground">
            Artículos, manuales de usuario y guías de autoayuda para clientes y agentes de soporte.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-1.5" /> Subir Documento
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo Artículo
          </Button>
        </div>
      </div>

      {/* Upload modal */}
      <KbFileUploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        categories={categories}
        onSuccess={fetchData}
      />

      {/* Search Bar */}
      <Card className="p-4 border shadow-sm bg-muted/10">
        <div className="relative max-w-xl mx-auto">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por palabra clave, tema o problema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-md border bg-background"
          />
        </div>
      </Card>

      {/* Categories Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button
          size="sm"
          variant={selectedCategory === null ? "default" : "outline"}
          className="text-xs"
          onClick={() => setSelectedCategory(null)}
        >
          Todas las categorías
        </Button>
        {categories.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={selectedCategory === c.id ? "default" : "outline"}
            className="text-xs shrink-0"
            onClick={() => setSelectedCategory(c.id)}
          >
            <Folder className="h-3.5 w-3.5 mr-1" />
            {c.name} ({c.articlesCount})
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="text-xs border-dashed text-primary hover:bg-primary/5 shrink-0"
          onClick={() => setShowCreateCategory(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Nueva Categoría
        </Button>
      </div>

      {/* Articles Grid or Reader View */}
      {selectedArticle ? (
        <Card className="p-6 border shadow-sm space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a la lista de artículos
          </Button>

          <div className="border-b pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{selectedArticle.categoryName || "General"}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {selectedArticle.viewCount} vistas
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{selectedArticle.title}</h2>
            {selectedArticle.summary && <p className="text-xs text-muted-foreground">{selectedArticle.summary}</p>}
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
            {selectedArticle.contentMarkdown}
          </div>

          {/* Voting Box */}
          <div className="p-4 rounded-lg bg-muted/20 border flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">¿Te ha sido útil este artículo?</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleVote(true)}>
                <ThumbsUp className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Sí ({selectedArticle.helpfulVotes})
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleVote(false)}>
                <ThumbsDown className="h-3.5 w-3.5 mr-1 text-rose-600" /> No ({selectedArticle.unhelpfulVotes})
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
          ) : articles.length === 0 ? (
            <div className="col-span-3 p-12 text-center text-xs text-muted-foreground">
              No se encontraron artículos disponibles. Haz clic en "Nuevo Artículo" para redactar el primero.
            </div>
          ) : (
            articles.map((art) => (
              <Card
                key={art.id}
                onClick={() => handleSelectArticle(art)}
                className="p-4 border hover:border-primary cursor-pointer transition-colors space-y-2 group shadow-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{art.categoryName || "General"}</Badge>
                  <span className="flex items-center gap-1 font-mono"><Eye className="h-3 w-3" /> {art.viewCount}</span>
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {art.summary || art.contentMarkdown}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t">
                  <span>Por {art.authorName}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                    <ThumbsUp className="h-2.5 w-2.5" /> {art.helpfulVotes} útiles
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal: Create Article */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Redactar Nuevo Artículo de Soporte" size="lg">
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium mb-1">Título del Artículo *</label>
            <input
              type="text"
              placeholder="Ej: Cómo configurar tu dominio personalizado"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            >
              <option value="">General (Sin categoría)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Resumen Corto</label>
            <input
              type="text"
              placeholder="Breve descripción para los resultados de búsqueda..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Contenido (Markdown) *</label>
            <textarea
              rows={8}
              placeholder="Escribe el contenido de la guía paso a paso aquí..."
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleCreateArticle} disabled={saving || !title.trim() || !contentMarkdown.trim()}>
              {saving ? "Publicando..." : "Publicar Artículo"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        isOpen={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        title="📁 Crear Nueva Categoría"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 min-w-[380px]">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre de la Categoría *</label>
            <input
              type="text"
              required
              placeholder="Ej: Manuales de Producto, Políticas, Precios..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Descripción (opcional)</label>
            <textarea
              rows={2}
              placeholder="Breve descripción del propósito de esta categoría..."
              value={newCatDescription}
              onChange={(e) => setNewCatDescription(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateCategory(false)} disabled={savingCategory}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={savingCategory || !newCatName.trim()}>
              {savingCategory ? "Guardando..." : "Crear Categoría"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
