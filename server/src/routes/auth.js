import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin.js'
import { requireAuth } from '../middleware/auth.js'
import { email } from '../lib/email.js'

export const authRouter = Router()

authRouter.post('/auth/bienvenida', requireAuth, async (req, res) => {
  const { data: perfil } = await supabaseAdmin.from('usuarios').select('nombre').eq('id', req.user.id).single()
  await email.bienvenida(req.user.email, perfil?.nombre || 'vecino/a')
  res.json({ ok: true })
})
