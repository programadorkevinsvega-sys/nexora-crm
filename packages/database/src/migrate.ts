import 'dotenv/config'
import postgres from 'postgres'
import fs from 'node:fs'
import path from 'node:path'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const sql = postgres(connectionString, { max: 1 })
  const migrationsDir = path.resolve(__dirname, 'migrations')

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('No migration files found in', migrationsDir)
    await sql.end()
    return
  }

  for (const file of files) {
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
      } catch (err: any) {
        if (err.code === '42P07' || err.message?.includes('already exists')) {
          continue
        }
        throw err
      }
    }
    console.log(`  ✓ ${file}`)
  }

  console.log('All migrations applied successfully')
  await sql.end()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
