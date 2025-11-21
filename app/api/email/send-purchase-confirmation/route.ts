import { createClient } from '@/lib/supabase/server'
import { getTransporter } from '@/lib/email/transporter'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return Response.json(
        { message: 'Missing purchase ID' },
        { status: 400 }
      )
    }

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (purchaseError || !purchase) {
      throw new Error('Purchase not found')
    }

    // Get gift details
    const { data: gift } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', purchase.gift_id)
      .single()

    if (!gift) {
      throw new Error('Gift not found')
    }

    // Get config
    const { data: config } = await supabase
      .from('site_config')
      .select('couple_name, notification_email')
      .eq('id', 1)
      .single()

    const transporter = await getTransporter()
    if (!transporter) {
      console.warn('[v0] Email service not configured, skipping purchase confirmation')
      return Response.json({ success: true, skipped: true })
    }

    // Send to guest
    const guestTemplate = emailTemplates.purchaseConfirmation(
      purchase.guest_email,
      gift.name,
      parseFloat(gift.price.toString()),
      purchase.payment_id || 'PENDENTE',
      config?.couple_name || 'Os Noivos'
    )

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: purchase.guest_email,
      subject: guestTemplate.subject,
      html: guestTemplate.html,
    })

    // Send to admin
    if (config?.notification_email) {
      const adminTemplate = emailTemplates.purchaseNotificationAdmin(
        purchase.guest_email,
        gift.name,
        parseFloat(gift.price.toString()),
        purchase.payment_id || 'PENDENTE'
      )

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: config.notification_email,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      })
    }

    // Log emails
    await supabase.from('email_logs').insertMany([
      {
        recipient_email: purchase.guest_email,
        subject: guestTemplate.subject,
        email_type: 'purchase_confirmation',
        status: 'sent',
        sent_at: new Date().toISOString(),
      },
      {
        recipient_email: config?.notification_email,
        subject: adminTemplate.subject,
        email_type: 'purchase_notification',
        status: 'sent',
        sent_at: new Date().toISOString(),
      },
    ])

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Send purchase confirmation error:', error)

    return Response.json(
      { message: 'Error sending email' },
      { status: 500 }
    )
  }
}
