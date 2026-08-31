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

  const handleFillDemo = (demoEmail = "demo@nexoracrm.com", demoPass = "Password123!") => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError(null)
  }

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
      {/* Left side: Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-carbon via-graphite to-obsidian p-12 lg:flex border-r border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-signal-blue/10 blur-[100px]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-blue shadow-lg shadow-signal-blue/20">
            <svg className="h-6 w-6 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-2.08-.402-4.071-1.128-5.892M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0015 11c0 2.08.402 4.071 1.128 5.892M12 11a4 4 0 102.133-9.106A4 4 0 0012 11zm-.88-2.343a4 4 0 11-.88 2.343 4 4 0 01.88-2.343z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-widest text-paper">NEXORA</span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="heading-tight text-[40px] font-medium leading-none text-paper xl:text-[48px]">
            Diseñado para <span className="text-signal-blue">conectar</span> con tus clientes.
          </h1>
          <p className="text-body text-ash leading-relaxed">
            Una suite completa de herramientas para optimizar ventas, organizar pipelines y potenciar la productividad comercial.
          </p>
        </div>

        <div className="relative z-10 text-caption text-ash">
          &copy; {new Date().getFullYear()} Nexora CRM. Todos los derechos reservados.
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 md:px-12 lg:w-1/2 bg-obsidian">
        <div className="mx-auto w-full max-w-md space-y-6">
          
          <div className="flex flex-col items-center lg:items-start">
            <h2 className="text-heading font-medium tracking-tight text-paper">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-ash">
              Ingresa tus credenciales para acceder a la plataforma Nexora.
            </p>
          </div>

          {/* Demo Credentials Box */}
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-mono">⚡ Credenciales Demo Disponibles</span>
              <button
                type="button"
                onClick={() => handleFillDemo("demo@nexoracrm.com", "Password123!")}
                className="text-[11px] font-semibold text-cyan-300 hover:text-white bg-cyan-500/20 hover:bg-cyan-500/30 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                Autocompletar Demo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-300">
              <div className="bg-black/40 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">CORREO:</span>
                <span className="text-cyan-200">demo@nexoracrm.com</span>
              </div>
              <div className="bg-black/40 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">CONTRASEÑA:</span>
                <span className="text-cyan-200">Password123!</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-caption font-medium tracking-wide text-smoke" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-steel bg-iron py-2.5 px-3 text-body text-paper placeholder:text-ash outline-none transition-all hover:border-ash focus:border-signal-blue"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-caption font-medium tracking-wide text-smoke" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-caption text-signal-blue hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-steel bg-iron py-2.5 pl-3 pr-10 text-body text-paper placeholder:text-ash outline-none transition-all hover:border-ash focus:border-signal-blue"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ash hover:text-paper"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-signal-blue py-2.5 px-4 text-body font-medium text-paper transition-all hover:bg-opacity-95 disabled:opacity-50 shadow-lg shadow-signal-blue/20 cursor-pointer"
            >
              {isSubmitting ? "Iniciando sesión..." : "Acceder"}
            </button>
          </form>

          <div className="text-center text-xs text-ash">
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
