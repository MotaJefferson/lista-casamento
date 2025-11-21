import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('guest_session')

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Guest logout error:', error)
    return Response.json(
      { message: 'Error processing logout' },
      { status: 500 }
    )
  }
}
