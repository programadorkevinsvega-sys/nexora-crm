import { Injectable, Logger } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../../common/grpc/api-core-grpc.client'

export interface KnowledgeChunk {
  id: string
  sourceType: 'ARTICLE' | 'PRODUCT'
  title: string
  content: string
  score: number
}

export interface GroundedReplyResult {
  replyText: string
  retrievedChunks: KnowledgeChunk[]
  sourceCount: number
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name)

  constructor(private readonly api: ApiCoreGrpcClient) {}

  // Tokenize and compute cosine / BM25 term overlap score
  private computeSimilarity(query: string, text: string): number {
    const qTokens = query.toLowerCase().match(/\b[a-záéíóúñ0-9]{3,}\b/g) || []
    const docTokens = text.toLowerCase().match(/\b[a-záéíóúñ0-9]{3,}\b/g) || []
    if (!qTokens.length || !docTokens.length) return 0.1

    const docSet = new Set(docTokens)
    let matches = 0
    for (const t of qTokens) {
      if (docSet.has(t)) matches++
    }

    return matches / Math.sqrt(qTokens.length * Math.min(docTokens.length, 50))
  }

  async searchKnowledgeBase(tenantId: string, query: string, topK = 3): Promise<KnowledgeChunk[]> {
    const chunks: KnowledgeChunk[] = []

    try {
      // 1. Fetch published knowledge base articles via gRPC
      const articles = await this.api.listKbArticles(tenantId, { publicOnly: true })

      for (const art of articles || []) {
        const textToMatch = `${art.title} ${art.summary || ''} ${(art.contentMarkdown || '').slice(0, 1000)}`
        const score = this.computeSimilarity(query, textToMatch)
        if (score > 0.05) {
          chunks.push({
            id: art.id,
            sourceType: 'ARTICLE',
            title: art.title,
            content: art.summary || (art.contentMarkdown || '').slice(0, 350),
            score: Math.min(Number((score * 1.5).toFixed(2)), 0.99),
          })
        }
      }

      // 2. Fetch products & pricing via gRPC
      const productRows = await this.api.listProducts(tenantId)

      for (const prod of productRows || []) {
        const textToMatch = `${prod.name} ${prod.description || ''} ${prod.sku || ''}`
        const score = this.computeSimilarity(query, textToMatch)
        if (score > 0.05) {
          chunks.push({
            id: prod.id,
            sourceType: 'PRODUCT',
            title: `Producto: ${prod.name}`,
            content: `Precio: $${prod.unitPrice || '0'} | ${prod.description || 'Sin descripción'}`,
            score: Math.min(Number((score * 1.3).toFixed(2)), 0.99),
          })
        }
      }
    } catch (err: any) {
      this.logger.warn(`Could not query gRPC services for RAG context: ${err.message}`)
    }

    // Sort descending by relevance score
    chunks.sort((a, b) => b.score - a.score)
    return chunks.slice(0, topK)
  }

  async generateGroundedReply(
    tenantId: string,
    params: {
      query: string
      authorName?: string
      platform?: string
      customPrompt?: string
    },
  ): Promise<GroundedReplyResult> {
    const chunks = await this.searchKnowledgeBase(tenantId, params.query, 3)
    const author = params.authorName || 'estimado cliente'
    const platform = params.platform || 'redes sociales'

    let replyText = ''

    if (chunks.length > 0) {
      const topSource = chunks[0]
      if (topSource.sourceType === 'PRODUCT') {
        replyText = `¡Hola ${author}! 🚀 Respecto a tu consulta en ${platform}: contamos con ${topSource.title} (${topSource.content}). Te hemos enviado todos los detalles a tu buzón privado.`
      } else {
        replyText = `¡Hola ${author}! ✨ Con gusto te informamos: según nuestras guías oficiales (${topSource.title}), "${topSource.content.replace(/\n+/g, ' ').slice(0, 140)}...". Te dejamos más info por mensaje privado.`
      }
    } else {
      replyText = `¡Hola ${author}! 🚀 Gracias por contactarnos en ${platform}. ${params.customPrompt || 'Te hemos enviado toda la información detallada por mensaje privado para atenderte de inmediato.'}`
    }

    this.logger.log(`RAG Grounded reply generated for ${author} with ${chunks.length} knowledge chunks`)

    return {
      replyText,
      retrievedChunks: chunks,
      sourceCount: chunks.length,
    }
  }
}
