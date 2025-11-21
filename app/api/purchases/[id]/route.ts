import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const purchaseId = id

    console.log('[v0] GET /api/purchases/[id] - purchaseId:', purchaseId)

    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (error) {
      console.error('[v0] Purchase fetch error:', error)
      return Response.json(
        { message: 'Purchase not found', error: error.message },
        { status: 404 }
      )
    }

    if (!purchase) {
      return Response.json(
        { message: 'Purchase not found' },
        { status: 404 }
      )
    }

    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', purchase.gift_id)
      .single()

    if (giftError) {
      console.error('[v0] Gift fetch error:', giftError)
    }

    return Response.json({ purchase, gift: gift || null })
  } catch (error) {
    console.error('[v0] Get purchase error:', error)
    return Response.json(
      { message: 'Error fetching purchase', error: error instanceof Error ? error.message : 'Unknown error' },
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
    const purchaseId = id

    // TODO: Add admin auth check

    // Only allow deletion of pending purchases
    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('payment_status')
      .eq('id', purchaseId)
      .single()

    if (fetchError || !purchase) {
      return Response.json(
        { message: 'Purchase not found' },
        { status: 404 }
      )
    }

    if (purchase.payment_status !== 'pending') {
      return Response.json(
        { message: 'Only pending purchases can be deleted' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', purchaseId)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] DELETE /api/purchases error:', error)
    return Response.json(
      { message: 'Error deleting purchase' },
      { status: 500 }
    )
  }
}