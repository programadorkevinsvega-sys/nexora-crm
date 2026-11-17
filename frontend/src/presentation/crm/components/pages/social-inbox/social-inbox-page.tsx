"use client"

import React, { useState, useEffect } from "react"
import { MessageSquare, Bot, Play, RefreshCw, Filter, Sparkles, Camera, Smartphone } from "lucide-react"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ApiSocialInboxRepository } from "@/src/infrastructure/crm/repositories/social-inbox/api-social-inbox.repository"
import { SocialCommentCard } from "./social-comment-card"
import { SocialAutoResponderRules } from "./social-auto-responder-rules"
import { SocialSimulateModal } from "./social-simulate-modal"
import type { SocialComment, SocialAutoResponderRule } from "@crm/contracts"

export function SocialInboxPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "rules">("feed")
  const [platformFilter, setPlatformFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [comments, setComments] = useState<SocialComment[]>([])
  const [rules, setRules] = useState<SocialAutoResponderRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showSimulate, setShowSimulate] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [commentsData, rulesData] = await Promise.all([
        ApiSocialInboxRepository.listComments(platformFilter, statusFilter),
        ApiSocialInboxRepository.listRules(),
      ])
      setComments(commentsData || [])
      setRules(rulesData || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [platformFilter, statusFilter])

  const handleReply = async (commentId: string, replyMessage: string) => {
    await ApiSocialInboxRepository.replyComment({ commentId, replyMessage })
    await fetchData()
  }

  const handleSaveRule = async (dto: Partial<SocialAutoResponderRule>) => {
    await ApiSocialInboxRepository.saveRule(dto)
    await fetchData()
  }

  const handleDeleteRule = async (id: string) => {
    await ApiSocialInboxRepository.deleteRule(id)
    await fetchData()
  }

  const handleSimulate = async (dto: any) => {
    const res = await ApiSocialInboxRepository.simulateComment(dto)
    await fetchData()
    return res
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Social Inbox & Community Management"
          description="Monitorea y responde comentarios de Facebook Ads, Instagram Reels y TikTok con bots inteligentes."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSimulate(true)}
            className="text-xs text-purple-400 border-purple-500/30 hover:bg-purple-500/10 gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Simular Comentario
          </Button>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition"
            title="Refrescar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main View Mode Selector */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === "feed"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Muro de Comentarios en Vivo ({comments.length})
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === "rules"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Bot className="h-4 w-4" />
          Reglas de Autorespuesta (Bot & IA) ({rules.length})
        </button>
      </div>

      {activeTab === "feed" ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Canal:
              </span>
              {(["ALL", "INSTAGRAM", "FACEBOOK", "TIKTOK"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    platformFilter === p ? "bg-muted text-foreground border" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "ALL" ? "Todos" : p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Estado:</span>
              {(["ALL", "PENDING", "BOT_REPLIED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    statusFilter === st ? "bg-muted text-foreground border" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "ALL" ? "Todos" : st === "PENDING" ? "Pendientes" : "Respondidos"}
                </button>
              ))}
            </div>
          </div>

          {/* Feed List */}
          {loading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <SocialCommentCard key={comment.id} comment={comment} onReply={handleReply} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hay comentarios en la bandeja social"
              description="Los comentarios de tus publicaciones y anuncios de Facebook, Instagram y TikTok aparecerán aquí."
            />
          )}
        </div>
      ) : (
        <SocialAutoResponderRules
          rules={rules}
          onSaveRule={handleSaveRule}
          onDeleteRule={handleDeleteRule}
        />
      )}

      {/* Simulator Modal */}
      <SocialSimulateModal
        open={showSimulate}
        onClose={() => setShowSimulate(false)}
        onSimulate={handleSimulate}
      />
    </div>
  )
}
