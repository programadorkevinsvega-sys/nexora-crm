import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/src/application/crm/context/theme-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nexora CRM — Suite Empresarial Omnicanal con IA, Ventas CPQ y Helpdesk",
  description: "Plataforma empresarial integral para ventas B2B, marketing masivo, WhatsApp Cloud, cotizaciones CPQ, firma digital y atención al cliente omnicanal.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
