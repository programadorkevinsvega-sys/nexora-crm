import { Injectable, BadRequestException, Logger } from '@nestjs/common'

const GOOGLE_OAUTH2_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo'

@Injectable()
export class GoogleWorkspaceDispatcher {
  private readonly logger = new Logger(GoogleWorkspaceDispatcher.name)

  async test(
    creds: Record<string, any>,
    _recipient: string,
    _text: string,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const { clientId, clientSecret, redirectUri, syncCalendar, syncGmail } = creds

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google Client ID y Client Secret son requeridos')
    }

    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      return {
        success: false,
        message: 'El Client ID de Google no tiene el formato correcto. Debe terminar en .apps.googleusercontent.com',
      }
    }

    const scopes = [
      ...(syncCalendar ? ['https://www.googleapis.com/auth/calendar'] : []),
      ...(syncGmail ? ['https://www.googleapis.com/auth/gmail.send'] : []),
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ')

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri || 'http://localhost:3000/api/auth/callback/google')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    this.logger.log(`Google Workspace config validated for clientId=${clientId.slice(0, 20)}...`)
    return {
      success: true,
      message: `Credenciales de Google Workspace validadas. Servicios: ${syncCalendar ? 'Google Calendar' : ''}${syncCalendar && syncGmail ? ' + ' : ''}${syncGmail ? 'Gmail' : ''}. Para activar, completa el flujo OAuth2 haciendo clic en el enlace generado.`,
      details: {
        clientId: `${clientId.slice(0, 20)}...`,
        redirectUri,
        scopes: scopes.split(' '),
        authUrl: authUrl.toString(),
      },
    }
  }

  async exchangeCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    const res = await fetch(GOOGLE_OAUTH2_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    if (!res.ok) {
      const err = await res.json() as { error: string; error_description?: string }
      throw new Error(`Google OAuth2 token exchange failed: ${err.error_description || err.error}`)
    }

    const tokens = await res.json() as { access_token: string; refresh_token: string }
    const infoRes = await fetch(`${GOOGLE_TOKENINFO_URL}?access_token=${tokens.access_token}`)
    const info = await infoRes.json() as { email?: string }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      email: info.email || '',
    }
  }
}
