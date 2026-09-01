"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService, ApiError } from "@src/infrastructure/auth/auth.service"
import { ThemeToggle } from "@/src/presentation/crm/components/common/theme-toggle"
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
        rawRedirect && rawRedirect.startsWith("/") && rawRedirect !== "/"
          ? rawRedirect
          : "/crm"

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
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left side: Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-muted/20 p-12 lg:flex border-r border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">NEXORA</span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="heading-tight text-[40px] font-semibold leading-tight text-foreground xl:text-[46px] tracking-tight">
            Diseñado para <span className="text-primary">conectar</span> con tus clientes.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Una suite completa de herramientas para optimizar ventas, organizar pipelines y potenciar la productividad comercial.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Nexora CRM. Todos los derechos reservados.
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 md:px-12 lg:w-1/2 bg-card">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col items-center lg:items-start">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder a la plataforma Nexora.
            </p>
          </div>

          {/* Demo Credentials Box */}
          <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-mono">
                ⚡ Credenciales Demo Disponibles
              </span>
              <button
                type="button"
                onClick={() => handleFillDemo("demo@nexoracrm.com", "Password123!")}
                className="text-[11px] font-semibold text-primary-foreground bg-primary hover:opacity-90 px-2.5 py-1 rounded-md transition-opacity cursor-pointer shadow-2xs"
              >
                Autocompletar Demo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-card p-2 rounded-lg border border-border">
                <span className="text-muted-foreground block text-[10px]">CORREO:</span>
                <span className="text-foreground font-medium">demo@nexoracrm.com</span>
              </div>
              <div className="bg-card p-2 rounded-lg border border-border">
                <span className="text-muted-foreground block text-[10px]">CONTRASEÑA:</span>
                <span className="text-foreground font-medium">Password123!</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-border bg-input py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all hover:border-muted-foreground focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
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
                  className="block w-full rounded-lg border border-border bg-input py-2.5 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all hover:border-muted-foreground focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground text-xs"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-primary py-2.5 px-4 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Iniciando sesión..." : "Acceder"}
            </button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-foreground font-semibold hover:underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
