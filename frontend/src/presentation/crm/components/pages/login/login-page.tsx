"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService, ApiError } from "@src/infrastructure/auth/auth.service"
import Link from "next/link"

export function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const search = new URLSearchParams(window.location.search)
      const rawRedirect = search.get("redirect")
      const redirectTarget =
        rawRedirect === "/crm"
          ? "/"
          : rawRedirect?.startsWith("/crm/")
            ? rawRedirect.replace(/^\/crm/, "")
            : rawRedirect && rawRedirect.startsWith("/")
              ? rawRedirect
              : "/"

      await AuthService.login(email, password)
      router.replace(redirectTarget)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Unable to sign in")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-obsidian text-paper font-sans">
      {/* Left side: Premium Branding (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-carbon via-graphite to-obsidian p-12 lg:flex border-r border-border">
        {/* Subtle mesh background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Glowing orbs */}
        <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-signal-blue/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-signal-blue/5 blur-[100px]" />

        {/* Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-blue shadow-lg shadow-signal-blue/20">
            <svg className="h-6 w-6 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-2.08-.402-4.071-1.128-5.892M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0015 11c0 2.08.402 4.071 1.128 5.892M12 11a4 4 0 102.133-9.106A4 4 0 0012 11zm-.88-2.343a4 4 0 11-.88 2.343 4 4 0 01.88-2.343z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-widest text-paper">NEXUS</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="heading-tight text-[40px] font-medium leading-none text-paper xl:text-[48px]">
            Diseñado para <span className="text-signal-blue">conectar</span> con tus clientes.
          </h1>
          <p className="text-body text-ash leading-relaxed">
            Una suite completa de herramientas para optimizar ventas, organizar pipelines y potenciar la productividad de tu equipo comercial en tiempo real.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-blue/10 text-signal-blue">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-smoke">Pipelines de venta automatizados y visuales.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-blue/10 text-signal-blue">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-smoke">Integración omnicanal en Helpdesk e Interacciones.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-blue/10 text-signal-blue">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-smoke">Control robusto de accesos con arquitectura multi-tenant.</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-caption text-ash">
          &copy; {new Date().getFullYear()} Nexus CRM. Todos los derechos reservados.
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 md:px-12 lg:w-1/2 bg-obsidian">
        <div className="mx-auto w-full max-w-md space-y-8">
          
          {/* Header logo on mobile */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-blue shadow-lg shadow-signal-blue/20 lg:hidden mb-4">
              <svg className="h-6 w-6 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-2.08-.402-4.071-1.128-5.892M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0015 11c0 2.08.402 4.071 1.128 5.892M12 11a4 4 0 102.133-9.106A4 4 0 0012 11zm-.88-2.343a4 4 0 11-.88 2.343 4 4 0 01.88-2.343z" />
              </svg>
            </div>
            <h2 className="text-heading font-medium tracking-tight text-paper">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-ash">
              Ingresa tus credenciales para acceder a la plataforma Nexus.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-caption font-medium tracking-wide text-smoke" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ash">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-steel bg-iron py-3 pl-10 pr-4 text-body text-paper placeholder:text-ash outline-none transition-all duration-200 hover:border-ash focus:border-signal-blue focus:ring-1 focus:ring-signal-blue"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-caption font-medium tracking-wide text-smoke" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-caption text-signal-blue hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ash">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-steel bg-iron py-3 pl-10 pr-12 text-body text-paper placeholder:text-ash outline-none transition-all duration-200 hover:border-ash focus:border-signal-blue focus:ring-1 focus:ring-signal-blue"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ash hover:text-paper"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-signal-blue py-3 px-4 text-body font-medium text-paper transition-all duration-300 hover:bg-opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-signal-blue/20 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-paper" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Acceder"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-ash">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-signal-blue hover:underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
