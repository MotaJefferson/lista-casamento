import { createClient } from '@/lib/supabase/server'
import { getTransporter } from '@/lib/email/transporter'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { email, otp } = await request.json()

    // Busca configurações personalizadas
    const { data: config } = await supabase.from('site_config').select('email_otp_subject, email_otp_content').single()

    const transporter = await getTransporter()
    if (!transporter) return Response.json({ success: true, skipped: true })

    const template = emailTemplates.otpCode(
        email, 
        otp, 
        config?.email_otp_subject || undefined, 
        config?.email_otp_content || undefined
    )

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: template.subject,
      html: template.html,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: 'Error sending email' }, { status: 500 })
  }
}