import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { name, email, phone, guests_count, message } = body

    if (!name) return Response.json({ message: 'Nome é obrigatório' }, { status: 400 })

    const { error } = await supabase.from('rsvp_guests').insert({
        name,
        email,
        phone,
        guests_count: parseInt(guests_count),
        message
    })

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('RSVP Error:', error)
    return Response.json({ message: 'Erro ao confirmar presença' }, { status: 500 })
  }
}

export async function GET() {
    // Rota para o admin listar (protegida)
    try {
        const supabase = await createClient()
        // TODO: Adicionar verificação de admin aqui se necessário, 
        // mas a política RLS já deve proteger se o usuário não estiver logado
        
        const { data, error } = await supabase.from('rsvp_guests').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return Response.json(data)
    } catch (error) {
        return Response.json({ message: 'Erro ao buscar lista' }, { status: 500 })
    }
}