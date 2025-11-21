import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id } = await params

    // TODO: Add admin auth check

    const { data, error } = await supabase
      .from('gifts')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('[v0] PATCH /api/gifts error:', error)
    return Response.json(
      { message: 'Error updating gift' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // TODO: Add admin auth check

    // First check if gift exists
    const { data: gift, error: checkError } = await supabase
      .from('gifts')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !gift) {
      return Response.json(
        { message: 'Gift not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Delete error details:', error)
      throw error
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] DELETE /api/gifts error:', error)
    return Response.json(
      { 
        message: error instanceof Error ? error.message : 'Error deleting gift',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
