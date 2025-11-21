import { getAdminSession } from '@/lib/utils/auth-helpers'

export async function GET() {
  try {
    const session = await getAdminSession()

    if (!session) {
      return Response.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse session to get user info
    const [userId] = session.split(':')

    return Response.json({
      user: {
        id: userId,
        username: 'Admin User', // In production, fetch from DB
      },
    })
  } catch (error) {
    console.error('[v0] Session check error:', error)
    return Response.json(
      { message: 'Error checking session' },
      { status: 500 }
    )
  }
}
