import { createClient } from '@/lib/supabase/server'
import type { Gift } from '@/lib/types/database'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error('[v0] GET /api/gifts error:', error)
    return Response.json(
      { message: 'Error fetching gifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, description, price, image_url } = body

    // TODO: Add admin auth check

    const { data, error } = await supabase
      .from('gifts')
      .insert({
        name,
        description,
        price,
        image_url,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('[v0] POST /api/gifts error:', error)
    return Response.json(
      { message: 'Error creating gift' },
      { status: 500 }
    )
  }
}
