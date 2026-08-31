"use client"

import React from "react"
import { Phone } from "lucide-react"
import { useCall } from "@/src/application/crm/context/call-context"
import { Button } from "@/src/presentation/crm/components/ui/Button"

interface ClickToCallButtonProps {
  phoneNumber?: string | null
  contactName?: string
  contactId?: string
  className?: string
  size?: "sm" | "md" | "lg" | "icon"
  showText?: boolean
}

export function ClickToCallButton({
  phoneNumber,
  contactName = "Contacto",
  contactId,
  className = "",
  size = "icon",
  showText = false,
}: ClickToCallButtonProps) {
  const { startCall, status } = useCall()

  if (!phoneNumber) return null

  const isBusy = status !== "idle"

  return (
    <Button
      variant="outline"
      size={size}
      disabled={isBusy}
      className={`text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/20 ${className}`}
      onClick={(e) => {
        e.stopPropagation()
        startCall(phoneNumber, contactName, contactId)
      }}
      title={`Llamar por VoIP a ${phoneNumber}`}
    >
      <Phone className="h-3.5 w-3.5" />
      {showText && <span className="ml-1.5 text-xs font-medium">Llamar</span>}
    </Button>
  )
}
