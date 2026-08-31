"use client"

import React, { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useMetaCallback } from "@/src/application/crm/di/hooks"

function FacebookOAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const { mutate: handleCallback } = useMetaCallback()

  useEffect(() => {
    if (code) {
      handleCallback(code, {
        onSettled: () => {
          router.push("/integrations/facebook")
        },
      })
    } else {
      router.push("/integrations/facebook")
    }
  }, [code, handleCallback, router])

  return (
    <div className="flex items-center gap-2.5 text-zinc-300 text-sm">
      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      <span>Completando conexión con Meta Business Suite...</span>
    </div>
  )
}

export default function FacebookOAuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Suspense
        fallback={
          <div className="flex items-center gap-2.5 text-zinc-300 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span>Cargando autenticación de Meta...</span>
          </div>
        }
      >
        <FacebookOAuthCallbackContent />
      </Suspense>
    </div>
  )
}
