"use client"

import React from "react"
import { PhoneOff, Mic, MicOff, Disc, User } from "lucide-react"
import { useCall } from "@/src/application/crm/context/call-context"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"

export function CallWidget() {
  const { status, phoneNumber, contactName, duration, isMuted, isRecording, endCall, toggleMute } = useCall()

  if (status === "idle") return null

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/95 backdrop-blur-md border-2 border-cyan-500/50 shadow-2xl rounded-2xl p-4 w-80 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {status === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  status === "connected"
                    ? "bg-emerald-500"
                    : status === "ended"
                    ? "bg-rose-500"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {status === "connecting" && "Conectando VoIP..."}
              {status === "ringing" && "Marcando..."}
              {status === "connected" && "En Llamada"}
              {status === "ended" && "Llamada Finalizada"}
            </span>
          </div>

          {isRecording && status === "connected" && (
            <Badge variant="danger" className="text-[10px] flex items-center gap-1 animate-pulse">
              <Disc className="h-3 w-3" /> REC
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="py-4 text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2">
            <User className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-base truncate">{contactName}</h4>
          <p className="text-xs text-muted-foreground font-mono">{phoneNumber}</p>
          {status === "connected" && (
            <p className="text-lg font-mono font-bold text-cyan-500 pt-1">{formatTime(duration)}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {status === "connected" && (
            <Button
              size="icon"
              variant={isMuted ? "danger" : "secondary"}
              className="rounded-full h-10 w-10"
              onClick={toggleMute}
              title={isMuted ? "Activar Micrófono" : "Silenciar"}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}

          {status !== "ended" ? (
            <Button
              size="icon"
              variant="danger"
              className="rounded-full h-12 w-12 bg-rose-600 hover:bg-rose-700 shadow-lg"
              onClick={endCall}
              title="Colgar"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground py-2 font-medium">
              Guardando audio en la ficha del cliente...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
