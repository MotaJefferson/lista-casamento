import { createClient } from '@/lib/supabase/server'
import { getGuestSession } from '@/lib/utils/auth-helpers'

export async function GET() {
  try {
    const session = await getGuestSession()

    if (!session) {
      return Response.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse session to get email
    const [email] = session.split(':')
    const decodedEmail = Buffer.from(email, 'base64').toString('utf-8')

    const supabase = await createClient()

    // Get ALL purchases for this email (no status filter)
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('guest_email', decodedEmail)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get gift details for each purchase
    const purchasesWithGifts = await Promise.all(
      (purchases || []).map(async (purchase) => {
        const { data: gift } = await supabase
          .from('gifts')
          .select('*')
          .eq('id', purchase.gift_id)
          .single()

        return { ...purchase, gift }
      })
    )

    return Response.json(purchasesWithGifts)
  } catch (error) {
    console.error('[v0] GET /api/guest/purchases error:', error)
    return Response.json(
      { message: 'Error fetching purchases' },
      { status: 500 }
    )
  }
}