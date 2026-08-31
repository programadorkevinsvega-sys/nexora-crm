import { EmailTemplate, EmailBlock } from './email-template-types'

export function renderTemplateToHtml(template: EmailTemplate): string {
  const blocksHtml = (template.body?.blocks || []).map(renderBlock).join('\n')
  const globalStyles = styleObjectToString(template.body?.globalStyle || {})

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.subject || 'Nexora CRM Newsletter'}</title>
  </head>
  <body style="margin: 0; padding: 24px 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; ${globalStyles}">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #18181b; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
            <tr>
              <td style="padding: 32px 24px;">
                ${blocksHtml}
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px; background-color: #09090b; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a;">
                <p style="margin: 0 0 8px 0;">Has recibido este correo electrónico porque estás suscrito a Nexora CRM.</p>
                <a href="{{UNSUBSCRIBE_URL}}" style="color: #06b6d4; text-decoration: underline;">Darse de baja</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <img src="{{TRACKING_PIXEL_URL}}" width="1" height="1" style="display:none;" alt="" />
  </body>
</html>`
}

function renderBlock(block: EmailBlock): string {
  const styleString = styleObjectToString(block.style || {})

  switch (block.type) {
    case 'text':
      return `<div style="${styleString}; line-height: 1.6; margin-bottom: 16px;">${block.content || ''}</div>`
    case 'image':
      return `<div style="text-align: ${(block.style?.textAlign as any) || 'center'}; margin-bottom: 16px;"><img src="${block.url || ''}" alt="${block.altText || ''}" style="${styleString}; max-width: 100%; height: auto; border-radius: 8px;" /></div>`
    case 'button':
      return `<div style="text-align: ${(block.style?.textAlign as any) || 'center'}; margin: 24px 0;">
        <a href="${block.url || '#'}" style="${styleString}; display: inline-block; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none;">
          ${block.content || 'Click Here'}
        </a>
      </div>`
    case 'spacer':
      return `<div style="height: ${block.style?.height || '24px'};"></div>`
    case 'divider':
      return `<hr style="${styleString}; border-top: 1px solid #27272a; border-bottom: none; margin: 24px 0;" />`
    default:
      return ''
  }
}

function styleObjectToString(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      return `${cssKey}: ${value};`
    })
    .join(' ')
}
