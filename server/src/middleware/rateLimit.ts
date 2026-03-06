import type { MiddlewareHandler } from 'hono'

interface Window {
  count:     number
  resetAt:   number
}

// In-memory store — resets on process restart.
// Fine for Phase 2; swap for Redis in Phase 5 if needed.
const store = new Map<string, Window>()

/**
 * Simple sliding-window rate limiter.
 * @param max     Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(max: number, windowMs: number): MiddlewareHandler {
  return async (c, next) => {
    const ip  = c.req.header('x-forwarded-for')?.split(',')[0].trim()
               ?? c.req.header('x-real-ip')
               ?? 'unknown'
    const key = `${c.req.method}:${new URL(c.req.url).pathname}:${ip}`
    const now = Date.now()

    let win = store.get(key)
    if (!win || now > win.resetAt) {
      win = { count: 0, resetAt: now + windowMs }
      store.set(key, win)
    }

    win.count++

    c.header('X-RateLimit-Limit',     String(max))
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - win.count)))
    c.header('X-RateLimit-Reset',     String(Math.ceil(win.resetAt / 1000)))

    if (win.count > max) {
      return c.json({ error: 'Too many requests' }, 429)
    }

    await next()
  }
}
