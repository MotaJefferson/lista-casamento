import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'crypto'
import fetch from 'node-fetch'

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { email } = await request.json()

    if (!email) {
      return Response.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for existing sessions (limit to 3 per day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: existingSessions, error: countError } = await supabase
      .from('guest_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (countError) throw countError

    if ((existingSessions?.length || 0) >= 3) {
      return Response.json(
        { message: 'Too many OTP requests. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create session
    const { error: insertError } = await supabase
      .from('guest_sessions')
      .insert({
        email,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) throw insertError

    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/email/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
    } catch (emailError) {
      console.error('[v0] Failed to send OTP email:', emailError)
    }

    return Response.json({
      success: true,
      message: 'OTP sent to email',
    })
  } catch (error) {
    console.error('[v0] Request OTP error:', error)
    return Response.json(
      { message: 'Error processing request' },
      { status: 500 }
    )
  }
}
