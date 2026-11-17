import { ForecastingPage } from "@/src/presentation/crm/components/pages/analytics/forecasting-page"

export const metadata = {
  title: "Forecasting Trimestral de Ingresos | Nexora CRM",
  description: "Proyección lineal de ingresos a 3M y 6M con escenarios optimista, base y pesimista.",
}

export default function Page() {
  return <ForecastingPage />
}
