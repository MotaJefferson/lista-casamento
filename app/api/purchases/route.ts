import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // TODO: Add admin auth check

    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error('[v0] GET /api/purchases error:', error)
    return Response.json(
      { message: 'Error fetching purchases' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { giftId, guestEmail, guestName } = await request.json()

    console.log('[v0] POST /api/purchases - giftId:', giftId, 'email:', guestEmail)

    if (!giftId || !guestEmail) {
      return Response.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) {
      return Response.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get gift details
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single()

    if (giftError || !gift) {
      console.error('[v0] Gift not found:', giftError)
      throw new Error('Gift not found')
    }

    // Create purchase record
    const purchaseData: any = {
      gift_id: giftId,
      guest_email: guestEmail,
      amount: gift.price,
      payment_status: 'pending',
    }
    
    if (guestName) {
      purchaseData.guest_name = guestName
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single()

    if (purchaseError) {
      console.error('[v0] Purchase creation error:', purchaseError)
      throw purchaseError
    }

    console.log('[v0] Purchase created:', purchase.id)

    return Response.json({
      purchaseId: purchase.id,
      success: true,
    })
  } catch (error) {
    console.error('[v0] POST /api/purchases error:', error)
    return Response.json(
      { message: error instanceof Error ? error.message : 'Error creating purchase' },
      { status: 500 }
    )
  }
}
