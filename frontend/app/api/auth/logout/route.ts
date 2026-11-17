import { NextRequest, NextResponse } from 'next/server'

const BFF_BASE_URL = process.env.INTERNAL_BFF_URL ?? process.env.NEXT_PUBLIC_BFF_URL ?? 'http://127.0.0.1:3006/api'

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export async function POST(request: NextRequest) {
  const tenantId = request.cookies.get('tenant_id')?.value
  const sessionId = request.cookies.get('session_id')?.value

  if (tenantId && sessionId) {
    await fetch(`${BFF_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, sessionId }),
      cache: 'no-store',
    }).catch(() => undefined)
  }

  const response = NextResponse.json({ ok: true })
  clearCookie(response, 'session_token')
  clearCookie(response, 'refresh_token')
  clearCookie(response, 'session_id')
  clearCookie(response, 'tenant_id')
  clearCookie(response, 'user_id')

  return response
}
