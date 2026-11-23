import 'dotenv/config'
import postgres from 'postgres'
import fs from 'node:fs'
import path from 'node:path'

function isAlreadyExistsError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const candidate = error as { code?: unknown; message?: unknown }
  return candidate.code === '42P07' ||
    (typeof candidate.message === 'string' && candidate.message.includes('already exists'))
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const sql = postgres(connectionString, { max: 1 })
  const migrationsDir = path.resolve(__dirname, 'migrations')

  await sql`
    CREATE TABLE IF NOT EXISTS public.crm_schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const appliedRows = await sql`SELECT filename FROM public.crm_schema_migrations`
  const appliedFiles = new Set(appliedRows.map(row => row.filename))

  if (files.length === 0) {
    console.log('No migration files found in', migrationsDir)
    await sql.end()
    return
  }

  for (const file of files) {
    if (appliedFiles.has(file)) {
      console.log(`Skipping already applied migration: ${file}`)
      continue
    }

    const filePath = path.join(migrationsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    console.log(`Applying migration: ${file}`)
    const statements = content
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(Boolean)

    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt)
      } catch (err: unknown) {
        if (isAlreadyExistsError(err)) continue
        throw err
      }
    }
    await sql`INSERT INTO public.crm_schema_migrations (filename) VALUES (${file})`
    appliedFiles.add(file)
    console.log(`  ✓ ${file}`)
  }

  console.log('All migrations applied successfully')
  await sql.end()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
