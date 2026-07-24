import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { apoyosRouter } from './routes/apoyos.js'
import { reportesRouter } from './routes/reportes.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'

const app = express()
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean)

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Origen no permitido por CORS'))
  },
}))
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }))
app.use((req, _res, next) => { console.log(req.method, req.path); next() })

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api', apoyosRouter)
app.use('/api', reportesRouter)
app.use('/api/admin', adminRouter)
app.use('/api', authRouter)

const port = process.env.PORT ?? 3001
app.listen(port, () => console.log(`Servidor escuchando en :${port}`))
