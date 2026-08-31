import { NextRequest, NextResponse } from 'next/server'

const BFF_BASE_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:3006/api'
const DEFAULT_TENANT_ID = process.env.CRM_DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000001'

interface AuthLoginResponse {
  accessToken: string
  refreshToken: string
  sessionId: string
  mfaRequired?: boolean
  user: {
    id: string
    tenantId: string
    email: string
    name?: string
    companyName?: string
  }
}

interface FrontendLoginResponse {
  token: string
  tenantId: string
  userId: string
  userName?: string
  userEmail?: string
  companyName?: string
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

  const email = typeof raw.email === 'string' ? raw.email : ''
  const password = typeof raw.password === 'string' ? raw.password : ''
  const tenantId = typeof raw.tenantId === 'string' ? raw.tenantId : DEFAULT_TENANT_ID

  if (!email || !password) {
    return NextResponse.json(
      { message: 'email and password are required' },
      { status: 400 },
    )
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? undefined
  const userAgent = request.headers.get('user-agent') ?? undefined

  const upstreamResponse = await fetch(`${BFF_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      email,
      password,
      ipAddress,
      userAgent,
    }),
    cache: 'no-store',
  })

  const upstreamData = await parseJsonOrText<AuthLoginResponse>(upstreamResponse)

  if (!upstreamResponse.ok) {
    const message =
      upstreamData &&
      typeof upstreamData === 'object' &&
      'message' in upstreamData &&
      typeof upstreamData.message === 'string'
        ? upstreamData.message
        : 'Login failed'

    return NextResponse.json(
      { message, details: upstreamData },
      { status: upstreamResponse.status },
    )
  }

  if (!upstreamData || typeof upstreamData !== 'object') {
    return NextResponse.json(
      { message: 'Invalid login response from auth service' },
      { status: 502 },
    )
  }

  const authData = upstreamData as AuthLoginResponse

  if (authData.mfaRequired) {
    return NextResponse.json(
      { message: 'MFA code required for this account' },
      { status: 401 },
    )
  }

  if (
    !authData.accessToken ||
    !authData.refreshToken ||
    !authData.sessionId ||
    !authData.user?.id ||
    !authData.user?.tenantId
  ) {
    return NextResponse.json(
      { message: 'Incomplete login response from auth service' },
      { status: 502 },
    )
  }

  const frontendResponse: FrontendLoginResponse = {
    token: authData.accessToken,
    tenantId: authData.user.tenantId,
    userId: authData.user.id,
    userName: authData.user.name,
    userEmail: authData.user.email,
    companyName: authData.user.companyName,
  }

  const response = NextResponse.json(frontendResponse)
  response.cookies.set('session_token', authData.accessToken, cookieOptions(60 * 15))
  response.cookies.set('refresh_token', authData.refreshToken, cookieOptions(60 * 60 * 24 * 30))
  response.cookies.set('session_id', authData.sessionId, cookieOptions(60 * 60 * 24 * 30))
  response.cookies.set('tenant_id', authData.user.tenantId, cookieOptions(60 * 60 * 24 * 30))
  response.cookies.set('user_id', authData.user.id, cookieOptions(60 * 60 * 24 * 30))
  if (authData.user.name) {
    response.cookies.set('user_name', encodeURIComponent(authData.user.name), cookieOptions(60 * 60 * 24 * 30))
  }
  if (authData.user.companyName) {
    response.cookies.set('company_name', encodeURIComponent(authData.user.companyName), cookieOptions(60 * 60 * 24 * 30))
  }

  return response
}
