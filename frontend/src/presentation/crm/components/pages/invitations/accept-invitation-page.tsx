'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { api, ApiError } from '@/src/infrastructure/crm/api/api-client'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { CheckCircle2, Clock3, ShieldCheck } from 'lucide-react'

type InvitationPreview = {
  email: string
  expiresAt: string
  status: 'PENDING' | 'ACCEPTING'
}

type ScreenState = 'loading' | 'ready' | 'accepted' | 'invalid'

export default function AcceptInvitationPage() {
  const [token, setToken] = useState('')
  const [preview, setPreview] = useState<InvitationPreview | null>(null)
  const [screenState, setScreenState] = useState<ScreenState>('loading')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const fragment = window.location.hash.replace(/^#/, '')
    const fragmentParams = new URLSearchParams(fragment)
    const inviteToken = fragmentParams.get('token') || ''

    // Remove the one-time secret from the address bar before making any request.
    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    if (!inviteToken) {
      setScreenState('invalid')
      setError('El enlace no contiene un token de invitación.')
      return
    }

    setToken(inviteToken)
    api.post<InvitationPreview>('/api/team-invitations/preview', { token: inviteToken })
      .then((result) => {
        setPreview(result)
        setScreenState('ready')
      })
      .catch((err) => {
        setScreenState('invalid')
        setError(err instanceof ApiError
          ? err.message
          : 'La invitación no existe, venció o ya fue utilizada.')
      })
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/api/team-invitations/accept', {
        token,
        firstName,
        lastName,
        password,
      })
      setScreenState('accepted')
      setNotice('Tu cuenta quedó activada. Ya puedes iniciar sesión.')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof ApiError
        ? err.message
        : 'No se pudo completar la aceptación. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-obsidian px-4 py-10">
      <Card className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            {screenState === 'accepted' ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h1 className="text-xl font-semibold text-paper">Unirte a Nexora CRM</h1>
          <p className="text-sm text-ash">
            {screenState === 'accepted'
              ? 'La invitación fue aceptada correctamente.'
              : 'Completa tus datos para activar tu acceso a la empresa.'}
          </p>
        </div>

        {screenState === 'loading' && (
          <p role="status" className="text-sm text-ash text-center">Validando invitación...</p>
        )}

        {screenState === 'ready' && preview && (
          <>
            <div className="rounded-lg border border-steel p-3 space-y-1">
              <p className="text-xs text-ash">Invitación enviada a</p>
              <p className="text-sm font-medium text-paper">{preview.email}</p>
              <div className="flex items-center gap-2 text-xs text-ash pt-1">
                <Clock3 size={13} />
                <span>Vence: {new Date(preview.expiresAt).toLocaleString()}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="invite-first-name" className="text-xs text-ash mb-1.5 block">Nombre</label>
                  <input
                    id="invite-first-name"
                    autoComplete="given-name"
                    required
                    maxLength={100}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full bg-obsidian border border-steel rounded-lg px-3 py-2 text-sm text-paper focus:outline-none focus:border-signal-blue"
                  />
                </div>
                <div>
                  <label htmlFor="invite-last-name" className="text-xs text-ash mb-1.5 block">Apellido</label>
                  <input
                    id="invite-last-name"
                    autoComplete="family-name"
                    required
                    maxLength={100}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full bg-obsidian border border-steel rounded-lg px-3 py-2 text-sm text-paper focus:outline-none focus:border-signal-blue"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="invite-password" className="text-xs text-ash mb-1.5 block">Crear contraseña</label>
                <input
                  id="invite-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-obsidian border border-steel rounded-lg px-3 py-2 text-sm text-paper focus:outline-none focus:border-signal-blue"
                />
                <p className="text-[11px] text-ash mt-1">Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.</p>
              </div>
              <div>
                <label htmlFor="invite-confirm-password" className="text-xs text-ash mb-1.5 block">Confirmar contraseña</label>
                <input
                  id="invite-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-obsidian border border-steel rounded-lg px-3 py-2 text-sm text-paper focus:outline-none focus:border-signal-blue"
                />
              </div>
              {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting || !firstName.trim() || !lastName.trim()}>
                {isSubmitting ? 'Activando cuenta...' : 'Aceptar invitación y activar cuenta'}
              </Button>
            </form>
          </>
        )}

        {screenState === 'accepted' && (
          <div className="space-y-4 text-center">
            {notice && <p role="status" className="text-sm text-emerald-400">{notice}</p>}
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        )}

        {screenState === 'invalid' && (
          <div className="space-y-4 text-center">
            {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
            <p className="text-xs text-ash">Solicita al administrador de la empresa que reenvíe la invitación.</p>
            <Link href="/login" className="text-sm text-signal-blue hover:underline">Volver al inicio de sesión</Link>
          </div>
        )}
      </Card>
    </main>
  )
}
