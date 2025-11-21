import { cookies } from 'next/headers'

export async function getAdminSession() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value
}

export async function getGuestSession() {
  const cookieStore = await cookies()
  return cookieStore.get('guest_session')?.value
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return !!session
}

export async function isGuestAuthenticated(): Promise<boolean> {
  const session = await getGuestSession()
  return !!session
}

export function decodeGuestEmail(session: string): string {
  const [email] = session.split(':')
  return Buffer.from(email, 'base64').toString('utf-8')
}
