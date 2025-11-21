import { createClient } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/utils/encryption';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { username, password } = await request.json();

    console.log('[v0] Login attempt with username:', username);

    if (!username || !password) {
      console.log('[v0] Missing credentials');
      return Response.json(
        { message: 'Username and password required' },
        { status: 400 }
      );
    }

    console.log('[v0] Querying admin_users table for username:', username);
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, username, email, password_hash')
      .eq('username', username)
      .single();

    console.log('[v0] Query error:', error);
    console.log('[v0] Admin user found:', adminUser ? 'yes' : 'no');

    if (error || !adminUser) {
      console.log('[v0] Admin user not found or query error:', error?.message);
      return Response.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('[v0] Admin user password_hash exists:', !!adminUser.password_hash);
    console.log('[v0] Password hash format check:', adminUser.password_hash?.includes(':'));
    console.log('[v0] Verifying password...');

    const passwordValid = await verifyPassword(password, adminUser.password_hash);

    console.log('[v0] Password valid:', passwordValid);

    if (!passwordValid) {
      return Response.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('[v0] Creating session...');

    const cookieStore = await cookies();
    const token = Buffer.from(`${adminUser.id}:${Date.now()}`).toString('base64');

    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 60,
    });

    console.log('[v0] Session created successfully');

    return Response.json({
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
      },
    });
  } catch (error) {
    console.error('[v0] Admin login error:', error);
    return Response.json(
      { message: 'Error processing login' },
      { status: 500 }
    );
  }
}
