"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Lock, CheckCircle2, FileSignature, KeyRound, Clock } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiCpqRepository } from "@/src/infrastructure/crm/repositories/cpq/api-cpq.repository"
import type { ESignature } from "@/src/domain/crm/cpq/cpq.entity"

export function ESignaturePortalPage({ token }: { token: string }) {
  const [signature, setSignature] = useState<ESignature | null>(null)
  const [loading, setLoading] = useState(true)
  const [otpCode, setOtpCode] = useState("")
  const [signatureText, setSignatureText] = useState("")
  const [step, setStep] = useState<"OTP" | "SIGN" | "SUCCESS">("OTP")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const loadSignature = async () => {
      try {
        setLoading(true)
        const sig = await ApiCpqRepository.getSignatureByToken(token)
        setSignature(sig)
        if (sig.status === "SIGNED") {
          setStep("SUCCESS")
        } else if (sig.status === "OTP_VERIFIED") {
          setStep("SIGN")
        } else {
          setStep("OTP")
        }
      } catch (err: any) {
        console.error("Failed to load signature contract:", err)
      } finally {
        setLoading(false)
      }
    }
    if (token) loadSignature()
  }, [token])

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      alert("Please enter the 6-digit verification code")
      return
    }
    try {
      setProcessing(true)
      await ApiCpqRepository.verifyOtp(token, otpCode.trim())
      setStep("SIGN")
    } catch (err: any) {
      alert(`OTP Verification failed: ${err?.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleSubmitSignature = async () => {
    if (!signatureText.trim()) {
      alert("Please enter your legal signature name")
      return
    }
    try {
      setProcessing(true)
      const dataUrl = `data:text/plain;base64,${btoa(signatureText.trim())}`
      const signed = await ApiCpqRepository.submitSignature({
        token,
        signatureDataUrl: dataUrl,
      })
      setSignature(signed)
      setStep("SUCCESS")
    } catch (err: any) {
      alert(`Signature submission failed: ${err?.message}`)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6">
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!signature) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 text-center">
        <Card className="p-8 space-y-3">
          <Lock className="h-10 w-10 text-destructive mx-auto" />
          <div className="font-semibold text-lg">Invalid or Expired Link</div>
          <div className="text-xs text-muted-foreground">The signature link provided is invalid or has expired.</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileSignature className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-base">E-Signature Portal</h2>
              <p className="text-xs text-muted-foreground">Legally binding electronic signature</p>
            </div>
          </div>
          <Badge variant={signature.status === "SIGNED" ? "default" : "secondary"}>
            {signature.status}
          </Badge>
        </div>

        {/* Document summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Signer:</span>
            <span className="font-semibold">{signature.signerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-mono">{signature.signerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Document Ref:</span>
            <span className="font-mono">{signature.documentId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expiration:</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3" />
              {new Date(signature.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Step: OTP */}
        {step === "OTP" && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Please enter the 6-digit OTP verification code sent to your email to verify identity:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                className="w-full px-4 py-2 border rounded-md text-center font-mono text-lg tracking-widest bg-background"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleVerifyOtp} disabled={processing}>
              <KeyRound className="h-4 w-4 mr-2" />
              Verify OTP &amp; Proceed to Sign
            </Button>
          </div>
        )}

        {/* Step: Sign */}
        {step === "SIGN" && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Type your legal full name below to generate your cryptographically verifiable signature:
            </div>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-primary rounded-md font-serif text-lg bg-background"
              placeholder={signature.signerName}
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
            />
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Your signature records IP address, timestamp UTC, and SHA-256 integrity hash.
            </div>
            <Button className="w-full" onClick={handleSubmitSignature} disabled={processing}>
              Sign &amp; Complete Document
            </Button>
          </div>
        )}

        {/* Step: SUCCESS */}
        {step === "SUCCESS" && (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-lg">Document Signed Successfully!</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              The deal has been marked as <strong>WON</strong> and the automated onboarding workflow has been triggered.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
