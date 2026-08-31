import { NextRequest, NextResponse } from 'next/server'

const BFF_BASE_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:3006/api'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  const upstreamResponse = await fetch(`${BFF_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const data = await upstreamResponse.json().catch(() => null)

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      { message: data?.message || 'Registration failed', details: data },
      { status: upstreamResponse.status },
    )
  }

  return NextResponse.json(data)
}
