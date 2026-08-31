import { KbArticleReaderPage } from "@/src/presentation/crm/components/pages/kb/kb-article-reader-page"

export const metadata = {
  title: "Artículo de Conocimiento — Nexus CRM",
  description: "Centro de ayuda y base de conocimientos corporativa.",
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <KbArticleReaderPage articleId={id} />
}
