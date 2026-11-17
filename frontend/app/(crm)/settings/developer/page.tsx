import { DeveloperPortalPage } from '@/src/presentation/crm/components/pages/developer/developer-portal-page'

export const metadata = {
  title: 'Developer Portal — API Keys & Webhooks | Nexora CRM',
  description: 'Administra tus API Keys, Webhooks salientes con HMAC-SHA256 y consulta la API Pública /api/v1.',
}

export default function Page() {
  return <DeveloperPortalPage />
}
