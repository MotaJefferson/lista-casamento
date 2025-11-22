import { createClient } from '@/lib/supabase/server'
import { getGuestSession } from '@/lib/utils/auth-helpers'

export async function GET() {
  try {
    const session = await getGuestSession()

    if (!session) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    // CORREÇÃO DA LÓGICA DE DECODIFICAÇÃO:
    // 1. Decodifica o token completo (que está em base64)
    const sessionContent = Buffer.from(session, 'base64').toString('utf-8')
    
    // 2. O formato é "email:timestamp", então separamos pelo ":"
    // Pegamos apenas a primeira parte (o email)
    const emailPart = sessionContent.split(':')[0]
    
    // 3. Limpeza final do email
    const decodedEmail = emailPart.trim().toLowerCase()

    console.log('[v0] Searching purchases for:', decodedEmail) // Log para debug

    const supabase = await createClient()

    // Busca compras usando filtro insensível a caixa (ilike)
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .ilike('guest_email', decodedEmail) 
      .order('created_at', { ascending: false })

    if (error) throw error

    // Busca os detalhes dos presentes
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