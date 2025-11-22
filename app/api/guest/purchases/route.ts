import { createClient } from '@/lib/supabase/server'
import { getGuestSession } from '@/lib/utils/auth-helpers'

export async function GET() {
  try {
    const session = await getGuestSession()

    if (!session) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    // Decodifica o email da sessão
    const [email] = session.split(':')
    let decodedEmail = Buffer.from(email, 'base64').toString('utf-8')
    
    // CORREÇÃO CRÍTICA: Normaliza para minúsculo e remove espaços
    decodedEmail = decodedEmail.trim().toLowerCase()

    const supabase = await createClient()

    // Busca compras usando filtro insensível a caixa (ilike ou normalização manual)
    // Como o Supabase/Postgres é case sensitive por padrão, a melhor prática é garantir
    // que salvamos e buscamos tudo em minúsculo.
    
    // Aqui buscamos usando 'ilike' para ignorar maiúsculas/minúsculas no banco
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .ilike('guest_email', decodedEmail) // Mudou de .eq para .ilike
      .order('created_at', { ascending: false })

    if (error) throw error

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