/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'

export interface ConsumerHandler {
  eventType: string
  handler: (payload: Record<string, unknown>, eventId: string, subject: string) => Promise<void>
}

export async function sendToDeadLetter(
  db: any, deadLetterTable: any, subject: string, reason: string, payload: Record<string, unknown>,
  sourceService: string, attempts: number,
): Promise<void> {
  try {
    await db.insert(deadLetterTable).values({
      id: randomUUID(), outboxEventId: randomUUID(),
      subject, reason, payload, attempts,
      sourceService, eventType: subject.split('.').slice(1).join('.'),
      createdAt: new Date(),
    }).onConflictDoNothing()
  } catch {
    // Dead-letter persistence is best-effort and must not mask the original failure.
  }
}
