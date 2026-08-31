import { NextRequest, NextResponse } from 'next/server'

const BFF_BASE_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:3006/api'
const DEFAULT_TENANT_ID = process.env.CRM_DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000001'

interface AuthRefreshResponse {
  accessToken: string
  refreshToken: string
  sessionId: string
}

async function parseJsonOrText<T>(res: Response): Promise<T | string | null> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return text
  }
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const raw = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}

  const tenantIdCookie = request.cookies.get('tenant_id')?.value
  const refreshTokenCookie = request.cookies.get('refresh_token')?.value

  const tenantId =
    (typeof raw.tenantId === 'string' && raw.tenantId) ||
    tenantIdCookie ||
    DEFAULT_TENANT_ID
  const refreshToken =
    (typeof raw.refreshToken === 'string' && raw.refreshToken) ||
    refreshTokenCookie

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'refresh token is required' },
      { status: 400 },
    )
  }

  const upstreamResponse = await fetch(`${BFF_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, refreshToken }),
    cache: 'no-store',
  })

  const upstreamData = await parseJsonOrText<AuthRefreshResponse>(upstreamResponse)

  if (!upstreamResponse.ok) {
    const message =
      upstreamData &&
      typeof upstreamData === 'object' &&
      'message' in upstreamData &&
      typeof upstreamData.message === 'string'
        ? upstreamData.message
        : 'Token refresh failed'

    return NextResponse.json(
      { message, details: upstreamData },
      { status: upstreamResponse.status },
    )
  }

  if (!upstreamData || typeof upstreamData !== 'object') {
    return NextResponse.json(
      { message: 'Invalid refresh response from auth service' },
      { status: 502 },
    )
  }

  const authData = upstreamData as AuthRefreshResponse
  if (!authData.accessToken || !authData.refreshToken || !authData.sessionId) {
    return NextResponse.json(
      { message: 'Incomplete refresh response from auth service' },
      { status: 502 },
    )
  }

  const response = NextResponse.json({ token: authData.accessToken })
  response.cookies.set('session_token', authData.accessToken, cookieOptions(60 * 15))
  response.cookies.set('refresh_token', authData.refreshToken, cookieOptions(60 * 60 * 24 * 30))
  response.cookies.set('session_id', authData.sessionId, cookieOptions(60 * 60 * 24 * 30))
  response.cookies.set('tenant_id', tenantId, cookieOptions(60 * 60 * 24 * 30))

  return response
}
