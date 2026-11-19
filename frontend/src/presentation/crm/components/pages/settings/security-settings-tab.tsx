'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Modal } from '@/src/presentation/crm/components/ui/Modal'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { api, ApiError } from '@/src/infrastructure/crm/api/api-client'
import { Smartphone, Monitor, CheckCircle2, Copy, Check, Key, ShieldCheck } from 'lucide-react'

interface MfaMethodSummary {
  id: string
  type: 'TOTP' | 'SMS' | 'EMAIL'
  isPrimary: boolean
  isActive: boolean
  createdAt: string
}

interface MfaSetupResponse {
  methodId: string
  secret: string
  qrCode?: string
}

export function SecuritySettingsTab() {
  const { session } = useSession()
  const [methods, setMethods] = useState<MfaMethodSummary[]>([])
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)
  const [clientPlatform, setClientPlatform] = useState('Navegador Web')
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [isDisableOpen, setIsDisableOpen] = useState(false)
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')

  const activeTotp = methods.find((method) => method.type === 'TOTP' && method.isActive)
  const pendingTotp = methods.find((method) => method.type === 'TOTP' && !method.isActive)

  const refreshMethods = async () => {
    const data = await api.get<MfaMethodSummary[]>('/api/auth/mfa/methods')
    setMethods(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    const ua = navigator.userAgent
    let os = 'Linux'
    if (ua.includes('Win')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

    let browser = 'Chrome'
    if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge'
    setClientPlatform(browser + ' en ' + os)
  }, [])

  useEffect(() => {
    if (!session?.userId || !session.tenantId) {
      setIsLoadingMethods(false)
      return
    }

    let cancelled = false
    setIsLoadingMethods(true)
    api.get<MfaMethodSummary[]>('/api/auth/mfa/methods')
      .then((data) => {
        if (!cancelled) {
          setMethods(Array.isArray(data) ? data : [])
          setLoadError('')
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof ApiError ? error.message : 'No se pudo consultar el estado de MFA.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMethods(false)
      })

    return () => { cancelled = true }
  }, [session?.userId, session?.tenantId])

  const handleOpenSetup = async () => {
    setVerifyError('')
    setVerificationCode('')
    setCopied(false)
    setIsSubmitting(true)
    try {
      const data = await api.post<MfaSetupResponse>('/api/auth/mfa/setup', { type: 'TOTP' })
      setSetupData(data)
      setIsSetupOpen(true)
    } catch (error) {
      setVerifyError(error instanceof ApiError ? error.message : 'No se pudo iniciar la configuración TOTP.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupData || verificationCode.trim().length !== 6) {
      setVerifyError('Ingresa el código actual de 6 dígitos de tu aplicación autenticadora.')
      return
    }

    setIsSubmitting(true)
    setVerifyError('')
    try {
      const result = await api.post<{ verified: boolean }>('/api/auth/mfa/verify', {
        methodId: setupData.methodId,
        code: verificationCode.trim(),
      })
      if (!result.verified) {
        setVerifyError('El código no es válido. Comprueba la hora del dispositivo y vuelve a intentarlo.')
        return
      }
      await refreshMethods()
      setIsSetupOpen(false)
      setSetupData(null)
      setVerificationCode('')
    } catch (error) {
      setVerifyError(error instanceof ApiError ? error.message : 'No se pudo verificar el código TOTP.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTotp || verificationCode.trim().length !== 6) {
      setVerifyError('Ingresa un código TOTP actual de 6 dígitos para desactivar MFA.')
      return
    }

    setIsSubmitting(true)
    setVerifyError('')
    try {
      await api.post('/api/auth/mfa/disable', {
        methodId: activeTotp.id,
        code: verificationCode.trim(),
      })
      await refreshMethods()
      setIsDisableOpen(false)
      setVerificationCode('')
    } catch (error) {
      setVerifyError(error instanceof ApiError ? error.message : 'No se pudo desactivar MFA.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copySecret = async () => {
    if (!setupData?.secret) return
    try {
      await navigator.clipboard.writeText(setupData.secret)
      setCopied(true)
    } catch {
      setVerifyError('El navegador no permitió copiar la clave. Selecciónala y cópiala manualmente.')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-steel/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-paper">Autenticación en Dos Pasos (2FA / TOTP)</h3>
              <p className="text-xs text-ash">
                Usa códigos temporales de Google Authenticator, Microsoft Authenticator o 1Password.
              </p>
            </div>
          </div>
          {activeTotp ? (
            <Button
              variant="secondary"
              onClick={() => {
                setVerificationCode('')
                setVerifyError('')
                setIsDisableOpen(true)
              }}
              className="self-start text-xs"
              disabled={isSubmitting || isLoadingMethods}
            >
              Desactivar 2FA
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleOpenSetup}
              className="self-start text-xs"
              disabled={isSubmitting || isLoadingMethods}
            >
              Configurar & Activar 2FA
            </Button>
          )}
        </div>

        <div className="pt-4 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className={activeTotp ? 'text-emerald-400' : 'text-ash'} />
          <span className="text-paper font-medium">
            {isLoadingMethods
              ? 'Consultando el estado de seguridad...'
              : activeTotp
                ? '2FA está activo en el servidor y se exige durante el inicio de sesión.'
                : pendingTotp
                  ? 'Existe un enrolamiento pendiente. Puedes volver a iniciar la configuración para generar una clave nueva.'
                  : '2FA está desactivado para esta cuenta.'}
          </span>
        </div>
        {loadError && <p className="mt-3 text-xs text-rose-400">{loadError}</p>}
      </Card>

      <Modal open={isSetupOpen} onClose={() => {
        setIsSetupOpen(false)
        setSetupData(null)
        setVerificationCode('')
      }} title="Vincular aplicación autenticadora (TOTP)">
        <form onSubmit={handleConfirm2FA} className="space-y-4 text-xs">
          <p className="text-ash">
            Escanea el código de configuración desde tu aplicación o introduce manualmente la clave. La protección sólo se activa después de validar un código vigente.
          </p>

          <div className="p-4 rounded-xl bg-obsidian border border-steel/60 space-y-3">
            <div className="flex items-center justify-between text-paper font-semibold">
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-signal-blue" /> Clave secreta TOTP
              </span>
              <button
                type="button"
                onClick={copySecret}
                className="flex items-center gap-1 px-2 py-1 rounded bg-steel/30 hover:bg-steel text-ash hover:text-paper transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copiada' : 'Copiar'}
              </button>
            </div>
            <div className="p-2.5 rounded bg-steel/20 font-mono text-signal-blue text-sm tracking-wider text-center select-all break-all">
              {setupData?.secret || 'Generando clave segura...'}
            </div>
            <p className="text-[11px] text-ash">
              En la aplicación autenticadora selecciona “Añadir cuenta” y escribe esta clave. No la compartas ni la envíes por correo.
            </p>
          </div>

          <div>
            <label className="text-ash mb-1 block" htmlFor="totp-setup-code">Código actual de 6 dígitos</label>
            <Input
              id="totp-setup-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center font-mono text-base tracking-widest"
              required
              autoComplete="one-time-code"
            />
            {verifyError && <p className="text-rose-400 text-[11px] mt-1">{verifyError}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-steel/60">
            <Button type="button" variant="secondary" onClick={() => {
              setIsSetupOpen(false)
              setSetupData(null)
              setVerificationCode('')
            }}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !setupData || verificationCode.length !== 6}>
              {isSubmitting ? 'Verificando...' : 'Verificar y activar 2FA'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isDisableOpen} onClose={() => {
        setIsDisableOpen(false)
        setVerificationCode('')
      }} title="Confirmar desactivación de 2FA">
        <form onSubmit={handleDisable2FA} className="space-y-4 text-xs">
          <p className="text-ash">
            Para retirar la protección, confirma la operación con un código vigente de tu aplicación autenticadora.
          </p>
          <div>
            <label className="text-ash mb-1 block" htmlFor="totp-disable-code">Código TOTP actual</label>
            <Input
              id="totp-disable-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center font-mono text-base tracking-widest"
              required
              autoComplete="one-time-code"
            />
            {verifyError && <p className="text-rose-400 text-[11px] mt-1">{verifyError}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-steel/60">
            <Button type="button" variant="secondary" onClick={() => setIsDisableOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || verificationCode.length !== 6}>
              {isSubmitting ? 'Procesando...' : 'Confirmar desactivación'}
            </Button>
          </div>
        </form>
      </Modal>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-steel/60">
          <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            <Monitor size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-paper">Sesión actual autenticada</h3>
            <p className="text-xs text-ash">Dispositivo y entorno del navegador actual</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-obsidian border border-steel/60 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-paper">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {clientPlatform}
              <span className="px-2 py-0.5 rounded bg-signal-blue/20 text-signal-blue text-[10px] font-bold">
                Sesión local
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck size={14} /> Autenticación mediante sesión
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-steel/40 text-[11px] text-ash">
            <div>
              <span className="text-paper font-medium">Usuario:</span> {session?.userName || 'Usuario'} ({session?.userEmail || '—'})
            </div>
            <div>
              <span className="text-paper font-medium">Empresa:</span> {session?.companyName || 'Nexora CRM'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
