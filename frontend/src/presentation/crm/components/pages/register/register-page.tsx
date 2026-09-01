"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@src/infrastructure/auth/auth.service"
import { ThemeToggle } from "@/src/presentation/crm/components/common/theme-toggle"
import { Building2, User, Mail, Lock, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react"
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
        router.push("/crm")
      }, 1000)
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al registrar el usuario")
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

      {/* Left side: Premium Branding (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-muted/20 p-12 lg:flex border-r border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Logo Header */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">NEXORA</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="heading-tight text-[40px] font-semibold leading-tight text-foreground xl:text-[46px] tracking-tight">
            Únete a la nueva era del <span className="text-primary">crecimiento</span>.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Crea tu cuenta hoy y toma el control absoluto de tus ventas, tareas e interacciones con el cliente en una sola plataforma unificada.
          </p>

          <div className="space-y-3 pt-2 text-xs text-foreground">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-primary shrink-0" />
              <span>Listo para equipos comerciales de cualquier escala.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-primary shrink-0" />
              <span>Analíticas predictivas y copiloto IA integrado.</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Nexora CRM. Todos los derechos reservados.
        </div>
      </div>

      {/* Right side: Register form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 md:px-12 lg:w-1/2 bg-card">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col items-center lg:items-start">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Crea tu cuenta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Regístrate para comenzar a utilizar Nexora CRM.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>¡Registro exitoso! Iniciando tu espacio de trabajo en el CRM...</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="name">
                Nombre completo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <User size={15} />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-input py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all hover:border-muted-foreground focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="company">
                Nombre de la empresa
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Building2 size={15} />
                </div>
                <input
                  id="company"
                  type="text"
                  placeholder="Mi Empresa S.A."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-input py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all hover:border-muted-foreground focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail size={15} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-input py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all hover:border-muted-foreground focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock size={15} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-input py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all hover:border-muted-foreground focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground text-xs"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex w-full items-center justify-center rounded-lg bg-primary py-2.5 px-4 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-foreground font-semibold hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
