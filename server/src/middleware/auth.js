import { supabaseAdmin } from '../supabaseAdmin.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Falta el token de autenticación' })

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    console.error('requireAuth falló:', error?.message)
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  req.user = { id: data.user.id, email: data.user.email }
  next()
}
