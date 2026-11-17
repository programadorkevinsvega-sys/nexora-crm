import { ESignaturePortalPage } from "@/src/presentation/crm/components/pages/cpq/e-signature-page"

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <ESignaturePortalPage token={token} />
}
