import { HelpdeskThread } from '../../domain/entities/thread.entity'

type ThreadRow = {
  id: string
  tenantId: string
  conversationId: string
  threadType: string
  bodyHtml: string | null
  bodyText: string | null
  createdByUserId: string | null
  createdByCustomerId: string | null
  isDraft: boolean | null
  messageIdHeader: string | null
  toAddresses: string | null
  ccAddresses: string | null
  createdAt: Date
  updatedAt: Date
}

export class ThreadMapper {
  static toDomain(row: ThreadRow): HelpdeskThread {
    return new HelpdeskThread(
      row.id,
      row.tenantId,
      row.conversationId,
      row.threadType,
      row.bodyHtml,
      row.bodyText,
      row.createdByUserId,
      row.createdByCustomerId,
      row.isDraft ?? false,
      row.messageIdHeader,
      row.toAddresses,
      row.ccAddresses,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(thread: HelpdeskThread): ThreadRow {
    return {
      id: thread.id,
      tenantId: thread.tenantId,
      conversationId: thread.conversationId,
      threadType: thread.threadType,
      bodyHtml: thread.bodyHtml,
      bodyText: thread.bodyText,
      createdByUserId: thread.createdByUserId,
      createdByCustomerId: thread.createdByCustomerId,
      isDraft: thread.isDraft,
      messageIdHeader: thread.messageIdHeader,
      toAddresses: thread.toAddresses,
      ccAddresses: thread.ccAddresses,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }
  }

  static toResponse(thread: HelpdeskThread) {
    return {
      id: thread.id,
      conversationId: thread.conversationId,
      threadType: thread.threadType,
      bodyHtml: thread.bodyHtml,
      bodyText: thread.bodyText,
      createdByUserId: thread.createdByUserId,
      createdByCustomerId: thread.createdByCustomerId,
      isDraft: thread.isDraft,
      messageIdHeader: thread.messageIdHeader,
      toAddresses: thread.toAddresses,
      ccAddresses: thread.ccAddresses,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
    }
  }
}
