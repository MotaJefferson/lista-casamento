import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export async function POST(request: Request) {
  try {
    const { username = 'admin', password = 'wedding123', email = 'admin@wedding.local' } = await request.json();

    console.log('[v0] Creating admin user with username:', username);

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const passwordHash = hashPassword(password);
    console.log('[v0] Password hash generated, length:', passwordHash.length);

    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      console.log('[v0] Admin user already exists, deleting old one');
      await supabase
        .from('admin_users')
        .delete()
        .eq('username', username);
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          username,
          email,
          password_hash: passwordHash,
        },
      ])
      .select();

    if (error) {
      console.error('[v0] Admin setup error:', error);
      return Response.json(
        { error: error.message || 'Failed to create admin user' },
        { status: 400 }
      );
    }

    console.log('[v0] Admin user created successfully:', data);
    return Response.json(
      {
        success: true,
        message: 'Admin user created successfully',
        username,
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Setup endpoint error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
