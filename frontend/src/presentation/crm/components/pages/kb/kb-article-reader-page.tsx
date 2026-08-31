"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Eye,
  CheckCircle2,
  Tag,
  Share2,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiKnowledgeBaseRepository } from "@/src/infrastructure/crm/repositories/knowledge-base/api-knowledge-base.repository"
import type { KnowledgeBaseArticle } from "@crm/contracts"

interface Props {
  articleId: string
}

export function KbArticleReaderPage({ articleId }: Props) {
  const router = useRouter()
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState<boolean | null>(null)
  const [voting, setVoting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await ApiKnowledgeBaseRepository.getArticle(articleId)
        setArticle(data)
      } catch (err) {
        console.error("Failed to load article:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [articleId])

  const handleVote = async (isHelpful: boolean) => {
    if (!article || voted !== null) return
    try {
      setVoting(true)
      const updated = await ApiKnowledgeBaseRepository.voteArticle(article.id, isHelpful)
      setArticle(updated)
      setVoted(isHelpful)
    } catch (err) {
      console.error("Vote failed:", err)
    } finally {
      setVoting(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <h2 className="text-lg font-bold text-foreground">Artículo no encontrado</h2>
        <p className="text-xs text-muted-foreground">El artículo que buscas no existe o ha sido despublicado.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/kb")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a Knowledge Base
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/kb")} className="text-xs">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Knowledge Base
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink} className="text-xs">
          <Share2 className="h-3.5 w-3.5 mr-1.5" /> {copied ? "¡Enlace Copiado!" : "Compartir"}
        </Button>
      </div>

      {/* Article Header */}
      <Card className="p-6 md:p-8 border shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[11px]">
            <Tag className="h-3 w-3 mr-1" /> {article.categoryName || "General"}
          </Badge>
          {article.isPublic ? (
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
              Público en Portal
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
              Interno
            </Badge>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-b pb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {new Date(article.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {article.viewCount} lecturas
          </span>
        </div>

        {/* Article Body */}
        <div className="prose prose-sm dark:prose-invert max-w-none py-4 text-foreground/90 whitespace-pre-line leading-relaxed text-sm">
          {article.content}
        </div>

        {/* Feedback Section */}
        <div className="border-t pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-foreground">¿Te ha resultado útil este artículo?</p>
            <p className="text-[11px] text-muted-foreground">Tu opinión ayuda a mejorar la documentación del equipo.</p>
          </div>

          {voted !== null ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> ¡Gracias por tu voto!
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs hover:text-emerald-600"
                disabled={voting}
                onClick={() => handleVote(true)}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Sí ({article.helpfulVotes || 0})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs hover:text-rose-600"
                disabled={voting}
                onClick={() => handleVote(false)}
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1 text-rose-600" /> No ({article.notHelpfulVotes || 0})
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
