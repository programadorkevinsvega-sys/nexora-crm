"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Mail, Smartphone, Globe, Search, Send, Flame, User, Star, RefreshCw, CheckCheck, Check, ExternalLink, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Avatar } from "@/src/presentation/crm/components/ui/Avatar"
import { ApiInboxRepository } from "@/src/infrastructure/crm/repositories/inbox/api-inbox.repository"
import type { InboxConversation, InboxChannel } from "@crm/contracts"

export function InboxPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<InboxConversation[]>([])
  const [selectedConvo, setSelectedConvo] = useState<InboxConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeChannel, setActiveChannel] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Composer state
  const [composeChannel, setComposeChannel] = useState<InboxChannel>("WHATSAPP")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async (keepSelection = true) => {
    try {
      if (!keepSelection) setLoading(true)
      const data = await ApiInboxRepository.listConversations({
        channel: activeChannel === "ALL" ? undefined : activeChannel,
      })
      setConversations(data)
      if (data.length > 0) {
        if (!selectedConvo || !keepSelection) {
          setSelectedConvo(data[0])
          setComposeChannel(data[0].channel)
        } else {
          const updated = data.find((c) => c.id === selectedConvo.id)
          if (updated) setSelectedConvo(updated)
        }
      } else {
        setSelectedConvo(null)
      }
    } catch (err) {
      console.error("Failed to load conversations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations(false)
  }, [activeChannel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConvo?.messages])

  const handleSendMessage = async () => {
    if (!composeBody.trim() || !selectedConvo) return
    try {
      setSending(true)
      const recipient =
        composeChannel === "WHATSAPP" || composeChannel === "SMS"
          ? selectedConvo.contactPhone || selectedConvo.id
          : selectedConvo.contactEmail || selectedConvo.id

      await ApiInboxRepository.sendMessage({
        conversationId: selectedConvo.id,
        contactId: selectedConvo.contactId || undefined,
        channel: composeChannel,
        recipientIdentifier: recipient,
        subject: composeChannel === "EMAIL" ? composeSubject.trim() || "Respuesta Nexora CRM" : undefined,
        bodyText: composeBody.trim(),
      })

      setComposeBody("")
      setComposeSubject("")
      await fetchConversations(true)
    } catch (err: any) {
      alert(`Error al enviar mensaje: ${err?.message}`)
    } finally {
      setSending(false)
    }
  }

  const getChannelBadge = (channel: InboxChannel) => {
    switch (channel) {
      case "WHATSAPP":
        return <Badge variant="default" className="bg-emerald-600 text-white text-[10px]"><MessageSquare className="h-2.5 w-2.5 mr-1" /> WhatsApp</Badge>
      case "EMAIL":
        return <Badge variant="secondary" className="bg-sky-100 text-sky-800 text-[10px]"><Mail className="h-2.5 w-2.5 mr-1" /> Email</Badge>
      case "SMS":
        return <Badge variant="outline" className="text-[10px]"><Smartphone className="h-2.5 w-2.5 mr-1" /> SMS</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]"><Globe className="h-2.5 w-2.5 mr-1" /> WebChat</Badge>
    }
  }

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true
    const term = searchQuery.toLowerCase()
    return (
      (c.contactName || "").toLowerCase().includes(term) ||
      (c.subject || "").toLowerCase().includes(term) ||
      (c.lastMessageText || "").toLowerCase().includes(term)
    )
  })

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Bandeja Omnicanal (Omnichannel Inbox)
          </h1>
          <p className="text-xs text-muted-foreground">
            Mensajería unificada en tiempo real: WhatsApp (Meta API), Correo Electrónico y SMS vinculados al CRM.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/social-inbox">
            <Button size="sm" className="gap-1.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Social Inbox (Comentarios Redes)
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => fetchConversations(true)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left Column: Channels & Conversation List (4 cols) */}
        <Card className="col-span-4 flex flex-col overflow-hidden border shadow-sm">
          {/* Channel Tabs */}
          <div className="p-2 border-b bg-muted/40 flex gap-1">
            {[
              { id: "ALL", label: "Todos" },
              { id: "WHATSAPP", label: "WhatsApp" },
              { id: "EMAIL", label: "Email" },
              { id: "SMS", label: "SMS" },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeChannel === tab.id ? "default" : "ghost"}
                className="text-xs h-7 px-2.5 flex-1"
                onClick={() => setActiveChannel(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar contacto o mensaje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border bg-background"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No hay conversaciones registradas en este canal.
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isSelected = selectedConvo?.id === convo.id
                return (
                  <div
                    key={convo.id}
                    onClick={() => {
                      setSelectedConvo(convo)
                      setComposeChannel(convo.channel)
                    }}
                    className={`p-3 cursor-pointer transition-colors text-xs space-y-1.5 ${
                      isSelected ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-foreground truncate">
                        <Avatar name={convo.contactName || convo.subject} size="sm" />
                        <span className="truncate">{convo.contactName || "Contacto"}</span>
                      </div>
                      {getChannelBadge(convo.channel)}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {convo.lastMessageText || "Sin mensajes"}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {convo.leadScore > 0 && (
                        <span className="flex items-center gap-0.5 text-orange-600 font-medium">
                          <Flame className="h-2.5 w-2.5 fill-orange-500" /> {convo.leadScore} pts
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Center Column: Active Conversation Chat (5 cols) */}
        <Card className="col-span-5 flex flex-col overflow-hidden border shadow-sm">
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedConvo.contactName || "Chat"} size="md" />
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      {selectedConvo.contactName || "Contacto"}
                      {selectedConvo.leadTemperature === "HOT" && (
                        <Badge variant="default" className="text-[10px] px-1 py-0 bg-orange-600">
                          🔥 HOT
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {selectedConvo.contactPhone || selectedConvo.contactEmail || selectedConvo.subject}
                    </div>
                  </div>
                </div>
                {selectedConvo.contactId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => router.push(`/contacts/${selectedConvo.contactId}/360`)}
                  >
                    <Star className="h-3.5 w-3.5 mr-1 text-amber-500 fill-amber-500" /> Ver 360
                  </Button>
                )}
              </div>

              {/* Messages Bubble Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                {selectedConvo.messages.map((msg) => {
                  const isOut = msg.direction === "OUTBOUND"
                  return (
                    <div key={msg.id} className={`flex flex-col ${isOut ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg p-3 text-xs shadow-xs space-y-1 ${
                          isOut
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-card border text-foreground rounded-bl-none"
                        }`}
                      >
                        <div className="text-[10px] opacity-75 font-semibold">
                          {msg.senderName} • {msg.channel}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.bodyText}</div>
                        <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 mt-1 font-mono">
                          <span>
                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isOut && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-3 border-t bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground text-[11px]">Enviar por:</span>
                    <select
                      value={composeChannel}
                      onChange={(e: any) => setComposeChannel(e.target.value)}
                      className="border rounded px-2 py-0.5 text-xs bg-background font-medium"
                    >
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="EMAIL">Correo Electrónico</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>
                </div>

                {composeChannel === "EMAIL" && (
                  <input
                    type="text"
                    placeholder="Asunto del correo..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border rounded bg-background"
                  />
                )}

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder={`Escribe un mensaje de ${composeChannel.toLowerCase()}...`}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 p-2 text-xs border rounded bg-background resize-none"
                  />
                  <Button
                    size="sm"
                    className="self-end h-10 px-4"
                    disabled={sending || !composeBody.trim()}
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-8">
              Selecciona una conversación para abrir el chat.
            </div>
          )}
        </Card>

        {/* Right Column: Contact Context & 360 Widget (3 cols) */}
        <Card className="col-span-3 flex flex-col p-4 border shadow-sm space-y-4 overflow-y-auto">
          {selectedConvo ? (
            <>
              <div className="text-xs font-bold text-foreground border-b pb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Información del Prospecto
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-muted-foreground text-[10px]">Nombre</div>
                  <div className="font-semibold text-foreground">{selectedConvo.contactName || "—"}</div>
                </div>

                {selectedConvo.contactEmail && (
                  <div>
                    <div className="text-muted-foreground text-[10px]">Email</div>
                    <div className="font-mono text-[11px] text-foreground">{selectedConvo.contactEmail}</div>
                  </div>
                )}

                {selectedConvo.contactPhone && (
                  <div>
                    <div className="text-muted-foreground text-[10px]">Teléfono / WhatsApp</div>
                    <div className="font-mono text-[11px] text-foreground">{selectedConvo.contactPhone}</div>
                  </div>
                )}

                <div className="p-3 bg-muted/30 border rounded-md space-y-1">
                  <div className="text-[10px] font-semibold text-muted-foreground">Lead Scoring</div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-foreground">{selectedConvo.leadScore} pts</span>
                    <Badge variant={selectedConvo.leadTemperature === "HOT" ? "default" : "outline"} className="text-[10px]">
                      {selectedConvo.leadTemperature}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedConvo.contactId && (
                <div className="pt-2 border-t space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => router.push(`/contacts/${selectedConvo.contactId}/360`)}
                  >
                    <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-500" />
                    Abrir Customer 360 Hub
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => router.push(`/contacts/${selectedConvo.contactId}`)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Ver Ficha CRM
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Sin contacto seleccionado
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
