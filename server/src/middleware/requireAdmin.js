import { supabaseAdmin } from '../supabaseAdmin.js'

export async function requireAdmin(req, res, next) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('es_admin')
    .eq('id', req.user.id)
    .single()

  if (error || !data?.es_admin) return res.status(403).json({ error: 'Requiere permisos de administrador' })
  next()
}
