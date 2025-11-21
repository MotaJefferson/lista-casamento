import { createClient } from '@/lib/supabase/server'
import type { SiteConfig } from '@/lib/types/database'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) throw error

    return Response.json(data || {})
  } catch (error) {
    console.error('[v0] GET /api/config error:', error)
    return Response.json(
      { message: 'Error fetching config' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // TODO: Add admin auth check

    const { data, error } = await supabase
      .from('site_config')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('[v0] PATCH /api/config error:', error)
    return Response.json(
      { message: 'Error updating config' },
      { status: 500 }
    )
  }
}
