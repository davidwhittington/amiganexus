import { Hono } from 'hono'

const START = Date.now()

export const health = new Hono()

health.get('/', (c) => {
  const uptimeMs = Date.now() - START
  const uptimeSec = Math.floor(uptimeMs / 1000)

  return c.json({
    status:  'ok',
    service: 'amiganexus',
    version: '0.1.0',
    uptime:  `${uptimeSec}s`,
    time:    new Date().toISOString(),
  })
})
