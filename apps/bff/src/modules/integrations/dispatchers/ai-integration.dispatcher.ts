import { Injectable, BadRequestException } from '@nestjs/common'

@Injectable()
export class AiIntegrationDispatcher {
  async test(creds: Record<string, any>, promptText = 'Di "Conexión exitosa a Nexus CRM" en menos de 10 palabras') {
    const baseUrl = (creds.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')
    const apiKey = creds.apiKey || ''
    const model = creds.model || 'gpt-4o-mini'

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Eres el motor de Inteligencia Artificial de Nexus CRM. Responde de forma muy concisa.',
            },
            {
              role: 'user',
              content: promptText,
            },
          ],
          max_tokens: 60,
          temperature: 0.7,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          message: `Error del proveedor AI (${baseUrl}): ${data.error?.message || res.statusText}`,
          details: data,
        }
      }

      const reply = data.choices?.[0]?.message?.content || 'Respuesta generada correctamente'
      return {
        success: true,
        message: `¡Conexión AI exitosa con el modelo "${model}"! Respuesta: "${reply.trim()}"`,
        details: { model, reply },
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Fallo al conectar con (${baseUrl}): ${err.message}. Verifica que el endpoint esté activo.`,
      }
    }
  }
}
