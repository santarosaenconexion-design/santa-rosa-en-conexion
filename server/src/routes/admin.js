import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { email } from '../lib/email.js'

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

async function cargarReporteConUsuario(id) {
  const { data } = await supabaseAdmin
    .from('reportes')
    .select('*, categorias(nombre, icono), usuarios(nombre, email)')
    .eq('id', id)
    .single()
  return data
}

adminRouter.post('/reportes/:id/aprobar', async (req, res) => {
  const { data: actualizado, error } = await supabaseAdmin
    .from('reportes')
    .update({ estado: 'aprobado', aprobado_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error || !actualizado) return res.status(404).json({ error: 'Reporte no encontrado' })

  const reporte = await cargarReporteConUsuario(req.params.id)
  if (reporte?.usuarios?.email) {
    email.aprobado(reporte.usuarios.email, reporte.usuarios.nombre ?? 'vecino/a', reporte.calle, reporte.categorias?.nombre ?? '')
  }
  res.json(actualizado)
})

adminRouter.post('/reportes/:id/rechazar', async (req, res) => {
  const { motivo } = req.body ?? {}
  if (!motivo) return res.status(400).json({ error: 'Falta el motivo del rechazo' })

  const { data: actualizado, error } = await supabaseAdmin
    .from('reportes')
    .update({ estado: 'rechazado', motivo_rechazo: motivo })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error || !actualizado) return res.status(404).json({ error: 'Reporte no encontrado' })

  const reporte = await cargarReporteConUsuario(req.params.id)
  if (reporte?.usuarios?.email) {
    email.rechazado(reporte.usuarios.email, reporte.usuarios.nombre ?? 'vecino/a', reporte.calle, motivo)
  }
  res.json(actualizado)
})
