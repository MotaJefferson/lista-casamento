import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { hash } = await request.json()

    if (!hash) {
      return Response.json(
        { message: 'Hash required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_session', hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 60,
    })

    return Response.json({
      success: true,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Hash login error:', error)
    return Response.json(
      { message: 'Error processing login' },
      { status: 500 }
    )
  }
}
