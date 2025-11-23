import { createClient } from '@/lib/supabase/server'
import { getTransporter } from '@/lib/email/transporter'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { name, email, phone, guests_count, message } = body

    if (!name) return Response.json({ message: 'Nome é obrigatório' }, { status: 400 })

    // Salvar
    const { error } = await supabase.from('rsvp_guests').insert({
        name, email, phone, guests_count: parseInt(guests_count), message
    })

    if (error) throw error

    // Enviar E-mail
    if (email) {
        const { data: config } = await supabase.from('site_config').select('*').single()
        if (config) {
            const transporter = await getTransporter()
            if (transporter) {
                const template = emailTemplates.rsvpConfirmation(name, parseInt(guests_count), config)
                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: email,
                    subject: template.subject,
                    html: template.html,
                })
            }
        }
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: 'Erro' }, { status: 500 })
  }
}

export async function GET() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.from('rsvp_guests').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return Response.json(data)
    } catch (error) {
        return Response.json({ message: 'Erro ao buscar lista' }, { status: 500 })
    }
}