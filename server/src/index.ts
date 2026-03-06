import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

import { logger }  from './middleware/logger'
import { health }  from './routes/health'
import { warps }   from './routes/warps'
import { signals } from './routes/signals'

const app = new Hono()

// ── Global middleware ──────────────────────────────────────────────
app.use('*', logger)
app.use('*', secureHeaders())
app.use('*', cors({
  origin:  ['https://amiganexus.com', 'https://www.amiganexus.com'],
  methods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ── Routes ─────────────────────────────────────────────────────────
app.route('/health',      health)
app.route('/api/warps',   warps)
app.route('/api/signals', signals)

// 404 catch-all
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// ── Start ──────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000

export default {
  port:  PORT,
  fetch: app.fetch,
}

console.log(JSON.stringify({
  level:   'info',
  time:    new Date().toISOString(),
  message: `Amiga Nexus server started`,
  port:    PORT,
}))
