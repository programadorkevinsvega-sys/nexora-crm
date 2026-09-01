import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateNoteHandler, UpdateNoteHandler, DeleteNoteHandler } from '../../application/commands/interactions.handlers'
import { GetNoteHandler, ListNotesHandler } from '../../application/queries/interactions.handlers'
import { CreateNoteCommand, UpdateNoteCommand, DeleteNoteCommand } from '../../application/commands/interactions.commands'
import { GetNoteQuery, ListNotesQuery } from '../../application/queries/interactions.queries'
import { NoteMapper } from '../../infrastructure/interactions.mapper'

@Controller()
export class NotesGrpcController {
  constructor(
    private readonly createNoteHandler: CreateNoteHandler,
    private readonly updateNoteHandler: UpdateNoteHandler,
    private readonly deleteNoteHandler: DeleteNoteHandler,
    private readonly getNoteHandler: GetNoteHandler,
    private readonly listNotesHandler: ListNotesHandler,
  ) {}

  @GrpcMethod('InteractionService', 'CreateNote')
  async createNote(data: {
    tenantId: string
    content: string
    authorUserId: string
    contactId?: string
    companyId?: string
    dealId?: string
  }) {
    const result = await this.createNoteHandler.execute(
      new CreateNoteCommand(
        data.tenantId, data.content, data.authorUserId,
        data.contactId, data.companyId, data.dealId,
      ),
    )
    const note = await this.getNoteHandler.execute(
      new GetNoteQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(NoteMapper.toResponse(note)) }
  }

  @GrpcMethod('InteractionService', 'GetNote')
  async getNote(data: { tenantId: string; id: string }) {
    const note = await this.getNoteHandler.execute(
      new GetNoteQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(NoteMapper.toResponse(note)) }
  }

  @GrpcMethod('InteractionService', 'ListNotes')
  async listNotes(data: {
    tenantId: string
    cursor?: string
    limit?: number
    contactId?: string
    companyId?: string
    dealId?: string
  }) {
    const result = await this.listNotesHandler.execute(
      new ListNotesQuery(data.tenantId, {
        contactId: data.contactId,
        companyId: data.companyId,
        dealId: data.dealId,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map((n) => JSON.stringify(NoteMapper.toResponse(n))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('InteractionService', 'UpdateNote')
  async updateNote(data: {
    tenantId: string
    id: string
    content?: string
    contactId?: string
    companyId?: string
    dealId?: string
  }) {
    await this.updateNoteHandler.execute(
      new UpdateNoteCommand(
        data.tenantId, data.id, data.content,
        data.contactId, data.companyId, data.dealId,
      ),
    )
    return {}
  }

  @GrpcMethod('InteractionService', 'DeleteNote')
  async deleteNote(data: { tenantId: string; id: string }) {
    await this.deleteNoteHandler.execute(
      new DeleteNoteCommand(data.tenantId, data.id),
    )
    return {}
  }
}
