import { createClient } from '@/lib/supabase/server'
import { getTransporter } from '@/lib/email/transporter'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { name, email, phone, guests_count, message } = body

    if (!name) return Response.json({ message: 'Nome é obrigatório' }, { status: 400 })

    // 1. Salvar no Banco
    const { error } = await supabase.from('rsvp_guests').insert({
        name, email, phone, guests_count: parseInt(guests_count), message
    })

    if (error) throw error

    // 2. Carregar Configurações
    const { data: config } = await supabase.from('site_config').select('*').single()
    
    if (config) {
        const transporter = await getTransporter()
        
        if (transporter) {
            // A. Enviar Confirmação para o Convidado (se tiver e-mail)
            if (email) {
                const guestTemplate = emailTemplates.rsvpConfirmation(name, parseInt(guests_count), config)
                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: email,
                    subject: guestTemplate.subject,
                    html: guestTemplate.html,
                })
            }

            // B. Enviar Notificação para o Admin (VOCÊ)
            if (config.notification_email) {
                const adminTemplate = emailTemplates.rsvpNotificationAdmin({
                    name, email, phone, guests_count, message
                })
                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: config.notification_email,
                    subject: adminTemplate.subject,
                    html: adminTemplate.html,
                })
            }
        }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('RSVP Error:', error)
    return Response.json({ message: 'Erro ao confirmar presença' }, { status: 500 })
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