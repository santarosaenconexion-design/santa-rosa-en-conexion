const RESEND_API_KEY = process.env.RESEND_API_KEY

function templateBase(contenido) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Santa Rosa en Conexión</title>
</head>
<body style="margin:0;padding:0;background:#F0F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4F6;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(28,58,74,0.10);">
        <tr>
          <td style="background:#1C3A4A;padding:28px 36px;border-bottom:3px solid #2A9DC8;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#7DD4E8;letter-spacing:-0.5px;">Santa Rosa en Conexión</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.45);">Plataforma ciudadana de reportes urbanos</p>
          </td>
        </tr>
        <tr><td style="padding:36px 36px 28px;">${contenido}</td></tr>
        <tr>
          <td style="background:#F9FAFB;padding:20px 36px;border-top:1px solid #E5E7EB;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;">
              Santa Rosa en Conexión · Santa Rosa, La Pampa<br/>
              Este es un mensaje automático, no respondas este email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`
}

function templateBienvenida(nombre) {
  return templateBase(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#1C3A4A;font-weight:800;">¡Bienvenido/a, ${nombre}! 👋</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#6B7280;">Ya sos parte de la comunidad de Santa Rosa en Conexión.</p>
    <div style="background:#EBF5FB;border-left:4px solid #2A9DC8;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#1C3A4A;">Tu cuenta está activa. Ahora podés <strong>reportar problemas urbanos</strong> en tu barrio y apoyar los reportes de otros vecinos.</p>
    </div>
    <a href="https://santarosaenconexion.netlify.app" style="display:inline-block;background:#2A9DC8;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Ir al mapa →</a>
  `)
}

function templateAprobado(nombre, calle, categoria) {
  return templateBase(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#EAFAF1;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✅</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;color:#1C3A4A;font-weight:800;text-align:center;">¡Tu reporte fue aprobado!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#6B7280;text-align:center;">Hola ${nombre}, tu reporte ya es visible en el mapa público.</p>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#1C3A4A;">${calle}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">Categoría: ${categoria}</p>
    </div>
    <a href="https://santarosaenconexion.netlify.app" style="display:inline-block;background:#2A9DC8;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Ver en el mapa →</a>
  `)
}

function templateRechazado(nombre, calle, motivo) {
  return templateBase(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#FDEDEC;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">❌</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;color:#1C3A4A;font-weight:800;text-align:center;">Tu reporte no fue aprobado</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#6B7280;text-align:center;">Hola ${nombre}, revisamos tu reporte y no pudimos publicarlo.</p>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#1C3A4A;">${calle}</p>
    </div>
    <div style="background:#FFF8E1;border-left:4px solid #F1C40F;border-radius:6px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;font-weight:600;">Motivo del rechazo</p>
      <p style="margin:0;font-size:13px;color:#374151;">${motivo}</p>
    </div>
    <a href="https://santarosaenconexion.netlify.app/reportar" style="display:inline-block;background:#2A9DC8;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Enviar nuevo reporte →</a>
  `)
}

async function enviar(to, subject, html) {
  if (!RESEND_API_KEY) { console.warn('RESEND_API_KEY no configurada, no se envía email a', to); return }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Santa Rosa en Conexión <onboarding@resend.dev>', to, subject, html }),
  })
  if (!res.ok) console.error('Error enviando email:', await res.text())
}

export const email = {
  bienvenida: (to, nombre) => enviar(to, '¡Bienvenido/a a Santa Rosa en Conexión!', templateBienvenida(nombre)),
  aprobado: (to, nombre, calle, categoria) => enviar(to, '✅ Tu reporte fue aprobado', templateAprobado(nombre, calle, categoria)),
  rechazado: (to, nombre, calle, motivo) => enviar(to, 'Tu reporte no pudo ser publicado', templateRechazado(nombre, calle, motivo)),
}
