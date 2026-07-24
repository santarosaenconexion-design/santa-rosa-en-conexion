import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin.js'
import { requireAuth } from '../middleware/auth.js'
import { dentroDeSantaRosa } from '../lib/geofence.js'

export const reportesRouter = Router()

reportesRouter.post('/reportes', requireAuth, async (req, res) => {
  const { calle, entre_calles, descripcion, categoria_id, barrio_id, foto_url, lat, lng } = req.body ?? {}

  if (!calle || !entre_calles || !categoria_id || !barrio_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  let ubicacion = null
  if (lat != null && lng != null) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || !dentroDeSantaRosa(lat, lng)) {
      return res.status(422).json({ error: 'La ubicación está fuera de Santa Rosa' })
    }
    ubicacion = `POINT(${lng} ${lat})`

    const { data: cercanos, error: cercanosError } = await supabaseAdmin
      .rpc('reportes_cercanos', { lat, lng, radio_metros: 100 })
    if (cercanosError) return res.status(500).json({ error: 'No se pudo verificar duplicados' })
    if (cercanos?.length > 0) {
      return res.status(409).json({ duplicado: cercanos[0] })
    }
  }

  const { data: creado, error: insertError } = await supabaseAdmin
    .from('reportes')
    .insert({
      calle, entre_calles, descripcion,
      categoria_id, barrio_id: barrio_id === 'otro' ? null : barrio_id,
      foto_url: foto_url || '',
      usuario_id: req.user.id,
      ubicacion,
      estado: 'pendiente',
    })
    .select()
    .single()

  if (insertError) return res.status(500).json({ error: 'No se pudo crear el reporte' })
  res.status(201).json(creado)
})
