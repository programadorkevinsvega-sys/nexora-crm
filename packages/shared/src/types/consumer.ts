import { randomUUID } from 'node:crypto'

export interface ConsumerHandler {
  eventType: string
  handler: (payload: Record<string, unknown>, eventId: string, subject: string) => Promise<void>
}

export interface DeadLetterRecord {
  id: string
  outboxEventId: string
  subject: string
  reason: string
  payload: Record<string, unknown>
  attempts: number
  sourceService: string
  eventType: string
  createdAt: Date
}

export async function sendToDeadLetter(
  persist: (record: DeadLetterRecord) => PromiseLike<unknown> | unknown,
  subject: string,
  reason: string,
  payload: Record<string, unknown>,
  sourceService: string,
  attempts: number,
): Promise<void> {
  const record: DeadLetterRecord = {
    id: randomUUID(),
    outboxEventId: randomUUID(),
    subject,
    reason,
    payload,
    attempts,
    sourceService,
    eventType: subject.split('.').slice(1).join('.'),
    createdAt: new Date(),
  }
  try {
    await persist(record)
  } catch {
    // Dead-letter persistence is best-effort and must not mask the original failure.
  }
}
