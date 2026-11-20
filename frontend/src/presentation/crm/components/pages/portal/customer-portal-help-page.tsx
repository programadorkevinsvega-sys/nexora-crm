"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Search } from "lucide-react"
import type { KnowledgeBaseArticle, KnowledgeBaseCategory } from "@crm/contracts"
import { api } from "@/src/infrastructure/crm/api/api-client"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"

export function CustomerPortalHelpPage({ articleSlug }: { articleSlug?: string }) {
  const [categories, setCategories] = useState<KnowledgeBaseCategory[]>([])
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([])
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null)
  const [categoryId, setCategoryId] = useState("")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError("")
      try {
        if (articleSlug) {
          const value = await api.get<KnowledgeBaseArticle>(`/api/kb/articles/${encodeURIComponent(articleSlug)}`)
          if (active) setArticle(value)
        } else {
          const [categoryRows, articleRows] = await Promise.all([
            api.get<KnowledgeBaseCategory[]>("/api/kb/categories"),
            api.get<KnowledgeBaseArticle[]>("/api/kb/articles"),
          ])
          if (active) {
            setCategories(categoryRows)
            setArticles(articleRows)
          }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el centro de ayuda.")
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [articleSlug])

  const visibleArticles = articles.filter((item) => {
    const matchesCategory = !categoryId || item.categoryId === categoryId
    const text = `${item.title} ${item.summary || ""} ${item.tags.join(" ")}`.toLocaleLowerCase()
    return matchesCategory && text.includes(query.toLocaleLowerCase())
  })

  if (loading) return <div className="max-w-5xl mx-auto p-4 space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-48 w-full" /><Skeleton className="h-40 w-full" /></div>

  if (articleSlug) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-5 pb-12">
        <Link href="/portal/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Centro de ayuda</Link>
        {article ? (
          <Card className="p-6 md:p-8 space-y-4">
            <Badge variant="secondary">{article.categoryName || "General"}</Badge>
            <h1 className="text-2xl font-bold">{article.title}</h1>
            {article.summary && <p className="text-sm text-muted-foreground">{article.summary}</p>}
            <div className="border-t pt-5 text-sm leading-7 whitespace-pre-wrap">{article.contentMarkdown}</div>
            <p className="text-xs text-muted-foreground">Publicado por {article.authorName} · {new Date(article.createdAt).toLocaleDateString()}</p>
          </Card>
        ) : <Card className="p-8"><h1 className="font-semibold">Artículo no disponible</h1><p className="mt-2 text-sm text-muted-foreground">{error || "El artículo no existe o no está publicado para clientes."}</p></Card>}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-5 pb-12">
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Volver al portal</Link>
      <div className="space-y-2">
        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h1 className="text-2xl font-bold">Centro de ayuda</h1></div>
        <p className="text-sm text-muted-foreground">Guías y respuestas publicadas por el equipo de soporte.</p>
      </div>
      <Card className="p-3 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Buscar artículos..." />
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!categoryId ? "default" : "outline"} onClick={() => setCategoryId("")}>Todas</Button>
        {categories.map((category) => <Button key={category.id} size="sm" variant={categoryId === category.id ? "default" : "outline"} onClick={() => setCategoryId(category.id)}>{category.name}</Button>)}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {visibleArticles.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No se encontraron artículos públicos con esos criterios.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleArticles.map((item) => (
            <Link key={item.id} href={`/portal/help/${encodeURIComponent(item.slug)}`}>
              <Card className="h-full p-5 space-y-2 hover:border-primary transition-colors">
                <Badge variant="outline">{item.categoryName || "General"}</Badge>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.summary || item.contentMarkdown}</p>
                <span className="text-xs text-primary">Leer artículo →</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
