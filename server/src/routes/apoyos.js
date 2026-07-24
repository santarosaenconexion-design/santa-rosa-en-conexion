import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin.js'
import { requireAuth } from '../middleware/auth.js'

export const apoyosRouter = Router()

apoyosRouter.post('/reportes/:id/apoyar', requireAuth, async (req, res) => {
  const reporteId = req.params.id

  const { data: reporte, error: reporteError } = await supabaseAdmin
    .from('reportes')
    .select('id, apoyos_count, estado')
    .eq('id', reporteId)
    .single()

  if (reporteError || !reporte) return res.status(404).json({ error: 'Reporte no encontrado' })
  if (reporte.estado === 'rechazado') return res.status(409).json({ error: 'No se puede apoyar un reporte rechazado' })

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('apoyos')
    .insert({ reporte_id: reporteId, usuario_id: req.user.id })
    .select('id')

  if (insertError && insertError.code !== '23505') {
    return res.status(500).json({ error: 'No se pudo registrar el apoyo' })
  }

  const yaApoyado = insertError?.code === '23505' || !inserted?.length
  if (!yaApoyado) {
    // RPC atómica (UPDATE ... SET apoyos_count = apoyos_count + 1 en una sola sentencia)
    // evita perder incrementos si dos personas apoyan al mismo tiempo.
    const { data: nuevoCount, error: updateError } = await supabaseAdmin
      .rpc('incrementar_apoyos', { p_reporte_id: reporteId })
    if (updateError) return res.status(500).json({ error: 'No se pudo actualizar el contador de apoyos' })
    return res.json({ apoyos_count: nuevoCount, ya_apoyado: false })
  }

  return res.json({ apoyos_count: reporte.apoyos_count, ya_apoyado: true })
})
