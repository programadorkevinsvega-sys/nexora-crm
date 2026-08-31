import { redirect } from "next/navigation"

interface LegacyCrmPathPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function LegacyCrmPathPage({ params }: LegacyCrmPathPageProps) {
  const resolvedParams = await params
  const target = `/${resolvedParams.slug.join("/")}`
  redirect(target)
}
