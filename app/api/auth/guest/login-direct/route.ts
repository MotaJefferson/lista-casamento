import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ message: 'Email obrigatório' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Cria a sessão sem maxAge (Cookie de Sessão - morre ao fechar o navegador)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')

    const cookieStore = await cookies()
    cookieStore.set('guest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // Removido maxAge: 60 * 60 * 24 * 30
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ message: 'Erro ao entrar' }, { status: 500 })
  }
}