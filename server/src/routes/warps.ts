import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import { rateLimit } from '../middleware/rateLimit'

export const warps = new Hono()

// POST /api/warps
// Log an anonymous warp event. No PII stored — just destination slug/URL + timestamp.
warps.post('/', rateLimit(20, 60_000), async (c) => {
  let body: { destination?: string; label?: string }

  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const destination = body.destination?.trim()
  const label       = body.label?.trim() ?? null

  if (!destination) {
    return c.json({ error: 'destination is required' }, 400)
  }

  // Sanity-check it looks like a URL or slug — don't store arbitrary data
  const isUrl = /^https?:\/\//i.test(destination)
  if (!isUrl) {
    return c.json({ error: 'destination must be a URL' }, 400)
  }

  const { error } = await supabase
    .from('warp_logs')
    .insert({ destination, label })

  if (error) {
    console.error('warp insert error', error)
    return c.json({ error: 'Failed to log warp' }, 500)
  }

  return c.json({ ok: true })
})

// GET /api/warps/top
// Return the most-warped destinations (public, used by Warp Terminal UI in Phase 5)
warps.get('/top', rateLimit(60, 60_000), async (c) => {
  const { data, error } = await supabase
    .rpc('top_warp_destinations', { limit_n: 20 })

  if (error) {
    console.error('warp top error', error)
    return c.json({ error: 'Failed to fetch top warps' }, 500)
  }

  return c.json({ destinations: data ?? [] })
})
