type TenantContextDatabase = {
  session?: {
    client?: (strings: TemplateStringsArray, ...values: string[]) => PromiseLike<unknown>
  }
}

export async function setTenantContext(db: TenantContextDatabase, tenantId: string): Promise<void> {
  try {
    const sql = db?.session?.client
    if (sql) {
      await sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
    }
  } catch {
    // Preserve existing best-effort behavior when tenant context cannot be set.
  }
}

export async function withTenant<T>(
  db: TenantContextDatabase,
  tenantId: string | null | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  if (tenantId) {
    await setTenantContext(db, tenantId)
  }
  return fn()
}
