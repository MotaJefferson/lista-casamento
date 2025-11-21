import { createClient } from '@/lib/supabase/server'
import { getTransporter } from '@/lib/email/transporter'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return Response.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const transporter = await getTransporter()
    if (!transporter) {
      console.warn('[v0] Email service not configured, skipping OTP email')
      return Response.json({ success: true, skipped: true })
    }

    const template = emailTemplates.otpCode(email, otp)

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: template.subject,
      html: template.html,
    })

    // Log email
    await supabase.from('email_logs').insert({
      recipient_email: email,
      subject: template.subject,
      email_type: 'otp',
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    console.log('[v0] OTP email sent:', info.messageId)

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Send OTP email error:', error)

    return Response.json(
      { message: 'Error sending email' },
      { status: 500 }
    )
  }
}
