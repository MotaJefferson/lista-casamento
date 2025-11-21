import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { email, code } = await request.json()

    if (!email || !code) {
      return Response.json(
        { message: 'Email and code required' },
        { status: 400 }
      )
    }

    // Find valid session
    const { data: session, error } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('email', email)
      .eq('otp_code', code)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !session) {
      return Response.json(
        { message: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    // Check attempts
    if (session.attempts >= 3) {
      return Response.json(
        { message: 'Too many attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    // Mark session as verified by updating attempts
    const token = Buffer.from(`${email}:${session.id}:${Date.now()}`).toString('base64')

    const cookieStore = await cookies()
    cookieStore.set('guest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    })

    // Delete the session from database
    await supabase
      .from('guest_sessions')
      .delete()
      .eq('id', session.id)

    return Response.json({
      success: true,
      email,
    })
  } catch (error) {
    console.error('[v0] Verify OTP error:', error)
    return Response.json(
      { message: 'Error verifying OTP' },
      { status: 500 }
    )
  }
}
