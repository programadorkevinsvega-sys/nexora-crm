"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@src/infrastructure/auth/auth.service"
import Link from "next/link"

export function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await AuthService.register(name, email, password, company)
      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al registrar el usuario")
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
          <span className="text-lg font-bold tracking-widest text-paper">NEXORA</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="heading-tight text-[40px] font-medium leading-none text-paper xl:text-[48px]">
            Únete a la nueva era del <span className="text-signal-blue">crecimiento</span>.
          </h1>
          <p className="text-body text-ash leading-relaxed">
            Crea tu cuenta hoy y toma el control absoluto de tus ventas, tareas e interacciones con el cliente en una sola plataforma unificada.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-blue/10 text-signal-blue">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-smoke">Listo para equipos pequeños y grandes organizaciones.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-blue/10 text-signal-blue">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-smoke">Analíticas predictivas para anticipar cierres.</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-caption text-ash">
          &copy; {new Date().getFullYear()} Nexora CRM. Todos los derechos reservados.
        </div>
      </div>

      {/* Right side: Register form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 md:px-12 lg:w-1/2 bg-obsidian">
        <div className="mx-auto w-full max-w-md space-y-8">
          
          {/* Header logo on mobile */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-blue shadow-lg shadow-signal-blue/20 lg:hidden mb-4">
              <svg className="h-6 w-6 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-2.08-.402-4.071-1.128-5.892M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0015 11c0 2.08.402 4.071 1.128 5.892M12 11a4 4 0 102.133-9.106A4 4 0 0012 11zm-.88-2.343a4 4 0 11-.88 2.343 4 4 0 01.88-2.343z" />
              </svg>
            </div>
            <h2 className="text-heading font-medium tracking-tight text-paper">Crea tu cuenta</h2>
            <p className="mt-2 text-sm text-ash">
              Regístrate para comenzar a utilizar Nexora CRM.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>¡Registro exitoso! Redirigiendo al login...</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-caption font-medium tracking-wide text-smoke" htmlFor="name">
                Nombre completo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ash">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-steel bg-iron py-2.5 pl-10 pr-4 text-body text-paper placeholder:text-ash outline-none transition-all duration-200 hover:border-ash focus:border-signal-blue focus:ring-1 focus:ring-signal-blue"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-caption font-medium tracking-wide text-smoke" htmlFor="company">
                Nombre de la empresa
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ash">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <input
                  id="company"
                  type="text"
                  placeholder="Mi Empresa S.A."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="block w-full rounded-lg border border-steel bg-iron py-2.5 pl-10 pr-4 text-body text-paper placeholder:text-ash outline-none transition-all duration-200 hover:border-ash focus:border-signal-blue focus:ring-1 focus:ring-signal-blue"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
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
                  className="block w-full rounded-lg border border-steel bg-iron py-2.5 pl-10 pr-4 text-body text-paper placeholder:text-ash outline-none transition-all duration-200 hover:border-ash focus:border-signal-blue focus:ring-1 focus:ring-signal-blue"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-caption font-medium tracking-wide text-smoke" htmlFor="password">
                Contraseña
              </label>
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
                  className="block w-full rounded-lg border border-steel bg-iron py-2.5 pl-10 pr-12 text-body text-paper placeholder:text-ash outline-none transition-all duration-200 hover:border-ash focus:border-signal-blue focus:ring-1 focus:ring-signal-blue"
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
              disabled={isSubmitting || success}
              className="flex w-full items-center justify-center rounded-lg bg-signal-blue py-3 px-4 text-body font-medium text-paper transition-all duration-300 hover:bg-opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-signal-blue/20 cursor-pointer pt-3"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-paper" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Registrando...</span>
                </div>
              ) : (
                "Registrarse"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-ash">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-signal-blue hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default RegisterPage
