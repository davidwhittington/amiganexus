import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import { adminAuth } from '../middleware/adminAuth'
import { rateLimit } from '../middleware/rateLimit'

export const signals = new Hono()

// GET /api/signals
// Public — return all published news posts, newest first.
signals.get('/', rateLimit(60, 60_000), async (c) => {
  const { data, error } = await supabase
    .from('signal_posts')
    .select('id, title, body, date, tags, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('signals fetch error', error)
    return c.json({ error: 'Failed to fetch signals' }, 500)
  }

  return c.json({ posts: data ?? [] })
})

// POST /api/signals
// Admin only — create a new news post.
// Body: { title, body, tags?, date? }
signals.post('/', adminAuth, rateLimit(10, 60_000), async (c) => {
  let body: {
    title?:  string
    body?:   string
    tags?:   string[]
    date?:   string
  }

  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const { title, body: postBody, tags = [], date } = body

  if (!title?.trim())    return c.json({ error: 'title is required' }, 400)
  if (!postBody?.trim()) return c.json({ error: 'body is required' }, 400)

  // Use provided date or today in YYYY.MM.DD Nexus format
  const postDate = date ?? new Date().toISOString().slice(0, 10).replace(/-/g, '.')

  const { data, error } = await supabase
    .from('signal_posts')
    .insert({
      title:        title.trim(),
      body:         postBody.trim(),
      tags,
      date:         postDate,
      published:    true,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('signals insert error', error)
    return c.json({ error: 'Failed to create post' }, 500)
  }

  return c.json({ ok: true, id: data.id }, 201)
})

// DELETE /api/signals/:id
// Admin only — unpublish a post.
signals.delete('/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id' }, 400)

  const { error } = await supabase
    .from('signal_posts')
    .update({ published: false })
    .eq('id', id)

  if (error) {
    console.error('signals delete error', error)
    return c.json({ error: 'Failed to unpublish post' }, 500)
  }

  return c.json({ ok: true })
})
