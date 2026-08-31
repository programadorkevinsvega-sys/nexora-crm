"use client"

import React, { useState } from "react"
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  Camera,
  Smartphone,
} from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { SocialComment } from "@crm/contracts"

interface SocialCommentCardProps {
  comment: SocialComment
  onReply: (commentId: string, replyMessage: string) => Promise<void>
}

export function SocialCommentCard({ comment, onReply }: SocialCommentCardProps) {
  const [replyText, setReplyText] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [showReplyBox, setShowReplyBox] = useState(false)

  const getPlatformIcon = () => {
    switch (comment.platform) {
      case "INSTAGRAM":
        return <Camera className="h-4 w-4 text-pink-400" />
      case "TIKTOK":
        return <Smartphone className="h-4 w-4 text-rose-400" />
      case "FACEBOOK":
      default:
        return <MessageSquare className="h-4 w-4 text-blue-400" />
    }
  }

  const getPlatformBg = () => {
    switch (comment.platform) {
      case "INSTAGRAM": return "bg-pink-500/10 text-pink-400 border-pink-500/20"
      case "TIKTOK": return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      case "FACEBOOK": default: return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setIsReplying(true)
    try {
      await onReply(comment.id, replyText.trim())
      setReplyText("")
      setShowReplyBox(false)
    } finally {
      setIsReplying(false)
    }
  }

  const handleAiSuggest = () => {
    const suggestions = [
      `¡Hola ${comment.authorName}! 🚀 Muchas gracias por tu interés. Te hemos enviado la información y precios por mensaje privado.`,
      `¡Hola ${comment.authorName}! ✨ Con gusto podemos ayudarte. Revisa tu buzón de mensajes directos para coordinar una demo.`,
      `¡Hola ${comment.authorName}! 🙌 Sí, incluye soporte completo e integraciones nativas. Escríbenos al WhatsApp directo para atenderte ya.`,
    ]
    setReplyText(suggestions[Math.floor(Math.random() * suggestions.length)])
    setShowReplyBox(true)
  }

  return (
    <Card className="p-4 space-y-3 hover:border-zinc-700 transition-all duration-150 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground uppercase border shrink-0">
            {comment.authorName.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground truncate">{comment.authorName}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${getPlatformBg()}`}>
                {getPlatformIcon()} {comment.platform}
              </span>
            </div>
            {comment.postTitle && (
              <p className="text-[11px] text-muted-foreground truncate max-w-md">
                Post: <em>{comment.postTitle}</em>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {comment.sentiment === "QUESTION" && (
            <Badge variant="info" size="sm">💡 Interés / Pregunta</Badge>
          )}
          <Badge variant={comment.status === "PENDING" ? "warning" : "success"} size="sm">
            {comment.status === "PENDING" ? "Pendiente" : comment.status === "BOT_REPLIED" ? "Respondido por Bot 🤖" : "Respondido 👤"}
          </Badge>
        </div>
      </div>

      {/* Message Body */}
      <div className="text-xs text-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
        &ldquo;{comment.message}&rdquo;
      </div>

      {/* Existing Reply Thread */}
      {comment.replyMessage && (
        <div className="ml-4 pl-3 border-l-2 border-primary/50 bg-primary/5 p-2.5 rounded-r-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
            {comment.repliedBy === "AI_BOT" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            <span>Respuesta ({comment.repliedBy === "AI_BOT" ? "Bot Automático IA" : "Agente"})</span>
          </div>
          <p className="text-xs text-foreground/90">{comment.replyMessage}</p>
        </div>
      )}

      {/* Quick Reply Trigger or Input Box */}
      {showReplyBox ? (
        <form onSubmit={handleSend} className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Responder públicamente a @${comment.authorName}...`}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
            />
            <Button type="submit" size="sm" disabled={isReplying || !replyText.trim()} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {isReplying ? "Enviando..." : "Responder"}
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowReplyBox(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {new Date(comment.createdAt).toLocaleTimeString()}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAiSuggest}
              className="h-7 text-xs gap-1.5 text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sugerir con IA
            </Button>
            <Button
              size="sm"
              onClick={() => setShowReplyBox(true)}
              className="h-7 text-xs gap-1.5"
            >
              <Send className="h-3 w-3" />
              Responder
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
