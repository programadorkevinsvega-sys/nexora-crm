import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { credentialNumber, credentialString, errorMessage, type IntegrationCredentials } from './dispatcher-utils'

@Injectable()
export class SmtpEmailDispatcher {
  private readonly logger = new Logger(SmtpEmailDispatcher.name)
  private createTransporter(credentials: IntegrationCredentials) {
    const host = credentialString(credentials, 'host')
    const port = credentialNumber(credentials, 'port')
    const username = credentialString(credentials, 'username')
    const password = credentialString(credentials, 'password')
    if (!host || !port || !username || !password) {
      throw new BadRequestException('Configuración SMTP incompleta: host, port, username y password son requeridos')
    }
    return {
      host, port, username, password,
      fromEmail: credentialString(credentials, 'fromEmail'),
      fromName: credentialString(credentials, 'fromName'),
      transporter: nodemailer.createTransport({
        host, port, secure: credentials.secure === true || port === 465,
        auth: { user: username, pass: password },
        connectionTimeout: 10_000, greetingTimeout: 8_000, socketTimeout: 10_000,
        tls: { rejectUnauthorized: false },
      }),
    }
  }
  async test(creds: IntegrationCredentials, recipient: string, text: string): Promise<{ success: boolean; message: string; details?: unknown }> {
    const config = this.createTransporter(creds)
    if (!config.fromEmail) throw new BadRequestException('fromEmail es requerido para SMTP')
    try {
      await config.transporter.verify()
    } catch (err: unknown) {
      const message = errorMessage(err)
      this.logger.warn(`SMTP verify failed for ${config.host}: ${message}`)
      return { success: false, message: `No se pudo conectar al servidor SMTP (${config.host}:${config.port}): ${message}` }
    }
    try {
      const info = await config.transporter.sendMail({
        from: `"${config.fromName || 'Nexora CRM'}" <${config.fromEmail}>`,
        to: recipient, subject: '✅ Prueba de Conexión — Nexora CRM', text,
        html: `<p>${text}</p><hr/><small>Enviado desde Nexora CRM vía ${config.host}</small>`,
      })
      this.logger.log(`SMTP test sent: ${info.messageId} to ${recipient}`)
      return { success: true, message: `Correo de prueba enviado a ${recipient} vía ${config.host}:${config.port} (ID: ${info.messageId})`,
        details: { messageId: info.messageId, host: config.host, port: config.port } }
    } catch (err: unknown) {
      return { success: false, message: `Error enviando correo: ${errorMessage(err)}`, details: { host: config.host, port: config.port } }
    }
  }
  async sendEmail(creds: IntegrationCredentials, to: string, subject: string, html: string, text?: string): Promise<{ success: boolean; messageId?: string }> {
    const config = this.createTransporter(creds)
    if (!config.fromEmail) throw new BadRequestException('fromEmail es requerido para SMTP')
    const info = await config.transporter.sendMail({ from: `"${config.fromName || 'Nexora CRM'}" <${config.fromEmail}>`,
      to, subject, html, text: text || html.replace(/<[^>]+>/g, '') })
    return { success: true, messageId: info.messageId }
  }
  async sendBulkMail(creds: IntegrationCredentials, recipients: string[], subject: string, htmlTemplate: string): Promise<{ sent: number; failed: number }> {
    const config = this.createTransporter(creds)
    if (!config.fromEmail) throw new BadRequestException('fromEmail es requerido para SMTP')
    const transporter = nodemailer.createTransport({
      host: config.host, port: config.port, secure: config.port === 465,
      auth: { user: config.username, pass: config.password }, tls: { rejectUnauthorized: false },
      pool: true, maxConnections: 5, maxMessages: 100,
    })
    let sent = 0
    let failed = 0
    for (const to of recipients) {
      try {
        const html = htmlTemplate.replace(/\{\{email\}\}/g, to)
        await transporter.sendMail({ from: `"${config.fromName || 'Nexora CRM'}" <${config.fromEmail}>`,
          to, subject, html, text: html.replace(/<[^>]+>/g, '') })
        sent++
      } catch (err: unknown) {
        this.logger.error(`Failed to send email to ${to}: ${errorMessage(err)}`)
        failed++
      }
    }
    transporter.close()
    return { sent, failed }
  }
}