import { createClient } from '@/lib/supabase/server'
import { getTransporter } from '@/lib/email/transporter'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { purchaseId } = await request.json()

    if (!purchaseId) return Response.json({ message: 'Missing ID' }, { status: 400 })

    // Buscar dados completos da compra e do presente
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (!purchase) throw new Error('Purchase not found')

    const { data: gift } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', purchase.gift_id)
      .single()

    if (!gift) throw new Error('Gift not found')

    // Buscar configurações
    const { data: config } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .single()

    const transporter = await getTransporter()
    if (!transporter) return Response.json({ success: true, skipped: true })

    // 1. E-mail para o Convidado
    const guestTemplate = emailTemplates.purchaseConfirmation(
      purchase.guest_email,
      gift.name,
      parseFloat(gift.price.toString()),
      purchase.payment_id || 'PENDENTE',
      config?.couple_name || 'Os Noivos',
      config?.email_confirmation_subject || undefined,
      config?.email_confirmation_content || undefined
    )

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: purchase.guest_email,
      subject: guestTemplate.subject,
      html: guestTemplate.html,
    })

    // 2. E-mail para o Admin (VOCÊ)
    if (config?.notification_email) {
      const adminTemplate = emailTemplates.purchaseNotificationAdmin(
        purchase.guest_email,
        gift.name,
        parseFloat(gift.price.toString()),
        purchase.payment_id || 'PENDENTE',
        purchase.guest_name // Passando o nome do convidado
      )

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: config.notification_email,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Send email error:', error)
    return Response.json({ message: 'Error sending email' }, { status: 500 })
  }
}