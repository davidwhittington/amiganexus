import type { MiddlewareHandler } from 'hono'

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const method = c.req.method
  const path   = new URL(c.req.url).pathname

  await next()

  const ms     = Date.now() - start
  const status = c.res.status
  const level  = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

  console.log(JSON.stringify({
    level,
    time:   new Date().toISOString(),
    method,
    path,
    status,
    ms,
  }))
}
