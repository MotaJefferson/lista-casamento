import { hashPassword } from '@/lib/utils/encryption'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return Response.json(
        { error: 'Password required' },
        { status: 400 }
      )
    }

    const hash = hashPassword(password)

    return Response.json({ hash })
  } catch (error) {
    console.error('Generate hash error:', error)
    return Response.json(
      { error: 'Error generating hash' },
      { status: 500 }
    )
  }
}
