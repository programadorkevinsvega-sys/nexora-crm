import { Injectable } from '@nestjs/common'
import { asRecord, credentialString, errorMessage, type IntegrationCredentials } from './dispatcher-utils'

@Injectable()
export class AiIntegrationDispatcher {
  async test(creds: IntegrationCredentials, promptText = 'Di "Conexión exitosa a Nexora CRM" en menos de 10 palabras') {
    const baseUrl = (credentialString(creds, 'baseUrl') || 'https://api.openai.com/v1').replace(/\/+$/, '')
    const apiKey = credentialString(creds, 'apiKey') || ''
    const model = credentialString(creds, 'model') || 'gpt-4o-mini'
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST', headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Eres el motor de Inteligencia Artificial de Nexora CRM. Responde de forma muy concisa.' },
            { role: 'user', content: promptText },
          ],
          max_tokens: 60, temperature: 0.7,
        }),
      })
      const data: unknown = await res.json()
      const response = asRecord(data)
      const providerError = asRecord(response.error)
      if (!res.ok) return {
        success: false,
        message: `Error del proveedor AI (${baseUrl}): ${typeof providerError.message === 'string' ? providerError.message : res.statusText}`,
        details: data,
      }
      const choices = Array.isArray(response.choices) ? response.choices : []
      const message = asRecord(asRecord(choices[0]).message)
      const reply = typeof message.content === 'string' ? message.content : 'Respuesta generada correctamente'
      return { success: true, message: `¡Conexión AI exitosa con el modelo "${model}"! Respuesta: "${reply.trim()}"`, details: { model, reply } }
    } catch (err: unknown) {
      return { success: false, message: `Fallo al conectar con (${baseUrl}): ${errorMessage(err)}. Verifica que el endpoint esté activo.` }
    }
  }
}
