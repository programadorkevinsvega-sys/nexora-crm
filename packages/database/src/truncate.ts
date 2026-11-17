import 'dotenv/config'
import postgres from 'postgres'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const sql = postgres(connectionString, { max: 1 })

  const schemas = ['public', 'users', 'auth', 'iam', 'tenants', 'notifications', 'audit', 'storage', 'scheduler']
  for (const s of schemas) {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = ${s} AND table_type = 'BASE TABLE' ORDER BY table_name`
    if (tables.length > 0) {
      const names = tables.map(t => `"${s}"."${t.table_name}"`).join(', ')
      await sql.unsafe('TRUNCATE ' + names + ' CASCADE')
    }
  }

  console.log('All tables truncated')
  await sql.end()
}

main().catch((err) => {
  console.error('Truncate failed:', err)
  process.exit(1)
})
