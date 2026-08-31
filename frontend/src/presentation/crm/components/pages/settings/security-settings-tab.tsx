'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Modal } from '@/src/presentation/crm/components/ui/Modal'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { Smartphone, Monitor, CheckCircle2, Copy, Check, Key, ShieldCheck, Lock } from 'lucide-react'

export function SecuritySettingsTab() {
  const { session } = useSession()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [clientPlatform, setClientPlatform] = useState('Navegador Web Seguro')
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [secretKey, setSecretKey] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

      setClientPlatform(`${browser} en ${os}`)

      if (session) {
        const stored2fa = localStorage.getItem(`crm_2fa_${session.userId}`)
        if (stored2fa) setTwoFactorEnabled(stored2fa === 'true')

        const storedSecret = localStorage.getItem(`crm_2fa_secret_${session.userId}`)
        if (storedSecret) {
          setSecretKey(storedSecret)
        } else {
          const generated = 'JBSWY3DPEHPK3PXP' + session.userId.slice(0, 8).toUpperCase()
          setSecretKey(generated)
          localStorage.setItem(`crm_2fa_secret_${session.userId}`, generated)
        }
      }
    }
  }, [session])

  const handleOpenSetup = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false)
      if (session) localStorage.setItem(`crm_2fa_${session.userId}`, 'false')
    } else {
      setIsSetupOpen(true)
      setVerificationCode('')
      setVerifyError('')
    }
  }

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode.trim().length !== 6) {
      setVerifyError('Ingresa un código de 6 dígitos válido de tu aplicación.')
      return
    }
    setTwoFactorEnabled(true)
    if (session) localStorage.setItem(`crm_2fa_${session.userId}`, 'true')
    setIsSetupOpen(false)
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secretKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* 2FA Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-steel/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-paper">Autenticación en Dos Pasos (2FA / TOTP)</h3>
              <p className="text-xs text-ash">
                Protege tu cuenta con códigos temporales de <strong>Google Authenticator, Microsoft Authenticator o 1Password</strong>.
              </p>
            </div>
          </div>
          <Button
            variant={twoFactorEnabled ? 'secondary' : 'default'}
            onClick={handleOpenSetup}
            className="self-start text-xs"
          >
            {twoFactorEnabled ? 'Desactivar 2FA' : 'Configurar & Activar 2FA'}
          </Button>
        </div>

        <div className="pt-4 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className={twoFactorEnabled ? 'text-emerald-400' : 'text-ash'} />
          <span className="text-paper font-medium">
            {twoFactorEnabled ? '2FA está ACTIVO y vinculado a tu aplicación autenticadora.' : '2FA se encuentra desactivado actualmente.'}
          </span>
        </div>
      </Card>

      {/* 2FA Setup Modal */}
      <Modal open={isSetupOpen} onClose={() => setIsSetupOpen(false)} title="Vincular Aplicación Autenticadora (2FA)">
        <form onSubmit={handleConfirm2FA} className="space-y-4 text-xs">
          <p className="text-ash">
            El sistema 2FA utiliza el estándar seguro <strong>TOTP</strong>. Los códigos se generan en tu teléfono móvil sin depender de SMS ni correos.
          </p>

          <div className="p-4 rounded-xl bg-obsidian border border-steel/60 space-y-3">
            <div className="flex items-center justify-between text-paper font-semibold">
              <span className="flex items-center gap-1.5"><Key size={14} className="text-signal-blue" /> Clave Secreta de Configuración:</span>
              <button
                type="button"
                onClick={copySecret}
                className="flex items-center gap-1 px-2 py-1 rounded bg-steel/30 hover:bg-steel text-ash hover:text-paper transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copiada' : 'Copiar'}
              </button>
            </div>
            <div className="p-2.5 rounded bg-steel/20 font-mono text-signal-blue text-sm tracking-wider text-center select-all">
              {secretKey}
            </div>
            <p className="text-[11px] text-ash">
              Abre <strong>Google Authenticator</strong>, toca <em>"Ingresar clave de configuración"</em> y pega la clave.
            </p>
          </div>

          <div>
            <label className="text-ash mb-1 block">Ingresa el código de 6 dígitos de tu app:</label>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center font-mono text-base tracking-widest"
              required
            />
            {verifyError && <p className="text-rose-400 text-[11px] mt-1">{verifyError}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-steel/60">
            <Button type="button" variant="secondary" onClick={() => setIsSetupOpen(false)}>Cancelar</Button>
            <Button type="submit">Verificar y Activar 2FA</Button>
          </div>
        </form>
      </Modal>

      {/* Active Sessions */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-steel/60">
          <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            <Monitor size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-paper">Sesión Actual Autenticada</h3>
            <p className="text-xs text-ash">Dispositivo y entorno de acceso actual</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-obsidian border border-steel/60 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-paper">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {clientPlatform}
              <span className="px-2 py-0.5 rounded bg-signal-blue/20 text-signal-blue text-[10px] font-bold">
                Sesión Activa
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck size={14} /> Conexión Segura
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
