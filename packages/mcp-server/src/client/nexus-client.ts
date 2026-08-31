export interface NexusClientConfig {
  baseUrl?: string
  apiKey?: string
}

export class NexusClient {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(config: NexusClientConfig = {}) {
    this.baseUrl = (config.baseUrl || process.env.NEXUS_API_URL || 'http://localhost:3006').replace(/\/$/, '')
    this.apiKey = config.apiKey || process.env.NEXUS_API_KEY || ''
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
      headers['X-Api-Key'] = this.apiKey
    }

    const res = await fetch(url, { ...options, headers })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Nexus CRM API Error [${res.status} ${res.statusText}]: ${errorText}`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return res.json() as Promise<T>
    }
    return (await res.text()) as unknown as T
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' })
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' })
  }
}
