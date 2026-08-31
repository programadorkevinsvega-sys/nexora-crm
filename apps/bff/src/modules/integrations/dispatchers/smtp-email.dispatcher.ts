import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class SmtpEmailDispatcher {
  private readonly logger = new Logger(SmtpEmailDispatcher.name)

  async test(
    creds: Record<string, any>,
    recipient: string,
    text: string,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const { host, port, secure, username, password, fromEmail, fromName } = creds

    if (!host || !port || !username || !password || !fromEmail) {
      throw new BadRequestException('Configuración SMTP incompleta: host, port, username, password y fromEmail son requeridos')
    }

    const transporter = nodemailer.createTransport({
      host: host.trim(),
      port: Number(port),
      secure: secure === true || Number(port) === 465,
      auth: { user: username.trim(), pass: password },
      connectionTimeout: 10_000,
      greetingTimeout: 8_000,
      socketTimeout: 10_000,
      tls: { rejectUnauthorized: false },
    })

    try {
      await transporter.verify()
    } catch (err: any) {
      this.logger.warn(`SMTP verify failed for ${host}: ${err.message}`)
      return {
        success: false,
        message: `No se pudo conectar al servidor SMTP (${host}:${port}): ${err.message}`,
      }
    }

    try {
      const info = await transporter.sendMail({
        from: `"${fromName || 'Nexora CRM'}" <${fromEmail}>`,
        to: recipient,
        subject: '✅ Prueba de Conexión — Nexora CRM',
        text,
        html: `<p>${text}</p><hr/><small>Enviado desde Nexora CRM vía ${host}</small>`,
      })

      this.logger.log(`SMTP test sent: ${info.messageId} to ${recipient}`)
      return {
        success: true,
        message: `Correo de prueba enviado a ${recipient} vía ${host}:${port} (ID: ${info.messageId})`,
        details: { messageId: info.messageId, host, port },
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Error enviando correo: ${err.message}`,
        details: { host, port },
      }
    }
  }

  async sendEmail(
    creds: Record<string, any>,
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const { host, port, secure, username, password, fromEmail, fromName } = creds

    const transporter = nodemailer.createTransport({
      host: host.trim(),
      port: Number(port),
      secure: secure === true || Number(port) === 465,
      auth: { user: username.trim(), pass: password },
      tls: { rejectUnauthorized: false },
    })

    const info = await transporter.sendMail({
      from: `"${fromName || 'Nexora CRM'}" <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    })

    return { success: true, messageId: info.messageId }
  }
}
