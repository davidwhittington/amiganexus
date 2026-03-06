import type { MiddlewareHandler } from 'hono'

const ADMIN_KEY = process.env.ADMIN_API_KEY

export const adminAuth: MiddlewareHandler = async (c, next) => {
  if (!ADMIN_KEY) {
    return c.json({ error: 'Admin API key not configured' }, 500)
  }

  const authHeader = c.req.header('Authorization')
  const token      = authHeader?.startsWith('Bearer ')
                   ? authHeader.slice(7)
                   : null

  if (!token || token !== ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
}
