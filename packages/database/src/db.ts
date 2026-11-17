import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './index'

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

let db: DrizzleDb | null = null

export function getDb(): DrizzleDb {
  if (!db) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error('DATABASE_URL is required')

    const client = postgres(connectionString, {
      max: Number(process.env.DATABASE_MAX_CONNECTIONS) || 25,
    })

    db = drizzle(client, { schema })
  }
  return db
}
