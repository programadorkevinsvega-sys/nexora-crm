"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider, useSession } from "@src/infrastructure/auth/auth-provider"
import { ErrorBoundary } from "@src/presentation/components/error-boundary"
import { Toaster } from "@src/presentation/components/toast"
import { registerDependencies } from "@src/application/crm/di/register"
import { CallProvider } from "@/src/application/crm/context/call-context"
import { CallWidget } from "@/src/presentation/crm/components/common/call-widget"
import { CommandPalette } from "@/src/presentation/crm/components/common/command-palette"
import { CrmSidebar } from "@/src/presentation/crm/components/layout/crm-sidebar"
import { CrmHeader } from "@/src/presentation/crm/components/layout/crm-header"

registerDependencies()

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function CrmShell({ children }: { children: React.ReactNode }) {
  const { ready, session } = useSession()

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground text-sm font-medium">
        Cargando Nexora CRM...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground text-sm font-medium">
        Redirigiendo al inicio de sesión...
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased transition-colors duration-150">
      <CrmSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <CrmHeader />
        <main className="flex-1 overflow-auto bg-background p-6 transition-colors duration-150">
          <div className="max-w-[1200px] mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <CallProvider>
            <CrmShell>{children}</CrmShell>
            <CommandPalette />
            <CallWidget />
            <Toaster />
          </CallProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
