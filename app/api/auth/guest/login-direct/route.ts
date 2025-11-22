import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ message: 'Email obrigatório' }, { status: 400 })
    }

    // Cria a sessão diretamente (sem OTP)
    // Formato: email:timestamp
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')

    const cookieStore = await cookies()
    cookieStore.set('guest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ message: 'Erro ao entrar' }, { status: 500 })
  }
}